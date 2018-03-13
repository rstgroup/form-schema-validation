import validateArray from './array';

describe('validateArray', () => {
    it('should return true when given value is an array', () => {
        const value = [1, 2, 3];
        const result = validateArray(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is not an array', () => {
        const value = 123;
        const result = validateArray(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
