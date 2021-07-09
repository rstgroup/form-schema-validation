import {
    pick,
    arraysDifference,
    getFieldType,
    getDefaultValueForType,
    getDefaultValueFromOptions,
    wrapToArray,
    getFunctionName,
    removeFirstKeyIfNumber,
    getErrorIndexFromKeys,
    mergeErrors,
} from './helpers';
import OneOfTypes from './OneOfTypes';
import SchemaType from './SchemaType';

const defaultMessages = {
    notDefinedKey(fieldName) { return `Key '${fieldName}' is not defined in schema`; },
    modelIsUndefined() { return 'Validated model is undefined'; },
    validateRequired(fieldName) { return `Field '${fieldName}' is required`; },
    validateString(fieldName) { return `Field '${fieldName}' is not a String`; },
    validateNumber(fieldName) { return `Field '${fieldName}' is not a Number`; },
    validateObject(fieldName) { return `Field '${fieldName}' is not a Object`; },
    validateArray(fieldName) { return `Field '${fieldName}' is not a Array`; },
    validateBoolean(fieldName) { return `Field '${fieldName}' is not a Boolean`; },
    validateDate(fieldName) { return `Field '${fieldName}' is not a Date`; },
};

class Schema {
    static oneOfTypes(types) {
        return new OneOfTypes(types);
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
        this.promises = [];
        this.additionalValidators = new Set();
        this.messages = { ...defaultMessages, ...messages };
        this.validateKeys = validateKeys;

        this.validateTypeString = this.validateTypeString.bind(this);
        this.validateTypeNumber = this.validateTypeNumber.bind(this);
        this.validateTypeObject = this.validateTypeObject.bind(this);
        this.validateTypeArray = this.validateTypeArray.bind(this);
        this.validateTypeBoolean = this.validateTypeBoolean.bind(this);
        this.validateTypeDate = this.validateTypeDate.bind(this);
        this.validateTypeSchema = this.validateTypeSchema.bind(this);
        this.validateRequiredType = this.validateRequiredType.bind(this);
        this.validateRequiredTypeObject = this.validateRequiredTypeObject.bind(this);
        this.validateRequiredTypeDate = this.validateRequiredTypeDate.bind(this);
        this.validateRequiredTypeNumber = this.validateRequiredTypeNumber.bind(this);
        this.validateRequiredTypeArray = this.validateRequiredTypeArray.bind(this);

        this.typesValidators = {
            String: this.validateTypeString,
            Number: this.validateTypeNumber,
            Object: this.validateTypeObject,
            Array: this.validateTypeArray,
            Boolean: this.validateTypeBoolean,
            Date: this.validateTypeDate,
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
        const model = {};
        fieldsKeys.forEach((key) => {
            const field = this.getField(key);
            const isArrayOfType = Array.isArray(field.type);
            const fieldType = getFieldType(field);
            if (field.disableDefaultValue) {
                return;
            }
            if (field.defaultValue !== undefined) {
                model[key] = wrapToArray(field.defaultValue, isArrayOfType);
                return;
            }
            if (field.options) {
                model[key] = wrapToArray(
                    getDefaultValueFromOptions(field.options),
                    isArrayOfType,
                );
                return;
            }
            if (fieldType instanceof Schema) {
                model[key] = wrapToArray(
                    fieldType.getDefaultValues(),
                    isArrayOfType,
                );
                return;
            }
            model[key] = getDefaultValueForType(fieldType, isArrayOfType);
        });
        return model;
    }

    getField(name) {
        return { ...this.schema[name], parentSchema: this };
    }

    getFields() {
        return this.schema;
    }

    validate(model) {
        this.errors = {};
        this.promises = [];
        if (this.checkModel(model)) {
            this.checkKeysDiff(model);
            this.checkTypesAndValidators(model);
        }
        if (this.promises.length > 0) {
            return Promise.all(this.promises).then(() => this.errors);
        }
        return this.errors;
    }

    setError(key, error, index) {
        if (!this.errors[key]) {
            this.errors[key] = [];
        }

        const errorMessage = typeof error === 'function'
            ? error()
            : error;

        if (index > -1) {
            this.errors[key][index] = mergeErrors(this.errors[key][index], errorMessage);
            return;
        }

        if (typeof errorMessage === 'object' && this.errors[key] && this.errors[key].length) {
            this.errors[key][0] = mergeErrors(this.errors[key][0], errorMessage);
            return;
        }

        this.errors[key].push(errorMessage);
    }

    setModelError(path, message) {
        let error = message;
        const pathKeys = path.split('.');
        const [firstKey, ...keys] = pathKeys;
        const errorIndex = getErrorIndexFromKeys(keys);
        const field = this.getField(firstKey);
        const fieldType = getFieldType(field);
        if (fieldType instanceof Schema && keys.length > 0) {
            const virtualSchema = new Schema(fieldType.schema);
            const childPath = removeFirstKeyIfNumber(keys).join('.');
            virtualSchema.setModelError(childPath, message);
            error = virtualSchema.errors;
        }
        this.setError(firstKey, error, errorIndex);
    }

    checkModel(model) {
        if (!model) {
            this.setError('model', this.messages.modelIsUndefined());
            return false;
        }
        return true;
    }

    checkKeysDiff(model) {
        if (!this.validateKeys) return;
        const modelKeys = Object.keys(model);
        const schemaKeys = Object.keys(this.schema);
        const keysDiff = arraysDifference(modelKeys, schemaKeys);
        if (keysDiff.length > 0) {
            keysDiff.forEach((key) => {
                this.setError(key, this.messages.notDefinedKey(key));
            });
        }
    }

    checkTypesAndValidators(model) {
        const schemaKeys = Object.keys(this.schema);
        const validatedObject = pick(model, schemaKeys);
        schemaKeys.forEach((key) => {
            const value = validatedObject[key];
            const fieldSchema = this.schema[key];
            const validators = this.getFieldValidators(key);
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
            this.validateCustomValidators({
                validators,
                value,
                fieldSchema,
                validatedObject,
                key,
            });
        });
        this.validateAdditionalValidators(model);
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
        validators.forEach(({ validator, errorMessage }) => {
            const results = validator(value, fieldSchema, validatedObject, this);
            if (results instanceof Promise) {
                const promise = results.then((result) => {
                    this.resolveValidatorErrorsForKey(key, errorMessage, result);
                });
                this.promises.push(promise);
                return;
            }
            this.resolveValidatorErrorsForKey(key, errorMessage, results);
        });
    }

    validateAdditionalValidators(model) {
        this.additionalValidators.forEach((validator) => {
            const results = validator(model, this);
            if (results instanceof Promise) {
                this.promises.push(results);
            }
        });
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
        if (type instanceof OneOfTypes) {
            return this.validateOneOfTypes(value, key, type, index);
        }
        throw new Error(`Unrecognized type ${typeName}`);
    }

    validateTypeString(value, key, index) {
        if (typeof value === 'string') return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateString(label || key), index);
        return false;
    }

