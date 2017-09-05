class SchemaType {
    constructor(name, { getDefaultValue, validator, requiredValidator }) {
        this.name = name;
        this.getDefaultValue = getDefaultValue;
        this.validator = validator;
        this.requiredValidator = requiredValidator;
    }
}

export default SchemaType;
