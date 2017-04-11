export const pick = (object, keys) => {
    const pickedObject = {};
    keys.forEach(key => {
        pickedObject[key] = object[key];
    });
    return pickedObject;
};

export const difference = (keys, compareKeys) => {
    const differenceBetweanObjects = [];
    keys.forEach(key => {
        if (compareKeys.indexOf(key) < 0) differenceBetweanObjects.push(key);
    });
    return differenceBetweanObjects;
};
