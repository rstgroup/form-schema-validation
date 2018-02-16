# FORM SCHEMA VALIDATION

[![Build Status](https://travis-ci.org/rstgroup/form-schema-validation.svg?branch=master)](https://travis-ci.org/rstgroup/form-schema-validation)
[![Coverage Status](https://coveralls.io/repos/github/rstgroup/form-schema-validation/badge.svg?branch=master)](https://coveralls.io/github/rstgroup/form-schema-validation?branch=master)
[![npm](https://img.shields.io/npm/l/form-schema-validation.svg)](https://npmjs.org/package/form-schema-validation)
[![npm](https://img.shields.io/npm/v/form-schema-validation.svg)](https://npmjs.org/package/form-schema-validation)

[1. Features](#features-of-form-schema-validation)<br />
[2. Installation](#installation)<br />
[3. How to use](#how-to-use)<br />
[4. Constructor](#constructor)<br />
[5. Methods](#methods)<br />
[6. Types](#types)<br />
[7. Example of custom validator](#example-of-custom-validator)<br />
[8. Example of additional validator](#example-of-additional-validator)<br />
[9. Schema definition Example](#schema-definition-example)<br />
[10. Example of schema in schema](#example-of-schema-in-schema)<br />
[11. Schema keys description](#schema-keys-description)<br />
[12. Custom validation messages](#custom-validation-messages)<br />
[13. Switch of keys validation](#switch-of-keys-validation)<br />

### Features of form-schema-validation

- sync validation
- async validation (Promise)
- validate object structure
- validate object keys
- validate required fields
- validate as optional
- validate by type
- validate by custom type
- validate by one of type
- validate field by custom validators
- validate fields relations by custom validators
- validate whole object tree by custom additional validators

### Installation

```bash
$ npm install form-schema-validation --save
```

### How to use

Schema give you posibility to validate object using schema validation. You can defined schema and use validate method to check object. Validate method allways returns errors object but if You don't have errors object is empty so You can check errors by
```js
import Schema from 'form-schema-validation';

const schema = new Schema({
    companyName: {
        type: String
    }
});

const modelObject = {
    companyName: 'Test Company'
};

const errors = schema.validate(modelObject); // {}
const error = Object.keys(errors).length > 0; // false
```

### Promises support

You can use validators that return Promise. If You return promis in validator then shema.validate(model) will return Promise.

```js
import Schema from 'form-schema-validation';

const customValidator = {
    validator: (value) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(value === 'test');
            }, 1000);
        });
    },
    errorMessage: 'async test error',
}

const schema = new Schema({
    companyName: {
        type: String,
        validators:[customValidator]
    }
});

const modelObject = {
    companyName: 'Test Company'
};

const results = schema.validate(modelObject); // Promise
results.then((errors) => {
    console.log(Object.keys(errors).length > 0); // true
});
```


### Constructor

| Name | Type | Description |
|---|---|---|
| schema | Object | schema will be used when you validate object |
| errorMessages | Object | errors messages that will be displayed on error |
| validateKeys | Boolean | this flag give you posibility to don't validate object keys not defined in schema |

### Methods

| Name | Attributes | Description |
|---|---|---|
| validate | model: Object | Validate Object using defined schema |
| setError | key: String, message: String, index: Number | Set error on field |
| setModelError | path: String, message: String | Set error on model tree |
| getDefaultValues |  | Get default values for model using defined schema |
| getField | name: String | Get field schema |
| getField |  | Get all fields schemas |
| oneOfTypes | types: Array of types | Give posibility to validate one of type (Static method) |
| pick | fieldsToPick: [String] | get fields from schema by keys |
| omit | fieldsToOmit: [String] | get fields from schema and omit fieldsToOmit |
| extend | fieldsToExtend: [String] | extend schema by new fields or overwrite them |
| registerType | type: SchemaType | register new schema type |
| isValidatorRegistred | validatorName: String | check model validator exists in schema |
| addValidator | validatorName: String, validator: Function(model: Object, schema: instance of Schema) | add model validator |
| removeValidator | validatorName: String | remove model validator |

### Types

| Name | Description |
|---|---|
| String | Simple String type |
| Number | Simple Number type |
| Object | Simple Object type this type give you posibility to black box |
| Boolean | Simple Boolean type |
| Date | This type check value is instance of Date |
| Array | This type check value is array of any value |
| new Schema | This type check value is instance of Schema and validate value by this schema |
| Schema.oneOfType([type1, type2, ...]) | This type give you posibility check one of types it will return error if value don't match all types |
| Schema.optionalType(type) | This type will pass validation if value is null or undefined when field is not required |
| SchemaType | You can register new schema type that has name, validator, validator when field is required (requiredValidator) and getDefaultValue |
| [OneOfTypesAbove] | This type check value is array of type |

#### Example of custom validator
This validator will check two fields. You can validate one field on base another field.
```js
const validateIfFieldTitleIsFilled = (minLength, message) => ({
    validator: (value, fieldSchema, formData) => {
        if(formData.title){
            return !!value;
        }
        return true;
    },
    errorMessage: message
});
```

#### Example of additional validator
Additional validator can set error deep in the objects tree.
```js
const fooSchema = new Schema({
    fooStart: {
        type: String,
    },
    fooEnd: {
        type: String,
    },
});
const modelSchema = new Schema({
    foo: {
        type: fooSchema,
        required: true,
    },
});
const dataModel = {
    foo: {
        fooStart: 'start',
        fooEnd: 'end',
    },
};

modelSchema.addValidator('fooValidator', (model, schema) => {
    if(model.foo.fooStart === 'start') {
        schema.setModelError('foo.fooStart', 'errorMessage');
    }
});

modelSchema.validate(dataModel);
```

### Example of dynamic error messages

There can be a need for error messages generated based on the validation outcome. In that case a string or array of strings can be returned from the validator function. Error messages returned from validator function have higher priority that the errorMessage property.

```js
const MIN_AGE = 18;
const validateIfOfAge = () => ({
    validator: (value, fieldSchema, formData) => {
        const { age } = formData;
        if (age <= MIN_AGE) {
            return [`Given ${age} is lower than required age of ${MIN_AGE}`];
        }
    }
});
```

### Schema definition Example

If You want create new schema You must put object to constructor with information about object keys names and type of value on key.

```js
import Schema from 'form-schema-validation';

const min = (minLength, message) => ({
    validator: (value) => {
        return value.length > minLength;
    },
    errorMessage: message
});

const schema = new Schema({
    companyName: {
        type: String,
        required: true,
        label: 'Company name',
        validators: [min(2, 'Company name should be longer then 2 chars')]
    },
    createdAt: {
        type: Schema.oneOfTypes([Date, String]),
        defaultValue: new Date(),
        label: 'When start'
    },
    workers: {
        type: Number,
        label: 'How many workers we have'
    }
});
```

##### Example of schema in schema

```js
import Schema from 'form-schema-validation';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    age: {
        type: Number
    }
});

const groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        label: 'Group name'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date(),
        label: 'Created at'
    },
    members: {
        type: [userSchema],
        label: 'Members'
    }
});
```

##### Example of use new schema type

```js
import Schema, { SchemaType } from 'form-schema-validation';

const fooType = new SchemaType('Foo', {
    getDefaultValue() {
        return 'foo';
    },
    validator(value, key) {
        if (value.indexOf('foo') > -1 || value === '') {
            return true;
        }
        this.setError(key, 'foo error');
        return false;
    },
    requiredValidator(value, key) {
        if (value.indexOf('foo') > -1) {
            return true;
        }
        this.setError(key, 'foo required');
        return false;
    },
});

const schema = new Schema({
    foo: {
        type: fooType,
    },
    bar: {
        type: String,
    },
});

const modelWithErrors = {
    foo: 'test',
    bar: '',
};
const modelWithoutErros = {
    foo: '',
    bar: '',
};
const modelWithoutErros2 = {
    foo: 'foo',
    bar: '',
};
```

#### Schema keys description

When You defined schema You can use this keys:

| Key | Allowed values | Description |
|---|---|---|
| companyName, createdAt, workers, ... | any name | this key defined object key name |
| type | String, Number, Object, Date, Boolean, Array, instance of Schema, [String] ... | this key tell as what type of value we should have on this key in model |
| required | true, false | this key tell as that field is required |
| defaultValue | Any | You can set default value for model |
| disableDefaultValue | Boolean | You can disable filed default value |
| options | Array of (String, Number, Object, Date, ...) | If you use schema for forms You can defined options for select field |
| label | Any instance of String | If you use schema for forms You can defined label for form field |
| validators | array of Functions | You can add custom validators for validate field for example min or max length of value. |


#### Custom validation messages
```js
import Schema from 'form-schema-validation';

const ErrorMessages = {
    notDefinedKey(key) { return `Key '${key}' is not defined in schema`; },
    modelIsUndefined() { return 'Validated model is undefined'; },
    validateRequired(key) { return `Field '${key}' is required`; },
    validateString(key) { return `Field '${key}' is not a String`; },
    validateNumber(key) { return `Field '${key}' is not a Number`; },
    validateObject(key) { return `Field '${key}' is not a Object`; },
    validateArray(key) { return `Field '${key}' is not a Array`; },
    validateBoolean(key) { return `Field '${key}' is not a Boolean`; },
    validateDate(key) { return `Field '${key}' is not a Date`; }
};

const groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        label: 'Group name'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date(),
        label: 'Created at'
    },
    members: {
        type: [userSchema],
        label: 'Members'
    }
}, ErrorMessages);

```

#### Switch of keys validation
```js
import Schema from 'form-schema-validation';

const schema = new Schema({
    companyName: {
        type: String,
        required: true
    }
}, false, false);

const modelObject = {
    companyName: 'Test Company',
    _id: 'test1234567890',
};

const errors = schema.validate(modelObject);
console.log(Object.keys(errors).length > 0); // false

```

