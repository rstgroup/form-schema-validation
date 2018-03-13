import {
    pick,
    arraysDifference,
    getFieldType,
    getFieldDefaultValue,
    wrapToArray,
    getFunctionName,
    removeFirstKeyIfNumber,
    getErrorIndexFromKeys,
    mergeErrors,
    isPromise,
} from './helpers';

import validateArray from './validators/array';
import validateBoolean from './validators/boolean';
import validateDate from './validators/date';
import validateNumber from './validators/number';
import validateObject from './validators/object';
import validateString from './validators/string';

import OrOperator from './operators/OrOperator';
import SchemaType from './SchemaType';
import * as defaultErrorMessages from './defaultErrorMessages';

export const operators = {
    or(types) {
        return new OrOperator(types);
    },
};

export default class Schema {
    static oneOfTypes(types) {
        // eslint-disable-next-line no-console
        console.warn('[Deprecated] Pleas use `Schema.operators.or` instead');
        return operators.or(types);
    }
    static optionalType(type, uniqueTypeName = '') {
        const fieldType = getFieldType({ type });
        const { name = 'Type' } = fieldType;
        return new SchemaType(`Optional${name}${uniqueTypeName}`, {
            getDefaultValue() {
                return undefined;
            },
            validator(value, key, index) {
                if (value === null || value === undefined) {
                    return true;
                }
                return this.validateType(type, value, key, index);
            },
            requiredValidator(value, key) {
                this.validateRequired({ type, required: true }, value, key);
                return true;
            },
        });
    }

    constructor(schema, messages, validateKeys = true) {
        this.schema = schema;
        this.errors = {};
        this.additionalValidators = new Set();
        this.messages = { ...defaultErrorMessages, ...messages };
        this.validateKeys = validateKeys;

        this.validateTypeSchema = this.validateTypeSchema.bind(this);
        this.validateRequiredType = this.validateRequiredType.bind(this);
        this.validateRequiredTypeObject = this.validateRequiredTypeObject.bind(this);
        this.validateRequiredTypeDate = this.validateRequiredTypeDate.bind(this);
        this.validateRequiredTypeNumber = this.validateRequiredTypeNumber.bind(this);
        this.validateRequiredTypeArray = this.validateRequiredTypeArray.bind(this);

        this.typesValidators = {
            Array: this.handleTypeValidation.bind(this, validateArray),
            Boolean: this.handleTypeValidation.bind(this, validateBoolean),
            Date: this.handleTypeValidation.bind(this, validateDate),
            Number: this.handleTypeValidation.bind(this, validateNumber),
            Object: this.handleTypeValidation.bind(this, validateObject),
            String: this.handleTypeValidation.bind(this, validateString),
        };

        this.typesRequiredValidators = {
            String: this.validateRequiredType,
            Number: this.validateRequiredTypeNumber,
            Object: this.validateRequiredTypeObject,
            Array: this.validateRequiredTypeArray,
            Boolean: this.validateRequiredType,
            Date: this.validateRequiredTypeDate,
        };
    }

    getDefaultValues() {
        const fieldsKeys = Object.keys(this.schema);
        const defaultValues = {};

        fieldsKeys.forEach((key) => {
            const field = this.getField(key);
            const fieldType = getFieldType(field);
            let defaultValue;
            if (!field.disableDefaultValue) {
                const isTypeAnArray = Array.isArray(field.type);
                if (fieldType instanceof Schema) {
                    defaultValue = fieldType.getDefaultValues();
                } else {
                    defaultValue = getFieldDefaultValue(field);
                }
                defaultValues[key] = isTypeAnArray ? wrapToArray(defaultValue) : defaultValue;
            }
        });

        return defaultValues;
    }

    getField(name) {
        return this.schema[name];
    }

    getFields() {
        return this.schema;
    }

    validate(model) {
        this.errors = {};
        if (model) {
            this.handleModelKeysNotDefinedInSchema(model);
            const promises = this.checkTypesAndValidators(model);
            if (promises.length > 0) {
                return Promise.all(promises).then(() => this.errors);
            }
        } else {
            this.setMissingModelError();
        }
        return this.errors;
    }