    validateTypeNumber(value, key, index) {
        if (typeof value === 'number') return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateNumber(label || key), index);
        return false;
    }

    validateTypeObject(value, key, index) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateObject(label || key), index);
        return false;
    }

    validateTypeArray(value, key, index) {
        if (Array.isArray(value)) return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateArray(label || key), index);
        return false;
    }

    validateTypeBoolean(value, key, index) {
        if (typeof value === 'boolean') return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateBoolean(label || key), index);
        return false;
    }

    validateTypeDate(value, key, index) {
        if (value instanceof Date) return true;
        const { label } = this.getField(key);
        this.setError(key, this.messages.validateDate(label || key), index);
        return false;
    }

    validateTypeSchema(value, subSchemaKey, type, index) {
        const results = type.validate(value);
        if (results instanceof Promise) {
            const promise = results.then((errors) => {
                const keys = Object.keys(errors);
                if (keys.length > 0) this.setError(subSchemaKey, errors, index);
            });
            this.promises.push(promise);
            return false;
        }
        const keys = Object.keys(results);
        if (keys.length === 0) return true;
        this.setError(subSchemaKey, results, index);
        return false;
    }

    validateOneOfTypes(value, key, type, index) {
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

    getFieldValidators(fieldName) {
        return this.schema[fieldName].validators || [];
    }

    setFieldValidator(fieldName, validator) {
        if (!Array.isArray(this.schema[fieldName].validators)) {
            this.schema[fieldName].validators = [];
        }
        this.schema[fieldName].validators.push(validator);
    }

    extendFieldValidators(fieldName, validator) {
        const validators = this.getFieldValidators(fieldName);
        if (!validators.length) {
            this.setFieldValidator(fieldName, validator);
            return;
        }
        if (
            validators.indexOf(validator) > -1
            || (
                validator.id
                && validators.findIndex(validatorItem => validatorItem.id === validator.id) > -1
            )
        ) {
            return;
        }
        this.setFieldValidator(fieldName, validator);
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

export default Schema;
