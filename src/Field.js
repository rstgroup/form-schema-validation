import {
    pick,
    clone,
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

import Schema from './Schema';

import validateArray from './validators/array';
import validateBoolean from './validators/boolean';
import validateDate from './validators/date';
import validateNumber from './validators/number';
import validateObject from './validators/object';
import validateString from './validators/string';
import validateRequired from './validators/required';
import validateRequiredObject from './validators/requiredObject';
import validateRequiredArray from './validators/requiredArray';
import validateRequiredNumber from './validators/requiredNumber';
import validateRequiredDate from './validators/requiredDate';
import validateRequiredString from './validators/requiredString';
import validateRequiredBoolean from './validators/requiredBoolean';

import * as defaultErrorMessages from './defaultErrorMessages';

const isSchema = type => type && typeof type.validate === 'function';
const isSchemaType = type => typeof type.name === 'string' && typeof type.validator !== 'undefined';
const isOrOperator = type => typeof type.getSchema === 'function' && typeof type.parseValue === 'function';
const isArrayType = field => Array.isArray(field.type);

export default class Field {
    static createFieldsFromRawSchema(schema, customErrorMessages) {
        return Object.keys(schema).map(key =>
            new Field(schema[key], key, customErrorMessages));
    }

    constructor(rawField, key, customErrorMessages) {
        this.key = key;
        this.type = rawField.type;
        this.required = rawField.required;
        this.label = rawField.label;
        this.defaultValue = rawField.defaultValue;
        this.validators = rawField.validators;
        this.options = rawField.options;
        this.errors = {};
        this.messages = { ...defaultErrorMessages, ...customErrorMessages };

        this.internal = {
            validators: {},
            requirementValidators: {},
        };

        const handler = this.handleTypeValidation;

        const validators = {
            Array: handler.bind(this, validateArray, this.messages.validateArray),
            Boolean: handler.bind(this, validateBoolean, this.messages.validateBoolean),
            Date: handler.bind(this, validateDate, this.messages.validateDate),
            Number: handler.bind(this, validateNumber, this.messages.validateNumber),
            Object: handler.bind(this, validateObject, this.messages.validateObject),
            String: handler.bind(this, validateString, this.messages.validateString),
        };

        const requirementValidators = {
            Array: handler.bind(this, validateRequiredArray, this.messages.validateRequired),
            Boolean: handler.bind(this, validateRequiredBoolean, this.messages.validateRequired),
            Date: handler.bind(this, validateRequiredDate, this.messages.validateRequired),
            Number: handler.bind(this, validateRequiredNumber, this.messages.validateRequired),
            Object: handler.bind(this, validateRequiredObject, this.messages.validateRequired),
            String: handler.bind(this, validateRequiredString, this.messages.validateRequired),
        };


        Object.keys(validators).map(validatorName =>
            this.addValidator(validatorName, validators[validatorName]));

        Object.keys(requirementValidators).map(validatorName =>
            this.addRequirementValidator(validatorName, requirementValidators[validatorName]));

        this.registerType(this.type);
    }

    addRequirementValidator(typeName, requirementValidator) {
        if (typeof requirementValidator !== 'function') {
            return;
        }
        this.internal.requirementValidators[typeName] = requirementValidator.bind(this);
    }

    addValidator(typeName, validator) {
        if (typeof validator !== 'function') {
            return;
        }
        this.internal.validators[typeName] = validator.bind(this);
    }

    hasValidatorForType(type) {
        const typeName = getFunctionName(type);
        return this.internal.validators[typeName] === 'function';
    }

    getType() {
        return this.isArrayType() ? this.type[0] : this.type;
    }

    isArrayType() {
        return isArrayType(this);
    }

    setError(key, error, index) {
        if (!this.errors[key]) this.errors[key] = [];
        if (index > -1) {
            this.errors[key][index] = mergeErrors(this.errors[key][index], error);
            return;
        }
        this.errors[key].push(error);
    }

    registerType(type) {
        const { validator, requiredValidator } = type;
        const fn = isArrayType(type) ? type[0] : type;
        const typeName = getFunctionName(fn);
        this.addValidator(typeName, validator);
        this.addRequirementValidator(typeName, requiredValidator);
    }

    registerTypeIfNotExists(type) {
        if (isSchemaType(type) && !this.hasValidatorForType(type)) {
            this.registerType(type);
        }
    }

    validateTypeSchema(value, subSchemaKey, type, index) {
        const errors = type.validate(value);
        const keys = Object.keys(errors);
        if (keys.length === 0) return true;
        this.setError(subSchemaKey, errors, index);
        return false;
    }

    validateType(type, value, key, index) {
        const typeName = getFunctionName(type);
        this.registerTypeIfNotExists(type);
        if (typeof this.internal.validators[typeName] === 'function') {
            return this.internal.validators[typeName](value, key, type, index);
        }
        if (isSchema(type)) {
            return this.validateTypeSchema(value, key, type, index);
        }
        if (isOrOperator(type)) {
            return this.validateOrOperator(value, key, type, index);
        }
        throw new Error(`Unrecognized type ${typeName}`);
    }

    validateRequired(field, value, key) {
        if (!field.required) {
            return;
        }
        const { name } = field.type;
        if (typeof this.internal.requirementValidators[name] === 'function') {
            this.internal.requirementValidators[name](value, key);
            return;
        }
        if (isSchema(field.type)) {
            this.validateRequiredTypeSchema(field.type.schema, value, key);
            return;
        }
        this.handleTypeValidation(validateRequired, this.messages.validateRequired, value, key);
    }

    validateOrOperator(value, key, type, index) {
        const schema = new Schema(type.getSchema());
        const errors = schema.validate(type.parseValue(value));
        const keys = Object.keys(errors);
        if (keys.length < type.getTypes().length) return true;
        this.setError(key, errors, index);
        return false;
    }

    getValues(model) {
        const value = model[this.key];
        return this.isArrayType() ? value : [value];
    }

    handleTypeValidation(validate, createErrorMessage, value, key, index) {
        if (typeof validate !== 'function') {
            throw new Error('Uknown validator');
        }
        const result = validate(value);
        if (!result) {
            const { label } = this;
            this.setError(key, createErrorMessage(label || key), index);
        }
        return result;
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
        const { label } = this;
        this.setError(key, this.messages.validateRequired(label || key));
    }

    clearErrors() {
        this.errors = {};
    }

    validate(model, schema) {
        this.clearErrors();
        const values = this.getValues(model);
        const firstValue = values[0];
        const fieldType = this.getType();

        values.forEach((value, index) => {
            this.validateType(fieldType, value, this.key, index);
            this.validateRequired(this, value, this.key, index);
        });

        // @TODO: Needs to be moved to Schema.js
        return schema.validateCustomValidators({
            validators: this.validators,
            value: firstValue,
            fieldSchema: this,
            validatedObject: model,
            key: this.key,
        });
    }
}
