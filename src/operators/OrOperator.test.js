import OrOperator from './OrOperator';

describe('OrOperator', () => {
    it('getTypes should return array with 2 types', () => {
        const oneOfTypes = new OrOperator([String, Number]);
        expect(oneOfTypes.getTypes().length).toBe(2);
    });

    it('should return empty array if types undefined', () => {
        const oneOfTypes = new OrOperator();
        expect(oneOfTypes.getTypes().length).toBe(0);
    });

    it('should return schema object', () => {
        const oneOfTypes = new OrOperator([String, Number]);
        const schema = oneOfTypes.getSchema();
        expect(schema.type0.type).toBe(String);
        expect(schema.type1.type).toBe(Number);
    });

    it('should return parsed value', () => {
        const oneOfTypes = new OrOperator([String, Number]);
        const value = 'testValue';
        const parsedValue = oneOfTypes.parseValue(value);
        expect(parsedValue.type0).toBe(value);
        expect(parsedValue.type1).toBe(value);
    });
});
