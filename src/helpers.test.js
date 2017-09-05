import {
    pick,
    difference,
    wrapToArray,
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
        const foo = Number;
        const bar = String;
        const foo3 = { getDefaultValue: () => 'bar' };

        expect(isNaN(getDefaultValueForType(foo))).toEqual(true);
        expect(getDefaultValueForType(bar)).toEqual('');
        expect(getDefaultValueForType(foo3)).toEqual('bar');
        expect(isNaN(getDefaultValueForType(foo, true)[0])).toEqual(true);
        expect(getDefaultValueForType(bar, true)).toEqual(['']);
        expect(getDefaultValueForType(foo3, true)).toEqual(['bar']);
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
});
