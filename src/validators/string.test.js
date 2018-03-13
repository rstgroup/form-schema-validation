import validateString from './string';

describe('validateString', () => {
    it('should return true when given value is a string', () => {
        const value = 'Test';
        const result = validateString(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is not a string', () => {
        const value = 123;
        const result = validateString(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
