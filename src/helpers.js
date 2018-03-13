export const pick = (object, keys) => {
    const pickedObject = {};
    keys.forEach((key) => {
        pickedObject[key] = object[key];
    });
    return pickedObject;
};

export const includes = (array, value) => array.indexOf(value) < 0;

export const arraysDifference = (array, values) => array.filter(key => includes(values, key));

export const wrapToArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
};

export const getFieldType = (field) => {
    if (Array.isArray(field.type)) {
        return field.type[0];
    }
    return field.type;
};

export const getFieldDefaultValue = (field) => {
    const fieldType = getFieldType(field);

    if (field.defaultValue !== undefined) {
        return field.defaultValue;
    } else if (field.options) {
        return getDefaultValueFromOptions(field.options);
    }

    return getDefaultValueForType(fieldType);
};

export const getDefaultValueForType = (type) => {
    if (typeof type.getDefaultValue === 'function') {
        return type.getDefaultValue();
    }
    if (type === Number) {
        return NaN;
    }
    if (type === Date) {
        return new Date();
    }
    return type();
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
    if (typeof nextErrors === 'string') {
        if (!Array.isArray(currentErrors)) {
            return [nextErrors];
        }
        return [...currentErrors, nextErrors];
    }
    Object.keys(currentErrors).forEach(key => errorKeys.add(key));
    Object.keys(nextErrors).forEach(key => errorKeys.add(key));
    errorKeys.forEach((key) => {
        const current = currentErrors[key] || [];
        const next = nextErrors[key] || [];
        errors[key] = [...wrapToArray(current), ...wrapToArray(next)];
    });
    return errors;
};

export const isPromise = object => typeof object === 'object' && typeof object.then === 'function' && typeof object.catch === 'function';
