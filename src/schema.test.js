import Schema from './index';

describe('Schema', () => {
    describe('Validation types', () => {
        it('should validate String', () => {
            const schema = new Schema({
                companyName: {
                    type: String
                }
            });
            const testObject = {
                companyName: 'Test Company'
            };

            const testObject2 = {
                companyName: 2345
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Number', () => {
            const schema = new Schema({
                companyNumber: {
                    type: Number
                }
            });

            const testObject = {
                companyNumber: 2345
            };

            const testObject2 = {
                companyNumber: 'Test Company'
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Boolean', () => {
            const schema = new Schema({
                isActive: {
                    type: Boolean
                }
            });

            const testObject = {
                isActive: true
            };

            const testObject2 = {
                isActive: 'test'
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Object', () => {
            const schema = new Schema({
                data: {
                    type: Object
                }
            });

            const testObject = {
                data: {
                    title: 'title description',
                    description: 'test description'
                }
            };

            const testObject2 = {
                data: 'test'
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Date', () => {
            const schema = new Schema({
                createdAt: {
                    type: Date
                }
            });

            const testObject = {
                createdAt: new Date()
            };

            const testObject2 = {
                createdAt: '2017-01-01'
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Array', () => {
            const schema = new Schema({
                names: {
                    type: Array
                }
            });

            const testObject = {
                names: ['Mike','Nicolas']
            };

            const testObject2 = {
                names: 'Mike,Nicolas'
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate Schema', () => {
            const personSchema = new Schema({
                name: {
                    type: String
                },
                age: {
                    type: Number
                }
            });

            const schema = new Schema({
                owner: {
                    type: personSchema
                }
            });

            const testObject = {
                owner: {
                    name: 'Mike',
                    age: 20
                }
            };

            const testObject2 = {
                owner: {
                    name: 123,
                    age: 'test'
                }
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate OneOfTypes', () => {
            const personSchema = new Schema({
                name: {
                    type: Schema.oneOfTypes([String, Number])
                },
                age: {
                    type: Number
                }
            });

            const schema = new Schema({
                owner: {
                    type: personSchema
                }
            });

            const testObject = {
                owner: {
                    name: 'Mike',
                    age: 20
                }
            };

            const testObject2 = {
                owner: {
                    name: 123,
                    age: 22
                }
            };

            const testObject3 = {
                owner: {
                    name: {
                        first: 'Mike'
                    },
                    age: 'test'
                }
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
                    type: [String]
                }
            });
            const testObject = {
                companyNames: ['Test Company', 'Test Company']
            };

            const testObject2 = {
                companyNames: ['test', 2345]
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Number', () => {
            const schema = new Schema({
                companyNumbers: {
                    type: [Number]
                }
            });

            const testObject = {
                companyNumbers: [2345, 544556]
            };

            const testObject2 = {
                companyNumbers: ['Test Company', 212]
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Boolean', () => {
            const schema = new Schema({
                isActive: {
                    type: [Boolean]
                }
            });

            const testObject = {
                isActive: [true, false, true, true]
            };

            const testObject2 = {
                isActive: ['test', true, 'test2']
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Object', () => {
            const schema = new Schema({
                data: {
                    type: [Object]
                }
            });

            const testObject = {
                data: [
                    {
                        title: 'title description',
                        description: 'test description'
                    },
                    {
                        title: 'title description2',
                        description: 'test description2'
                    }
                ]
            };

            const testObject2 = {
                data: ['test', 'test2']
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Date', () => {
            const schema = new Schema({
                dates: {
                    type: [Date]
                }
            });

            const testObject = {
                dates: [new Date('2017-01-01'), new Date('2017-01-02')]
            };

            const testObject2 = {
                dates: ['2017-01-01', '2017-01-02']
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Array', () => {
            const schema = new Schema({
                names: {
                    type: [Array]
                }
            });

            const testObject = {
                names: [['Mike','Nicolas'],['Mike2','Nicolas2']]
            };

            const testObject2 = {
                names: ['Mike, Nicolas', 'Mike2, Nicolas2']
            };

            const testObjectErrors = schema.validate(testObject);
            const testObject2Errors = schema.validate(testObject2);
            expect(Object.keys(testObjectErrors).length).toBe(0);
            expect(Object.keys(testObject2Errors).length).toBe(1);
        });

        it('should validate array of Schema', () => {
            const personSchema = new Schema({
                name: {
                    type: String
                },
                age: {
                    type: Number
                }
            });

            const schema = new Schema({
                owners: {
                    type: [personSchema]
                }
            });

            const testObject = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 'Mike2',
                        age: 21
                    }
                ]
            };

            const testObject2 = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 123,
                        age: 'test'
                    },
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 323,
                        age: 'test2'
                    }
                ]
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
                    type: Schema.oneOfTypes([String, Number])
                },
                age: {
                    type: Number
                }
            });

            const schema = new Schema({
                owners: {
                    type: [personSchema]
                }
            });

            const testObject = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 'Mike2',
                        age: 21
                    }
                ]
            };

            const testObject2 = {
                owners: [
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 123,
                        age: 22
                    },
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 323,
                        age: 12
                    }
                ]
            };

            const testObject3 = {
                owners: [
                    {
                        name: {
                            first: 'Mike'
                        },
                        age: 20
                    },
                    {
                        name: 123,
                        age: 'test'
                    },
                    {
                        name: 'Mike',
                        age: 20
                    },
                    {
                        name: 323,
                        age: 'test2'
                    }
                ]
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

    it('should validate required', () => {
        const schema = new Schema({
            termsAccepted: {
                type: Boolean,
                required: true
            }
        });

        const testObject = {
            termsAccepted: true
        };

        const testObject2 = {
            termsAccepted: false
        };

        const testObjectErrors = schema.validate(testObject);
        const testObject2Errors = schema.validate(testObject2);
        expect(Object.keys(testObjectErrors).length).toBe(0);
        expect(Object.keys(testObject2Errors).length).toBe(1);
    });
    describe('should validate using custom validators', () => {
        jest.useFakeTimers();

        it('sync', () => {
            const minLength = (length, message) => ({
                validator(value) {
                    return value.length >= length;
                },
                errorMessage: `Min length ${length}`
            });
            const maxLength = (length, message) => ({
                validator(value) {
                    return value.length <= length;
                },
                errorMessage: `Max length ${length}`
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [minLength(3), maxLength(20)]
                }
            });

            const testObject = {
                companyName: 'test company'
            };

            const testObject2 = {
                companyName: 't1'
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
                        },100);
                    });
                },
                errorMessage: `async validation failed`
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [asyncValidator()]
                }
            });

            const testObject = {
                companyName: 'test company2'
            };

            const testObjectErrors = schema.validate(testObject);
            jest.runOnlyPendingTimers();
            if(testObjectErrors instanceof Promise) {
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
                        },100);
                    });
                },
                errorMessage: `async validation failed`
            });

            const schema = new Schema({
                companyName: {
                    type: String,
                    required: true,
                    validators: [asyncValidator()]
                }
            });

            const testObject = {
                companyName: 'test company2'
            };

            const testObjectErrors = schema.validate(testObject);
            jest.runOnlyPendingTimers();
            if(testObjectErrors instanceof Promise) {
                testObjectErrors.then((results) => {
                    expect(Object.keys(results).length).toBe(0);
                    done();
                });
            }
        });

    });

    it('should return model error if model is undefined', () => {
        const schema = new Schema({
            companyName: {
                type: String
            }
        });

        const testObjectErrors = schema.validate();
        expect(Object.keys(testObjectErrors).length).toBe(1);
    });

    it('should return error if model has keys not defined in schema', () => {
        const schema = new Schema({
            companyName: {
                type: String
            }
        });

        const testObject = {
            companyName: 'Test company',
            companyNumber: 1223123
        };

        const testObjectErrors = schema.validate(testObject);
        expect(Object.keys(testObjectErrors).length).toBe(1);
    });

    it('should get default values for model', () => {
        const personSchema = new Schema({
            name: {
                type: String
            },
            country: {
                type: String,
                defaultValue: 'POLAND'
            }
        });

        const schema = new Schema({
            companyName: {
                type: String
            },
            age: {
                type: Number
            },
            isActive: {
                type: Boolean
            },
            category: {
                type: String,
                options: [
                    'test',
                    'test2'
                ]
            },
            language: {
                type: String,
                options: [
                    {
                        label: 'Polish - PL',
                        value: 'polish'
                    },
                    {
                        label: 'English - EN',
                        value: 'english'
                    }
                ]
            },
            currency: {
                type: String,
                defaultValue: 'EUR'
            },
            person: {
                type: personSchema
            },
            members: {
                type: [personSchema]
            },
            data: {
                type: Object
            }
        });
        const defaultModelValues = schema.getDefaultValues();
        expect(defaultModelValues.companyName).toBe('');
        expect(typeof defaultModelValues.age).toBe('number');
        expect(defaultModelValues.isActive).toBe(false);
        expect(defaultModelValues.category).toBe('test');
        expect(defaultModelValues.language).toBe('polish');
        expect(defaultModelValues.currency).toBe('EUR');
        expect(defaultModelValues.person.name).toBe('');
        expect(defaultModelValues.person.country).toBe('POLAND');
        expect(defaultModelValues.members[0].name).toBe('');
        expect(defaultModelValues.members[0].country).toBe('POLAND');
        expect(defaultModelValues.data instanceof Object).toBe(true);
    });

    it('should throw error if type is unrecognized', () => {
        const test = {
            test1: String
        };
        const schema = new Schema({
            test: {
                type: test,
                required: true
            }
        });

        const testObject = {
            test: {
                test1: 'some data'
            }
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
                type: String
            },
            age: {
                type: Number
            },
            isActive: {
                type: Boolean
            },
            category: {
                type: String,
                options: [
                    'test',
                    'test2'
                ]
            },
            currency: {
                type: String,
                defaultValue: 'EUR'
            }
        };
        const schema = new Schema(schemaObject);

        expect(schema.getFields()).toBe(schemaObject);
    });

    it('should dont validate keys not defined in schema', () => {
        const schemaObject = {
            companyName: {
                type: String
            },
            age: {
                type: Number
            },
            isActive: {
                type: Boolean
            },
            category: {
                type: String,
                options: [
                    'test',
                    'test2'
                ]
            },
            currency: {
                type: String,
                defaultValue: 'EUR'
            }
        };
        const normalSchema = new Schema(schemaObject);
        const dontValidateKeysSchema = new Schema(schemaObject, false, false);

        const data = {
            companyName: 'test',
            age: 12,
            isActive: true,
            category: 'test',
            currency: 'PLN',
            _id: 'test1234567890'
        };

        const errors = normalSchema.validate(data);
        const errors2 = dontValidateKeysSchema.validate(data);

        expect(Object.keys(errors).length).toBe(1);
        expect(Object.keys(errors2).length).toBe(0);
    });
});