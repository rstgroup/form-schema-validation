const validateRequiredNumber = value => typeof value === 'number' && !Number.isNaN(value);
export default validateRequiredNumber;
