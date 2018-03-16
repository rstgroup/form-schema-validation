import {
    pick,
    arraysDifference,
    getFieldType,
    getFieldDefaultValue,
    wrapToArray,
    removeFirstKeyIfNumber,
    getErrorIndexFromKeys,
    isPromise,
} from './helpers';

import OrOperator from './operators/OrOperator';
import SchemaType from './SchemaType';
import Field from './Field';
import ValidationErrors from './ValidationErrors';

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
        this.fields = Field.createFieldsFromRawSchema(schema, messages);
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
            const promises = this.handleEveryFieldValidator(model);
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
            this.errors[key][index] = ValidationErrors.mergeErrors(this.errors[key][index], error);
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
        const schemaKeys = this.fields.map(field => field.key);
        const keysDiff = arraysDifference(modelKeys, schemaKeys);
        keysDiff.forEach((key) => {
            const errorMessage = this.messages.notDefinedKey(key);
            this.setError(key, errorMessage);
        });
    }

    handleSynchronousFieldValidation(model) {
        const schemaKeys = Object.keys(this.schema);
        const validatedObject = pick(model, schemaKeys);

        this.fields.forEach((field) => {
            field.validate(validatedObject);
            if (field.hasErrors()) {
                this.errors[field.key] = field.getErrors();
            }
        });
    }

    handleAsyncFieldValidation(model) {
        let promises = [];

        this.fields.forEach((field) => {
            const values = field.getValues(model);
            const firstValue = values[0];
            const result = this.validateCustomValidators({
                validators: field.validators,
                value: firstValue,
                fieldSchema: field,
                validatedObject: model,
                key: field.key,
            });
            promises = promises.concat(result);
        });

        return promises;
    }

    handleEveryFieldValidator(model) {
        this.handleSynchronousFieldValidation(model);
        const promises = this.handleAsyncFieldValidation(model);
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

    registerType(type) {
        this.fields.forEach(field => field.registerType(type));
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
