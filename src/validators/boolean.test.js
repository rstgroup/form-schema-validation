import validateBoolean from './boolean';

describe('validateBoolean', () => {
    it('should return true when given value is a boolean (true)', () => {
        const value = true;
        const result = validateBoolean(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });

    it('should return true when given value is a boolean (false)', () => {
        const value = false;
        const result = validateBoolean(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });

    it('should return false when given value is not a boolean', () => {
        const value = 'Not a boolean';
        const result = validateBoolean(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
