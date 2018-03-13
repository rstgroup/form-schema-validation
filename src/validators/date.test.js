import validateDate from './date';

describe('validateDate', () => {
    it('should return true when given value is a date instance', () => {
        const value = new Date();
        const result = validateDate(value);
        const expectedResult = true;
        expect(result).toBe(expectedResult);
    });
    it('should return false when given value is not a date instance', () => {
        const value = '12.12.2018';
        const result = validateDate(value);
        const expectedResult = false;
        expect(result).toBe(expectedResult);
    });
});
