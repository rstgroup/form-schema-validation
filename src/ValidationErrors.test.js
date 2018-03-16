import ValidationErrors from './ValidationErrors';

describe('ValidationErrors.mergeErrors', () => {
    it('should return error with 2 keys', () => {
        const currentErrors = { foo: ['foo error 1', 'foo error 2'] };
        const nextErrors = { bar: ['bar error 1', 'bar error 2'] };
        expect(ValidationErrors.mergeErrors(currentErrors, nextErrors)).toEqual({
            foo: ['foo error 1', 'foo error 2'],
            bar: ['bar error 1', 'bar error 2'],
        });
    });
    it('should return error with 2 keys', () => {
        const currentErrors = { foo: ['foo error 1', 'foo error 2'], bar: ['bar error 3'] };
        const nextErrors = { bar: ['bar error 1', 'bar error 2'] };
        expect(ValidationErrors.mergeErrors(currentErrors, nextErrors)).toEqual({
            foo: ['foo error 1', 'foo error 2'],
            bar: ['bar error 3', 'bar error 1', 'bar error 2'],
        });
    });
    it('should return empty object if errors are undefined', () => {
        const currentErrors = undefined;
        const nextErrors = undefined;
        expect(ValidationErrors.mergeErrors(currentErrors, nextErrors)).toEqual({});
    });
    it('should return array with errors if next error is string', () => {
        const currentErrors = ['foo error'];
        const nextErrors = 'bar error';
        expect(ValidationErrors.mergeErrors(currentErrors, nextErrors)).toEqual(['foo error', 'bar error']);
    });
    it('should return array with error if next error is string and current error is undefined', () => {
        const currentErrors = undefined;
        const nextErrors = 'bar error';
        expect(ValidationErrors.mergeErrors(currentErrors, nextErrors)).toEqual(['bar error']);
    });
});
