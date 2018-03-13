const validateObject = value => typeof value === 'object' && !Array.isArray(value) && value !== null;
export default validateObject;
