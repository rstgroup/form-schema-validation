import {
    pick,
    difference,
    wrapToArray,
    getFieldType,
    getDefaultValueForType,
    getDefaultValueFromOptions,
    getFunctionName,
    removeFirstKeyIfNumber,
    getErrorIndexFromKeys,
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
    });
    describe('difference', () => {
        it('should compere two array and return difference', () => {
            const foo = ['foo', 'foo2', 'foo3', 'foo4'];
            const bar = ['foo', 'foo2'];

            expect(difference(foo, bar)).toEqual(['foo3', 'foo4']);
        });
    });
    describe('wrapToArray', () => {
        it('should wrap value to array', () => {
            const foo = 'test';
            expect(wrapToArray(foo, true)).toEqual(['test']);
        });
        it('should not wrap value to array', () => {
            const foo = 'test';
            expect(wrapToArray(foo)).toEqual('test');
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
        it('should get default value for type array of Strings', () => {
            const type = Boolean;
            expect(getDefaultValueForType(type, true)).toEqual([false]);
        });

        it('should get default value for type Custom', () => {
            const type = { getDefaultValue: () => 'bar' };
            expect(getDefaultValueForType(type)).toEqual('bar');
        });
        it('should get default value for type array of Custom', () => {
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
            const keys = ['first', 'foo', 'bar'];
            expect(removeFirstKeyIfNumber(keys)).toEqual(['first', 'foo', 'bar']);
        });
    });
    describe('getErrorIndexFromKeys', () => {
        it('should return first key as number if is number', () => {
            const keys = ['1', 'foo', 'bar'];
            expect(getErrorIndexFromKeys(keys)).toEqual(1);
        });
        it('should return -1 if first key is string', () => {
            const keys = ['first', 'foo', 'bar'];
            expect(getErrorIndexFromKeys(keys)).toEqual(-1);
        });
    });
});
