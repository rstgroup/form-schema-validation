const validateRequiredObject = value => typeof value === 'object' && value !== null && Object.keys(value).length > 0;
export default validateRequiredObject;
