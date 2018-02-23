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

/* eslint-disable */
export const isNaN = value => typeof value === 'number' && value !== value;
/* eslint-enable */

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

export const mergeErrors = (currentErrors = {}, nextErrors = {}) => {
    const errors = {};
    const errorKeys = new Set();
    Object.keys(currentErrors).forEach(key => errorKeys.add(key));
    Object.keys(nextErrors).forEach(key => errorKeys.add(key));
    errorKeys.forEach((key) => {
        const current = currentErrors[key] || [];
        const next = nextErrors[key] || [];
        errors[key] = [...current, ...next];
    });
    return errors;
};
