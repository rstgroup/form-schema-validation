export default class Field {
    static createFieldsFromRawSchema(schema) {
        const fields = {};
        Object.keys(schema).forEach((key) => {
            fields[key] = new Field(schema[key]);
        });
        return fields;
    }

    constructor({
        type,
        required,
        label,
        defaultValue,
        validators,
        options,
    }) {
        this.type = type;
        this.required = required;
        this.label = label;
        this.defaultValue = defaultValue;
        this.validators = validators;
        this.options = options;
    }
}