    setError(key, error, index) {
        if (!this.errors[key]) this.errors[key] = [];
        if (index > -1) {
            this.errors[key][index] = mergeErrors(this.errors[key][index], error);
            return;
        }
        this.errors[key].push(error);
    }

    setModelError(path, message) {
        let error = message;
        const pathKeys = path.split('.');
        const [firstKey, ...keys] = pathKeys;
        const errorIndex = getErrorIndexFromKeys(keys);
        const field = this.getField(firstKey);
        const fieldType = getFieldType(field);
        if (fieldType instanceof Schema) {
            const virtualSchema = new Schema(fieldType.schema);
            const childPath = removeFirstKeyIfNumber(keys).join('.');
            virtualSchema.setModelError(childPath, message);
            error = virtualSchema.errors;
        }
        this.setError(firstKey, error, errorIndex);
    }

    setMissingModelError() {
        const errorMessage = this.messages.modelIsUndefined();
        this.setError('model', errorMessage);
    }

    handleModelKeysNotDefinedInSchema(model) {
        if (!this.validateKeys) {
            return;
        }
        const modelKeys = Object.keys(model);
        const schemaKeys = Object.keys(this.schema);
        const keysDiff = arraysDifference(modelKeys, schemaKeys);
        keysDiff.forEach((key) => {
            const errorMessage = this.messages.notDefinedKey(key);
            this.setError(key, errorMessage);
        });
    }

    checkTypesAndValidators(model) {
        let promises = [];
        const schemaKeys = Object.keys(this.schema);
        const validatedObject = pick(model, schemaKeys);
        schemaKeys.forEach((key) => {
            const value = validatedObject[key];
            const fieldSchema = this.schema[key];
            const isArrayOfType = Array.isArray(fieldSchema.type);
            const fieldType = isArrayOfType ? fieldSchema.type[0] : fieldSchema.type;
            if (isArrayOfType && this.validateType(Array, value)) {
                value.forEach((item, index) => {
                    this.validateType(fieldType, item, key, index);
                });
            } else {
                this.validateType(fieldType, value, key);
            }
            this.validateRequired(fieldSchema, value, key);
            promises = promises.concat(this.validateCustomValidators({
                validators: fieldSchema.validators,
                value,
                fieldSchema,
                validatedObject,
                key,
            }));
        });
        return promises.concat(this.validateAdditionalValidators(model));
    }

    resolveValidatorErrorsForKey(key, errorMessage, results) {
        if (typeof results === 'boolean' && !results) {
            this.setError(key, errorMessage);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach((result) => {
                this.resolveValidatorErrorsForKey(key, errorMessage, result);
            });
            return;
        }
        if (typeof results === 'string') {
            this.resolveValidatorErrorsForKey(key, results, false);
        }
    }

    validateCustomValidators({ validators, value, fieldSchema, validatedObject, key }) {
        const promises = [];
        if (Array.isArray(validators)) {
            validators.forEach(({ validator, errorMessage }) => {
                const results = validator(value, fieldSchema, validatedObject);
                if (isPromise(results)) {
                    const promise = results.then((result) => {
                        this.resolveValidatorErrorsForKey(key, errorMessage, result);
                    });
                    promises.push(promise);
                    return;
                }
                this.resolveValidatorErrorsForKey(key, errorMessage, results);
            });
        }
        return promises;
    }

    validateAdditionalValidators(model) {
        const promises = [];
        this.additionalValidators.forEach((validator) => {
            const results = validator(model, this);
            if (isPromise(results)) {
                promises.push(results);
            }
        });
        return promises;
    }

    validateRequired(fieldSchema, value, key) {
        if (fieldSchema.required) {
            const { name } = fieldSchema.type;
            if (typeof this.typesRequiredValidators[name] === 'function') {
                this.typesRequiredValidators[name](value, key);
                return;
            }
            if (fieldSchema.type instanceof Schema) {
                this.validateRequiredTypeSchema(fieldSchema.type.schema, value, key);
                return;
            }
            this.validateRequiredType(value, key);
        }
    }

