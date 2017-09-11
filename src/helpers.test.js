import {
    pick,
    difference,
    wrapToArray,
    getFieldType,
    getDefaultValueForType,
    getDefaultValueFromOptions,
} from './helpers';

describe('helpers', () => {
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

    it('should compere two array and return difference', () => {
        const foo = ['foo', 'foo2', 'foo3', 'foo4'];
        const bar = ['foo', 'foo2'];

        expect(difference(foo, bar)).toEqual(['foo3', 'foo4']);
    });

    it('should wrap value to array', () => {
        const foo = 'test';

        expect(wrapToArray(foo, true)).toEqual(['test']);
        expect(wrapToArray(foo)).toEqual('test');
    });

    it('should get default value for type', () => {
        const number = Number;
        const string = String;
        const boolean = Boolean;
        const date = Date;
        const custom = { getDefaultValue: () => 'bar' };

        expect(isNaN(getDefaultValueForType(number))).toEqual(true);
        expect(getDefaultValueForType(string)).toEqual('');
        expect(getDefaultValueForType(boolean)).toEqual(false);
        expect(getDefaultValueForType(custom)).toEqual('bar');
        expect(getDefaultValueForType(date) instanceof Date).toEqual(true);

        expect(isNaN(getDefaultValueForType(number, true)[0])).toEqual(true);
        expect(getDefaultValueForType(string, true)).toEqual(['']);
        expect(getDefaultValueForType(boolean, true)).toEqual([false]);
        expect(getDefaultValueForType(custom, true)).toEqual(['bar']);
        expect(getDefaultValueForType(date, true)[0] instanceof Date).toEqual(true);
    });

    it('should get default value from options', () => {
        const options = [
            'test1',
            'test2',
        ];

        const options2 = [
            { label: 'test1', value: '1' },
            { label: 'test2', value: '2' },
        ];

        expect(getDefaultValueFromOptions(options)).toEqual('test1');
        expect(getDefaultValueFromOptions(options2)).toEqual('1');
    });

    it('should get field type from field', () => {
        const fooField = {
            type: String,
        };
        const barField = {
            type: [String],
        };
        expect(getFieldType(fooField)).toBe(String);
        expect(getFieldType(barField)).toBe(String);
    });
});
