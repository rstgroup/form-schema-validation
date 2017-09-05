export const pick = (object, keys) => {
    const pickedObject = {};
    keys.forEach((key) => {
        pickedObject[key] = object[key];
    });
    return pickedObject;
};

export const difference = (keys, compareKeys) => {
    const differenceBetweanObjects = [];
    keys.forEach((key) => {
        if (compareKeys.indexOf(key) < 0) differenceBetweanObjects.push(key);
    });
    return differenceBetweanObjects;
};

export const wrapToArray = (value, shouldWrapToArray) => {
    if (shouldWrapToArray) return [value];
    return value;
};

export const getDefaultValueForType = (type, isArrayOfType) => {
    if (typeof type.getDefaultValue === 'function') {
        return wrapToArray(type.getDefaultValue(), isArrayOfType);
    }
    if (type === Number) {
        return wrapToArray(NaN, isArrayOfType);
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