    validateRequiredType(value, key) {
        if (!value || value.length === 0) {
            const { label } = this.getField(key);
            this.setError(key, this.messages.validateRequired(label || key));
        }
    }

    validateRequiredTypeObject(value, key) {
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            return;
        }
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateRequired(label || key));
    }

    validateRequiredTypeArray(value, key) {
        if (Array.isArray(value) && value.length > 0) {
            return;
        }
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateRequired(label || key));
    }

    validateRequiredTypeNumber(value, key) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            const { label } = this.getField(key);
            this.setError(key, this.messages.validateRequired(label || key));
        }
    }

    validateRequiredTypeDate(value, key) {
        if (value instanceof Date) {
            return;
        }
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateRequired(label || key));
    }

    validateRequiredTypeSchema(schema, value, key) {
        if (typeof value === 'object' && value !== null) {
            let hasRequiredKeys = true;
            const valueKeys = Object.keys(value);
            Object.keys(schema).forEach((requiredKey) => {
                if (valueKeys.indexOf(requiredKey) < 0) {
                    hasRequiredKeys = false;
                }
            });
            if (hasRequiredKeys) {
                return;
            }
        }
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateRequired(label || key));
    }

    validateType(type, value, key, index) {
        const typeName = getFunctionName(type);
        this.registerTypeIfNotExists(type, typeName);

        if (typeof this.typesValidators[typeName] === 'function') {
            return this.typesValidators[typeName](value, key, type, index);
        }
        if (type instanceof Schema) {
            return this.validateTypeSchema(value, key, type, index);
        }
        if (type instanceof OrOperator) {
            return this.validateOrOperator(value, key, type, index);
        }
        throw new Error(`Unrecognized type ${typeName}`);
    }

    handleTypeValidation(validate, value, key, index) {
        if (typeof validate !== 'function') {
            throw new Error('Uknown validator');
        }
        const result = validate(value);
        if (!result) {
            const { label } = this.getField(key);
            this.setError(key, this.messages.validateString(label || key), index);
        }
        return result;
    }

    validateTypeSchema(value, subSchemaKey, type, index) {
        const errors = type.validate(value);
        const keys = Object.keys(errors);
        if (keys.length === 0) return true;
        this.setError(subSchemaKey, errors, index);
        return false;
    }

    validateOrOperator(value, key, type, index) {
        const schema = new Schema(type.getSchema());
        const errors = schema.validate(type.parseValue(value));
        const keys = Object.keys(errors);
        if (keys.length < type.getTypes().length) return true;
        this.setError(key, errors, index);
        return false;
    }

    pick(fieldsToPick) {
        const fields = {};
        fieldsToPick.forEach((fieldName) => {
            fields[fieldName] = this.schema[fieldName];
        });
        return fields;
    }

    omit(fieldsToOmit) {
        const fields = {};
        Object.keys(this.schema).forEach((fieldName) => {
            if (fieldsToOmit.indexOf(fieldName) > -1) {
                return;
            }
            fields[fieldName] = this.schema[fieldName];
        });
        return fields;
    }

    extend(fieldsToExtend) {
        Object.keys(fieldsToExtend).forEach((fieldName) => {
            this.schema[fieldName] = fieldsToExtend[fieldName];
        });
    }

    registerTypeIfNotExists(type, typeName) {
        if (type instanceof SchemaType && typeof this.typesValidators[typeName] !== 'function') {
            this.registerType(type);
        }
    }

    registerType(type) {
        const { name, validator, requiredValidator } = type;
        this.typesValidators[name] = validator.bind(this);
        if (requiredValidator) {
            this.typesRequiredValidators[name] = requiredValidator.bind(this);
        }
    }

    addValidator(validator) {
        if (typeof validator === 'function') {
            this.additionalValidators.add(validator);
        }
    }

    removeValidator(validator) {
        this.additionalValidators.delete(validator);
    }
}

Schema.operators = operators;
