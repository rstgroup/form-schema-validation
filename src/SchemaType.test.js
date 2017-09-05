import SchemaType from './SchemaType';

describe('SchemaType', () => {
    let fooType = {};
    beforeEach(() => {
        fooType = new SchemaType('foo', {
            getDefaultValue: () => 'foo',
            validator: value => value.indexOf('foo') > -1 || '',
            requiredValidator: value => value.indexOf('foo') > -1,
        });
    });

    it('should create new schema type with name', () => {
        const { name } = fooType;
        expect(name).toBe('foo');
    });

    it('should create new schema type with getDefaultValue method', () => {
        const { getDefaultValue } = fooType;
        expect(typeof getDefaultValue).toBe('function');
    });

    it('should create new schema type with validator method', () => {
        const { validator } = fooType;
        expect(typeof validator).toBe('function');
    });

    it('should create new schema type with requiredValidator method', () => {
        const { requiredValidator } = fooType;
        expect(typeof requiredValidator).toBe('function');
    });
});
