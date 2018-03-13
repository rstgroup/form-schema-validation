import validateObject from './object';

describe('validateObject', () => {
    it('should return true when given value is a object', () => {
        const value = { foo: 'bar' };
        const result = validateObject(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is not a object', () => {
        const value = 1234;
        const result = validateObject(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is a null instead of an object', () => {
        const value = null;
        const result = validateObject(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
