const validateRequiredArray = value => Array.isArray(value) && value.length > 0;
export default validateRequiredArray;
