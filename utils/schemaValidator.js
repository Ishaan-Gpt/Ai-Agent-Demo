const { validateInput } = require('../lib/input_validator');

/**
 * Enhanced schema validator with additional validation types
 */
class SchemaValidator {
    /**
     * Validates user input against agent schema
     * @param {Array} schema - The agent's input schema
     * @param {Object} userInput - User provided input
     * @returns {Object} Validation result
     */
    static validate(schema, userInput) {
        const errors = [];
        const warnings = [];

        // Basic validation using existing validator
        try {
            validateInput(schema, userInput);
        } catch (error) {
            errors.push(error.message);
        }

        // Enhanced validation for specific field types
        for (const field of schema) {
            const { name, type, required, options, minLength, maxLength, pattern } = field;

            if (userInput.hasOwnProperty(name)) {
                const value = userInput[name];

                // String length validation
                if (type === 'string' || type === 'text') {
                    if (minLength && value.length < minLength) {
                        errors.push(`Field "${name}" must be at least ${minLength} characters long.`);
                    }
                    if (maxLength && value.length > maxLength) {
                        errors.push(`Field "${name}" must be no more than ${maxLength} characters long.`);
                    }
                }

                // URL validation
                if (type === 'url') {
                    try {
                        new URL(value);
                    } catch {
                        errors.push(`Field "${name}" must be a valid URL.`);
                    }
                }

                // Email validation
                if (type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        errors.push(`Field "${name}" must be a valid email address.`);
                    }
                }

                // Number validation
                if (type === 'number') {
                    if (isNaN(value) || typeof value !== 'number') {
                        errors.push(`Field "${name}" must be a valid number.`);
                    }
                }

                // Pattern validation
                if (pattern) {
                    const regex = new RegExp(pattern);
                    if (!regex.test(value)) {
                        errors.push(`Field "${name}" does not match the required pattern.`);
                    }
                }

                // Dropdown validation with custom options
                if (type === 'dropdown' && options) {
                    if (!options.includes(value)) {
                        errors.push(`Field "${name}" must be one of: ${options.join(', ')}.`);
                    }
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Generates a sample input object based on schema
     * @param {Array} schema - The agent's input schema
     * @returns {Object} Sample input object
     */
    static generateSampleInput(schema) {
        const sampleInput = {};

        for (const field of schema) {
            const { name, type, required, options } = field;

            if (required) {
                switch (type) {
                    case 'string':
                    case 'text':
                        sampleInput[name] = `Sample ${name}`;
                        break;
                    case 'url':
                        sampleInput[name] = 'https://example.com';
                        break;
                    case 'email':
                        sampleInput[name] = 'user@example.com';
                        break;
                    case 'number':
                        sampleInput[name] = 42;
                        break;
                    case 'dropdown':
                        sampleInput[name] = options ? options[0] : 'option1';
                        break;
                    default:
                        sampleInput[name] = `Sample ${name}`;
                }
            }
        }

        return sampleInput;
    }

    /**
     * Renders a form field based on schema
     * @param {Object} field - Schema field definition
     * @returns {Object} Form field configuration
     */
    static getFieldConfig(field) {
        const { name, type, required, options, description, placeholder } = field;

        const config = {
            name: name,
            type: this.mapFieldType(type),
            required: required || false,
            label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            placeholder: placeholder || `Enter ${name.replace(/_/g, ' ')}`,
            description: description
        };

        if (type === 'dropdown' && options) {
            config.options = options;
        }

        return config;
    }

    /**
     * Maps schema field types to HTML input types
     * @param {string} schemaType - Schema field type
     * @returns {string} HTML input type
     */
    static mapFieldType(schemaType) {
        const typeMap = {
            'string': 'text',
            'text': 'textarea',
            'url': 'url',
            'email': 'email',
            'number': 'number',
            'dropdown': 'select',
            'password': 'password',
            'file': 'file'
        };

        return typeMap[schemaType] || 'text';
    }
}

module.exports = SchemaValidator; 