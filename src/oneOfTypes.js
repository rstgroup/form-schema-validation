class OneOfTypes {
    constructor(types) {
        this.types = types;
    }
    getTypes() {
        return this.types || [];
    }
    parseValue(value) {
        const model = {};
        this.getTypes().forEach((type, key) => {
            model[`type${key}`] = value;
        });
        return model;
    }
    getSchema() {
        const schema = {};
        this.getTypes().forEach((type, key) => {
            schema[`type${key}`] = {
                type,
                required: true
            }
        });
        return schema;
    }
}

export default OneOfTypes;
