import validateNumber from './number';

describe('validateNumber', () => {
    it('should return true when given value is a number', () => {
        const value = 123;
        const result = validateNumber(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is not a number', () => {
        const value = 'Not a number';
        const result = validateNumber(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
