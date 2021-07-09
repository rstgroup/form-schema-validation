export const pick = (object, keys) => {
    const pickedObject = {};
    keys.forEach((key) => {
        pickedObject[key] = object[key];
    });
    return pickedObject;
};

export const arraysDifference = (keys, compareKeys) => {
    const differenceBetweanObjects = [];
    keys.forEach((key) => {
        if (compareKeys.indexOf(key) < 0) differenceBetweanObjects.push(key);
    });
    return differenceBetweanObjects;
};

export const wrapToArray = (value, shouldWrapToArray) => {
    if (shouldWrapToArray && !Array.isArray(value)) return [value];
    return value;
};

export const getFieldType = (field) => {
    if (Array.isArray(field.type)) {
        return field.type[0];
    }
    return field.type;
};

export const getDefaultValueForType = (type, isArrayOfType) => {
    if (typeof type.getDefaultValue === 'function') {
        return wrapToArray(type.getDefaultValue(), isArrayOfType);
    }
    if (type === Number) {
        return wrapToArray(NaN, isArrayOfType);
    }
    if (type === Date) {
        return wrapToArray(new Date(), isArrayOfType);
    }
    return wrapToArray(type(), isArrayOfType);
};

export const getDefaultValueFromOptions = (options) => {
    const [firstOption] = options;
    if (typeof firstOption === 'object') {
        return firstOption.value;
    }
    return firstOption;
};

export const getFunctionName = (type) => {
    const { name: typeName } = type;
    if (typeof type === 'function' && !typeName) {
        const functionString = type.toString();
        return functionString
            .substr(0, functionString.indexOf('('))
            .replace('function ', '')
            .trim();
    }
    return typeName;
};

// eslint-disable-next-line no-self-compare
export const isNaN = value => typeof value === 'number' && value !== value;

export const removeFirstKeyIfNumber = (keys) => {
    const firstKey = parseInt(keys[0], 10);
    if (!isNaN(firstKey)) {
        keys.splice(0, 1);
    }
    return keys;
};

export const getErrorIndexFromKeys = (keys) => {
    const firstKey = parseInt(keys[0], 10);
    if (!isNaN(firstKey)) {
        return firstKey;
    }
    return -1;
};

const isObjectWithoutProps = (obj) => {
    if (obj === null) {
        return true;
    }

    return typeof obj === 'object'
        && !Array.isArray(obj)
        && Object.keys(obj).length === 0;
};

const isObject = obj => (
    typeof obj === 'object'
    && !Array.isArray(obj)
    && obj !== null
);

const isArrayable = src => Array.isArray(src)
    || typeof src === 'string'
    || typeof src === 'undefined';

export const isArrayOfStringsOrString = src => (
    (Array.isArray(src) && src.filter(element => typeof element === 'string').length === src.length)
    || typeof src === 'string'
);

const castAsArray = (src) => {
    if (src === null) {
        return [];
    }
    if (Array.isArray(src)) {
        return src;
    }
    if (typeof src === 'string') {
        return [src];
    }
    if (Object.keys(src).length) {
        return [src];
    }
    return [];
};

const mergeErrorsLists = (a, b) => {
    const merged = [];
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i += 1) {
        let value;
        const currentErrors = a[i];
        const nextErrors = b[i];
        if (isObject(currentErrors) && isObject(nextErrors)) {
            value = { ...currentErrors, ...nextErrors };
        } else {
            value = b[i] || a[i];
        }
        if (value && !isObjectWithoutProps(value)) {
            merged[i] = value;
        }
    }

    return merged;
};

export const mergeArraysOfStrings = (a, b) => {
    const parsedA = Array.isArray(a) ? [...a] : [a];
    const parsedB = Array.isArray(b) ? [...b] : [b];
    return [...parsedA, ...parsedB];
};

const mergeObjectsErrors = (currentErrors, nextErrors) => {
    const errors = {};
    const errorKeys = new Set();

    if (!isObjectWithoutProps(currentErrors)) {
        Object.keys(currentErrors).forEach(key => errorKeys.add(key));
    }
    if (!isObjectWithoutProps(nextErrors)) {
        Object.keys(nextErrors).forEach(key => errorKeys.add(key));
    }

    errorKeys.forEach((key) => {
        const current = currentErrors[key] || [];
        const next = nextErrors[key] || [];
        errors[key] = mergeErrors(current, next);
    });

    return errors;
};

export const mergeErrors = (currentErrors = {}, nextErrors = {}) => {
    if (isObjectWithoutProps(currentErrors) && isObjectWithoutProps(nextErrors)) {
        return {};
    }

    if (isArrayOfStringsOrString(currentErrors) && isArrayOfStringsOrString(nextErrors)) {
        return mergeArraysOfStrings(currentErrors, nextErrors);
    }

    if (isArrayable(currentErrors) || isArrayable(nextErrors)) {
        return mergeErrorsLists(castAsArray(currentErrors), castAsArray(nextErrors));
    }

    return mergeObjectsErrors(currentErrors, nextErrors);
};
