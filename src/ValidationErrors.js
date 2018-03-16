import {
    wrapToArray,
} from './helpers';

export default class ValidationErrors {
    static mergeErrors(currentErrors = [], nextErrors = []) {
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
    }

    constructor() {
        this.errors = [];
    }

    createError(errorMessage, index) {
        if (index > -1) {
            this.errors[index] = ValidationErrors.mergeErrors(this.errors[index], errorMessage);
            return;
        }
        this.errors.push(errorMessage);
    }

    clearErrors() {
        this.errors = [];
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    getErrors() {
        return this.errors;
    }
}
