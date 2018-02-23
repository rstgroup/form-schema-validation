import {
    pick,
    arraysDifference,
    wrapToArray,
    getFieldType,
    getDefaultValueForType,
    getDefaultValueFromOptions,
    getFunctionName,
    isNaN,
    removeFirstKeyIfNumber,
    getErrorIndexFromKeys,
    mergeErrors,
} from './helpers';

describe('helpers', () => {
    describe('pick', () => {
        it('should create object from another object with specific keys', () => {
            const bar = {
                foo: 'bar',
                foo2: 'bar2',
                foo3: 'bar3',
                foo4: 'bar4',
            };
            const foo = pick(bar, ['foo', 'foo2']);

            expect(foo).toEqual({
                foo: 'bar',
                foo2: 'bar2',
            });
        });
        it('should create object from another object and create keys with undefined if not exists', () => {
            const bar = {
                foo: 'bar',
            };
            const foo = pick(bar, ['foo', 'foo2']);

            expect(foo).toEqual({
                foo: 'bar',
                foo2: undefined,
            });
        });
    });
    describe('arraysDifference', () => {
        it('should compere two array and return difference', () => {
            const foo = ['foo', 'foo2', 'foo3', 'foo4'];
            const bar = ['foo', 'foo2'];

            expect(arraysDifference(foo, bar)).toEqual(['foo3', 'foo4']);
        });
    });
    describe('wrapToArray', () => {
        it('should wrap value to array', () => {
            const foo = 'fooValue';
            expect(wrapToArray(foo, true)).toEqual(['fooValue']);
        });
        it('should not wrap value to array', () => {
            const foo = 'fooValue';
            expect(wrapToArray(foo)).toEqual('fooValue');
        });
    });
    describe('getDefaultValueForType', () => {
        it('should get default value for type Number', () => {
            const type = Number;
            expect(Number.isNaN(getDefaultValueForType(type))).toEqual(true);
        });
        it('should get default value for type array of Numbers', () => {
            const type = Number;
            expect(Number.isNaN(getDefaultValueForType(type, true)[0])).toEqual(true);
        });

        it('should get default value for type String', () => {
            const type = String;
            expect(getDefaultValueForType(type)).toEqual('');
        });
        it('should get default value for type array of Strings', () => {
            const type = String;
            expect(getDefaultValueForType(type, true)).toEqual(['']);
        });

        it('should get default value for type Boolean', () => {
            const type = Boolean;
            expect(getDefaultValueForType(type)).toEqual(false);
        });
        it('should get default value for type array of Boolean', () => {
            const type = Boolean;
            expect(getDefaultValueForType(type, true)).toEqual([false]);
        });

        it('should get default value for custom type', () => {
            const type = { getDefaultValue: () => 'bar' };
            expect(getDefaultValueForType(type)).toEqual('bar');
        });
        it('should get default value for type array of custom type', () => {
            const type = { getDefaultValue: () => 'bar' };
            expect(getDefaultValueForType(type, true)).toEqual(['bar']);
        });

        it('should get default value for type Date', () => {
            const type = Date;
            expect(getDefaultValueForType(type) instanceof Date).toEqual(true);
        });
        it('should get default value for type array of Date', () => {
            const type = Date;
            expect(getDefaultValueForType(type, true)[0] instanceof Date).toEqual(true);
        });
    });
    describe('getDefaultValueFromOptions', () => {
        it('should get default value from options array of strings', () => {
            const options = [
                'test1',
                'test2',
            ];

            expect(getDefaultValueFromOptions(options)).toEqual('test1');
        });
        it('should get default value from options array of objects', () => {
            const options2 = [
                { label: 'test1', value: '1' },
                { label: 'test2', value: '2' },
            ];

            expect(getDefaultValueFromOptions(options2)).toEqual('1');
        });
    });
    describe('getFieldType', () => {
        it('should get field type from field', () => {
            const fooField = {
                type: String,
            };

            expect(getFieldType(fooField)).toBe(String);
        });
        it('should get field type from field when type is array of type', () => {
            const fooField = {
                type: [String],
            };

            expect(getFieldType(fooField)).toBe(String);
        });
    });
    describe('isNaN', () => {
        it('should return true if value is NaN', () => {
            const value = NaN;

            expect(isNaN(value)).toEqual(true);
        });
        it('should return false if value is String', () => {
            const value = 'NaN';
            const emptyValue = '';

            expect(isNaN(value)).toEqual(false);
            expect(isNaN(emptyValue)).toEqual(false);
        });
        it('should return false if value is Number', () => {
            const value = 0;

            expect(isNaN(value)).toEqual(false);
        });
        it('should return false if value is Object', () => {
            const value = {};

            expect(isNaN(value)).toEqual(false);
        });
        it('should return false if value is Array', () => {
            const value = [];

            expect(isNaN(value)).toEqual(false);
        });
        it('should return false if value is Boolean', () => {
            const value = false;

            expect(isNaN(value)).toEqual(false);
        });
        it('should return false if value is Function', () => {
            const value = () => {};

            expect(isNaN(value)).toEqual(false);
        });
    });
    describe('getFunctionName', () => {
        it('should return function name of String', () => {
            expect(getFunctionName(String)).toBe('String');
        });
        it('should return function name of Number', () => {
            expect(getFunctionName(Number)).toBe('Number');
        });
        it('should return function name of Object', () => {
            expect(getFunctionName(Object)).toBe('Object');
        });
        it('should return function name of Array', () => {
            expect(getFunctionName(Array)).toBe('Array');
        });
        it('should return function name of Boolean', () => {
            expect(getFunctionName(Boolean)).toBe('Boolean');
        });
        it('should return function name of Date', () => {
            expect(getFunctionName(Date)).toBe('Date');
        });
        it('should return function name of fooFunction', () => {
            const fooFunction = function foo() {};
            Object.defineProperty(fooFunction, 'name', { value: undefined });
            expect(getFunctionName(fooFunction)).toBe('foo');
            Object.defineProperty(fooFunction, 'name', { value: 'fooName' });
            expect(getFunctionName(fooFunction)).toBe('fooName');
        });
        it('should return function name of barFunction', () => {
            const barFunction = function bar() {};
            expect(getFunctionName(barFunction)).toBe('bar');
        });
    });
    describe('removeFirstKeyIfNumber', () => {
        it('should remove first key if is number', () => {
            const keys = ['0', 'foo', 'bar'];
            expect(removeFirstKeyIfNumber(keys)).toEqual(['foo', 'bar']);
        });
        it('should not remove first key if is string', () => {
            const keys = ['first', '1', 'bar'];
            expect(removeFirstKeyIfNumber(keys)).toEqual(['first', '1', 'bar']);
        });
    });
    describe('getErrorIndexFromKeys', () => {
        it('should return first key as a number if it is a number', () => {
            const keys = ['1', 'foo', 'bar'];
            expect(getErrorIndexFromKeys(keys)).toEqual(1);
        });
        it('should return -1 if first key is string', () => {
            const keys = ['first', '1', 'bar'];
            expect(getErrorIndexFromKeys(keys)).toEqual(-1);
        });
    });
    describe('mergeErrors', () => {
        it('should return error with 2 keys', () => {
            const currentErrors = { foo: ['foo error 1', 'foo error 2'] };
            const nextErrors = { bar: ['bar error 1', 'bar error 2'] };
            expect(mergeErrors(currentErrors, nextErrors)).toEqual({
                foo: ['foo error 1', 'foo error 2'],
                bar: ['bar error 1', 'bar error 2'],
            });
        });
        it('should return error with 2 keys', () => {
            const currentErrors = { foo: ['foo error 1', 'foo error 2'], bar: ['bar error 3'] };
            const nextErrors = { bar: ['bar error 1', 'bar error 2'] };
            expect(mergeErrors(currentErrors, nextErrors)).toEqual({
                foo: ['foo error 1', 'foo error 2'],
                bar: ['bar error 3', 'bar error 1', 'bar error 2'],
            });
        });
        it('should return empty object if errors are undefined', () => {
            const currentErrors = undefined;
            const nextErrors = undefined;
            expect(mergeErrors(currentErrors, nextErrors)).toEqual({});
        });
    });
});
