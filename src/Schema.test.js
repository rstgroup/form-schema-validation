import Schema from './Schema';
import SchemaType from './SchemaType';

describe('Schema', () => {
    describe('Validation types', () => {
        it('should validate String', () => {
            const schema = new Schema({
                companyName: {
                    type: String,
                },
            });
            const testObject = {
                companyName: 'Test Company',
            };

            const testObject2 = {
                companyName: 2345,
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Number', () => {
            const schema = new Schema({
                companyNumber: {
                    type: Number,
                },
            });

            const testObject = {
                companyNumber: 2345,
            };

            const testObject2 = {
                companyNumber: 'Test Company',
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Boolean', () => {
            const schema = new Schema({
                isActive: {
                    type: Boolean,
                },
            });

            const testObject = {
                isActive: true,
            };

            const testObject2 = {
                isActive: 'test',
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Object', () => {
            const schema = new Schema({
                data: {
                    type: Object,
                },
            });

            const testObject = {
                data: {
                    title: 'title description',
                    description: 'test description',
                },
            };

            const testObject2 = {
                data: 'test',
            };

            const testObject3 = {
                data: null,
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            const testObject3Errors = schema.validate(testObject3);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
            expect(Object.keys(testObject3Errors).length).toBe(1);
        });

        it('should validate Date', () => {
            const schema = new Schema({
                createdAt: {
                    type: Date,
                },
            });

            const testObject = {
                createdAt: new Date(),
            };

            const testObject2 = {
                createdAt: '2017-01-01',
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Array', () => {
            const schema = new Schema({
                names: {
                    type: Array,
                },
            });

            const testObject = {
                names: ['Mike', 'Nicolas'],
            };

            const testObject2 = {
                names: 'Mike,Nicolas',
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Schema', () => {
            const personSchema = new Schema({
                name: {
                    type: String,
                },
                age: {
                    type: Number,
                },
            });

            const schema = new Schema({
                owner: {
                    type: personSchema,
                },
            });

            const testObject = {
                owner: {
                    name: 'Mike',
                    age: 20,
                },
            };

            const testObject2 = {
                owner: {
                    name: 123,
                    age: 'test',
                },
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate OneOfTypes', () => {
            const personSchema = new Schema({
                name: {
                    type: Schema.oneOfTypes([String, Number]),
                },
                age: {
                    type: Number,
                },
            });

            const schema = new Schema({
                owner: {
                    type: personSchema,
                },
            });

            const testObject = {
                owner: {
                    name: 'Mike',
                    age: 20,
                },
            };

            const testObject2 = {
                owner: {
                    name: 123,
                    age: 22,
                },
            };

            const testObject3 = {
                owner: {
                    name: {
                        first: 'Mike',
                    },
                    age: 'test',
                },
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            const testObject3Errors = schema.validate(testObject3);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(0);
            expect(Object.keys(testObject3Errors).length).toBe(1);
        });
    });

    describe('Validation array of types', () => {
        it('should validate array of String', () => {
            const schema = new Schema({
                companyNames: {
                    type: [String],
                },
            });
            const testObject = {
                companyNames: ['Test Company', 'Test Company'],
            };

            const testObject2 = {
                companyNames: ['test', 2345],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Number', () => {
            const schema = new Schema({
                companyNumbers: {
                    type: [Number],
                },
            });

            const testObject = {
                companyNumbers: [2345, 544556],
            };

            const testObject2 = {
                companyNumbers: ['Test Company', 212],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Boolean', () => {
            const schema = new Schema({
                isActive: {
                    type: [Boolean],
                },
            });

            const testObject = {
                isActive: [true, false, true, true],
            };

            const testObject2 = {
                isActive: ['test', true, 'test2'],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Object', () => {
            const schema = new Schema({
                data: {
                    type: [Object],
                },
            });

            const testObject = {
                data: [
                    {
                        title: 'title description',
                        description: 'test description',
                    },
                    {
                        title: 'title description2',
                        description: 'test description2',
                    },
                ],
            };

            const testObject2 = {
                data: ['test', 'test2'],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Date', () => {
            const schema = new Schema({
                dates: {
                    type: [Date],
                },
            });

            const testObject = {
                dates: [new Date('2017-01-01'), new Date('2017-01-02')],
            };

            const testObject2 = {
                dates: ['2017-01-01', '2017-01-02'],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Array', () => {
            const schema = new Schema({
                names: {
                    type: [Array],
                },
            });

            const testObject = {
                names: [['Mike', 'Nicolas'], ['Mike2', 'Nicolas2']],
            };

            const testObject2 = {
                names: ['Mike, Nicolas', 'Mike2, Nicolas2'],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Schema', () => {
            const personSchema = new Schema({
                name: {
                    type: String,
                },
                age: {
                    type: Number,
                },
            });

            const schema = new Schema({
                owners: {
                    type: [personSchema],
                },
            });

            const testObject = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 'Mike2',
                        age: 21,
                    },
                ],
            };

            const testObject2 = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 123,
                        age: 'test',
                    },
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 323,
                        age: 'test2',
                    },
                ],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
            expect(testObject2Errors.owners.length).toBe(4);
            expect(testObject2Errors.owners[1].name.length).toBe(1);
            expect(testObject2Errors.owners[1].age.length).toBe(1);
        });

        it('should validate array of OneOfTypes', () => {
            const personSchema = new Schema({
                name: {
                    type: Schema.oneOfTypes([String, Number]),
                },
                age: {
                    type: Number,
                },
            });

            const schema = new Schema({
                owners: {
                    type: [personSchema],
                },
            });

            const testObject = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 'Mike2',
                        age: 21,
                    },
                ],
            };

            const testObject2 = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 123,
                        age: 22,
                    },
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 323,
                        age: 12,
                    },
                ],
            };

            const testObject3 = {
                owners: [
                    {
                        name: {
                            first: 'Mike',
                        },
                        age: 20,
                    },
                    {
                        name: 123,
                        age: 'test',
                    },
                    {
                        name: 'Mike',
                        age: 20,
                    },
                    {
                        name: 323,
                        age: 'test2',
                    },
                ],
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            const testObject3Errors = schema.validate(testObject3);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(0);
            expect(Object.keys(testObject3Errors).length).toBe(1);
            expect(testObject3Errors.owners[0].name.length).toBe(1);
        });
    });

    describe('Validate required', () => {
        it('should validate required String', () => {
            const schema = new Schema({
                foo: {
                    type: Boolean,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: true,
            };
            const modelWithErrors = {
                foo: false,
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate required Number', () => {
            const schema = new Schema({
                foo: {
                    type: Number,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: 0,
            };
            const modelWithErrors = {
                foo: NaN,
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate required Object', () => {
            const schema = new Schema({
                foo: {
                    type: Object,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: { bar: 'foo' },
            };
            const modelWithErrors = {
                foo: {},
            };
            const modelWithErrors2 = {
                foo: ['bar'],
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            const testObject3Errors = schema.validate(modelWithErrors2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
            expect(Object.keys(testObject3Errors).length).toBe(1);
        });

        it('should validate required Array', () => {
            const schema = new Schema({
                foo: {
                    type: Array,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: ['bar'],
            };
            const modelWithErrors = {
                foo: [],
            };
            const modelWithErrors2 = {
                foo: { bar: 'foo' },
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            const testObject3Errors = schema.validate(modelWithErrors2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
            expect(Object.keys(testObject3Errors).length).toBe(1);
        });

        it('should validate required Date', () => {
            const schema = new Schema({
                foo: {
                    type: Date,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: new Date(),
            };
            const modelWithErrors = {
                foo: {},
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate required Boolean', () => {
            const schema = new Schema({
                foo: {
                    type: Boolean,
                    required: true,
                },
            });
            const modelWithoutErrors = {
                foo: true,
            };
            const modelWithErrors = {
                foo: false,
            };

            const testObjectErrors = schema.validate(modelWithoutErrors);
            const testObject2Errors = schema.validate(modelWithErrors);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });
    });
    describe('Should validate using custom validators', () => {
        jest.useFakeTimers();

        it('sync', () => {
            const minLength = length => ({
                validator(value) {
                    return value.length >= length;
                },
                errorMessage: `Min length ${length}`,
            });
            const maxLength = length => ({
                validator(value) {
                    return value.length <= length;
                },
                errorMessage: `Max length ${length}`,
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [minLength(3), maxLength(20)],
                },
            });

            const testObject = {
                companyName: 'test company',
            };

            const testObject2 = {
                companyName: 't1',
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });


        it('async with promise (1 error)', (done) => {
            const asyncValidator = () => ({
                validator(value) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(value === 'test company');
                        }, 100);
                    });
                },
                errorMessage: 'async validation failed',
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [asyncValidator()],
                },
            });

            const testObject = {
                companyName: 'test company2',
            };

            const testObjectErrors = schema.validate(testObject);
            jest.runOnlyPendingTimers();
            if (testObjectErrors instanceof Promise) {
                testObjectErrors.then((results) => {
                    expect(Object.keys(results).length).toBe(1);
                    done();
                });
            }
        });

        it('async with promise (0 error)', (done) => {
            const asyncValidator = () => ({
                validator(value) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(value === 'test company2');
                        }, 100);
                    });
                },
                errorMessage: 'async validation failed',
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [asyncValidator()],
                },
            });

            const testObject = {
                companyName: 'test company2',
            };

            const testObjectErrors = schema.validate(testObject);
            jest.runOnlyPendingTimers();
            if (testObjectErrors instanceof Promise) {
                testObjectErrors.then((results) => {
                    expect(Object.keys(results).length).toBe(0);
                    done();
                });
            }
        });

        it('should be able to return multiple errorMessages in an array from validator', () => {
            const errorMessages = ['bar', 'biz'];
            const validatorObject = {
                validator: () => errorMessages,
            };
            const schema = new Schema({
                foo: {
                    type: String,
                    validators: [validatorObject],
                },
            });
            const results = schema.validate({ foo: 'foo' });
            expect(results.foo).toEqual(errorMessages);
        });

        it('should be able to return single errorMessage from validator', () => {
            const errorMessage = 'bar';
            const validatorObject = {
                validator: () => errorMessage,
            };
            const schema = new Schema({
                foo: {
                    type: String,
                    validators: [validatorObject],
                },
            });
            const results = schema.validate({ foo: 'foo' });
            expect(results.foo).toEqual([errorMessage]);
        });
    });

    describe('Default value', () => {
        it('should get default value for String type', () => {
            const schema = new Schema({
                foo: {
                    type: String,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: '' });
        });

        it('should get default value for Number type', () => {
            const schema = new Schema({
                foo: {
                    type: Number,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: NaN });
        });

        it('should get default value for Boolean type', () => {
            const schema = new Schema({
                foo: {
                    type: Boolean,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: false });
        });

        it('should get default value for Object type', () => {
            const schema = new Schema({
                foo: {
                    type: Object,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: {} });
        });

        it('should get default value for Date type', () => {
            const schema = new Schema({
                foo: {
                    type: Date,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel.foo instanceof Date).toEqual(true);
        });

        it('should get default value for array of type', () => {
            const schema = new Schema({
                foo: {
                    type: [String],
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: [''] });
        });

        it('should get default for field with options', () => {
            const schema = new Schema({
                foo: {
                    type: String,
                    options: ['foo1', 'foo2', 'foo3'],
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({ foo: 'foo1' });
        });

        it('should get default value for schema type', () => {
            const barSchema = new Schema({
                foo: {
                    type: String,
                },
                bar: {
                    type: String,
                    defaultValue: 'foo',
                },
            });

            const fooSchema = new Schema({
                bar: {
                    type: barSchema,
                },
            });
            const defaultModel = fooSchema.getDefaultValues();
            expect(defaultModel).toEqual({
                bar: {
                    foo: '',
                    bar: 'foo',
                },
            });
        });

        it('should not return default value if field has flag disableDefaultValue', () => {
            const schema = new Schema({
                foo: {
                    type: String,
                    options: ['foo1', 'foo2', 'foo3'],
                    disableDefaultValue: true,
                },
            });
            const defaultModel = schema.getDefaultValues();
            expect(defaultModel).toEqual({});
        });
    });

    it('should return model error if model is undefined', () => {
        const schema = new Schema({
            companyName: {
                type: String,
            },
        });

        const testObjectErrors = schema.validate();
        expect(Object.keys(testObjectErrors).length).toBe(1);
    });

    it('should return error if model has keys not defined in schema', () => {
        const schema = new Schema({
            companyName: {
                type: String,
            },
        });

        const testObject = {
            companyName: 'Test company',
            companyNumber: 1223123,
        };

        const testObjectErrors = schema.validate(testObject);
        expect(Object.keys(testObjectErrors).length).toBe(1);
    });

    it('should throw error if type is unrecognized', () => {
        const test = {
            test1: String,
        };
        const schema = new Schema({
            test: {
                type: test,
                required: true,
            },
        });

        const testObject = {
            test: {
                test1: 'some data',
            },
        };

        try {
            schema.validate(testObject);
        } catch (error) {
            expect(error.message).toBe('Unrecognized type undefined');
        }
    });

    it('should get defined schema', () => {
        const schemaObject = {
            companyName: {
                type: String,
            },
            age: {
                type: Number,
            },
            isActive: {
                type: Boolean,
            },
            category: {
                type: String,
                options: [
                    'test',
                    'test2',
                ],
            },
            currency: {
                type: String,
                defaultValue: 'EUR',
            },
        };
        const schema = new Schema(schemaObject);

        expect(schema.getFields()).toBe(schemaObject);
    });

    it('should dont validate keys not defined in schema', () => {
        const schemaObject = {
            companyName: {
                type: String,
            },
            age: {
                type: Number,
            },
            isActive: {
                type: Boolean,
            },
            category: {
                type: String,
                options: [
                    'test',
                    'test2',
                ],
            },
            currency: {
                type: String,
                defaultValue: 'EUR',
            },
        };
        const normalSchema = new Schema(schemaObject);
        const dontValidateKeysSchema = new Schema(schemaObject, false, false);

        const data = {
            companyName: 'test',
            age: 12,
            isActive: true,
            category: 'test',
            currency: 'PLN',
            _id: 'test1234567890',
        };

        const errors = normalSchema.validate(data);
        const errors2 = dontValidateKeysSchema.validate(data);

        expect(Object.keys(errors).length).toBe(1);
        expect(Object.keys(errors2).length).toBe(0);
    });

    it('should display label in error message if is defined in schema unless display key', () => {
        const schemaObject = {
            foo: {
                type: String,
                label: 'testLabel',
            },
            bar: {
                type: String,
            },
            requiredField: {
                type: String,
                required: true,
                label: 'testLabel',
            },
        };
        const schema = new Schema(schemaObject);

        const data = {
            foo: 10,
            bar: 12,
            requiredField: '',
        };

        const errors = schema.validate(data);

        expect(errors).toEqual({
            foo: ['Field \'testLabel\' is not a String'],
            bar: ['Field \'bar\' is not a String'],
            requiredField: ['Field \'testLabel\' is required'],
        });
    });

    it('should pick fields from schema', () => {
        const schema = new Schema({
            foo: {
                type: String,
            },
            foo2: {
                type: Number,
            },
            bar: {
                type: Boolean,
            },
            bar2: {
                type: String,
            },
        });

        expect(schema.pick(['foo', 'bar'])).toEqual({
            foo: {
                type: String,
            },
            bar: {
                type: Boolean,
            },
        });
    });

    it('should get fields from schema and omit some fields', () => {
        const schema = new Schema({
            foo: {
                type: String,
            },
            foo2: {
                type: Number,
            },
            bar: {
                type: Boolean,
            },
            bar2: {
                type: String,
            },
        });

        expect(schema.omit(['foo', 'bar'])).toEqual({
            foo2: {
                type: Number,
            },
            bar2: {
                type: String,
            },
        });
    });

    it('should extend schema', () => {
        const schema = new Schema({
            foo: {
                type: String,
            },
            foo2: {
                type: Number,
            },
            bar: {
                type: Boolean,
            },
            bar2: {
                type: String,
            },
        });

        schema.extend({
            foo3: {
                type: String,
            },
        });

        expect(schema.getFields()).toEqual({
            foo: {
                type: String,
            },
            foo2: {
                type: Number,
            },
            bar: {
                type: Boolean,
            },
            bar2: {
                type: String,
            },
            foo3: {
                type: String,
            },
        });
    });

    describe('Custom schema types', () => {
        let fooType = {};
        beforeEach(() => {
            fooType = new SchemaType('Foo', {
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
        });

        it('should register new schema type', () => {
            const schema = new Schema({
                foo: {
                    type: fooType,
                },
                bar: {
                    type: String,
                },
            });

            schema.registerType(fooType);
            expect(typeof schema.typesValidators.Foo).toBe('function');
            expect(typeof schema.typesRequiredValidators.Foo).toBe('function');
        });

        it('should validate new schema type', () => {
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

            expect(schema.validate(modelWithErrors)).toEqual({ foo: ['foo error'] });
            expect(schema.validate(modelWithoutErros)).toEqual({});
            expect(schema.validate(modelWithoutErros2)).toEqual({});
        });

        it('should validate new schema type when required', () => {
            const schema = new Schema({
                foo: {
                    type: fooType,
                    required: true,
                },
                bar: {
                    type: String,
                },
            });

            schema.registerType(fooType);

            const modelWithErrors = {
                foo: '',
                bar: '',
            };
            const modelWithoutErros = {
                foo: 'foo',
                bar: '',
            };

            expect(schema.validate(modelWithErrors)).toEqual({ foo: ['foo required'] });
            expect(schema.validate(modelWithoutErros)).toEqual({});
        });

        it('should use requiredValidatorType if new schema type dont have defined requiredValidator', () => {
            fooType.requiredValidator = undefined;
            const schema = new Schema({
                foo: {
                    type: fooType,
                    required: true,
                },
                bar: {
                    type: String,
                },
            });

            schema.registerType(fooType);

            const modelWithErrors = {
                foo: '',
                bar: '',
            };
            const modelWithErrors2 = {
                foo: 'bar',
                bar: '',
            };
            const modelWithoutErros = {
                foo: 'foo',
                bar: '',
            };

            expect(schema.validate(modelWithErrors)).toEqual({ foo: [schema.messages.validateRequired('foo')] });
            expect(schema.validate(modelWithErrors2)).toEqual({ foo: ['foo error'] });
            expect(schema.validate(modelWithoutErros)).toEqual({});
        });

        it('should get default value for new schema type', () => {
            const schema = new Schema({
                foo: {
                    type: fooType,
                    required: true,
                },
                bar: {
                    type: String,
                },
            });

            schema.registerType(fooType);

            expect(schema.getDefaultValues()).toEqual({ foo: 'foo', bar: '' });
        });
    });
});
