import {
    pick,
    difference,
    getDefaultValueForType,
    getDefaultValueFromOptions,
    wrapToArray,
} from './helpers';
import OneOfTypes from './OneOfTypes';

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

    constructor(schema, messages, validateKeys = true) {
        this.schema = schema;
        this.errors = {};
        this.promises = [];
        this.messages = messages || defaultMessages;
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
            const fieldType = isArrayOfType ? field.type[0] : field.type;

            if (field.defaultValue) {
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
        return this.schema[name];
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
            return new Promise((resolve) => {
                Promise
                    .all(this.promises)
                    .then(resolve(this.errors));
            });
        }
        return this.errors;
    }

    setError(key, message, index) {
        if (!this.errors[key]) this.errors[key] = [];
        if (index > -1) {
            this.errors[key][index] = message;
            return;
        }
        this.errors[key].push(message);
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
        const keysDiff = difference(modelKeys, schemaKeys);
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
                validators: fieldSchema.validators,
                value,
                fieldSchema,
                validatedObject,
                key,
            });
        });
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
        if (!validators) {
            return;
        }
        validators.forEach(({ validator, errorMessage }) => {
            const results = validator(value, fieldSchema, validatedObject);
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

    validateRequired(fieldSchema, value, key) {
        if (fieldSchema.required) {
            const { name } = fieldSchema.type;
            if (typeof this.typesRequiredValidators[name] === 'function') {
                this.typesRequiredValidators[name](value, key);
                return;
            }
            this.validateRequiredType(value, key);
        }
    }

    validateRequiredType(value, key) {
        if (!value || value.length === 0) {
            this.setError(key, this.messages.validateRequired(key));
        }
    }

    validateRequiredTypeObject(value, key) {
        if (typeof value === 'object' && Object.keys(value).length > 0) {
            return;
        }
        this.setError(key, this.messages.validateRequired(key));
    }

    validateRequiredTypeArray(value, key) {
        if (Array.isArray(value) && value.length > 0) {
            return;
        }
        this.setError(key, this.messages.validateRequired(key));
    }

    validateRequiredTypeNumber(value, key) {
        if (isNaN(value)) {
            this.setError(key, this.messages.validateRequired(key));
        }
    }

    validateRequiredTypeDate(value, key) {
        if (value instanceof Date) {
            return;
        }
        this.setError(key, this.messages.validateRequired(key));
    }

    validateType(type, value, key, index) {
        const { name: typeName } = type;
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
        const errors = type.validate(value);
        const keys = Object.keys(errors);
        if (keys.length === 0) return true;
        this.setError(subSchemaKey, errors, index);
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

    registerType(type) {
        const { name, validator, requiredValidator } = type;
        this.typesValidators[name] = validator.bind(this);
        if (requiredValidator) {
            this.typesRequiredValidators[name] = requiredValidator.bind(this);
        }
    }
}

export default Schema;
