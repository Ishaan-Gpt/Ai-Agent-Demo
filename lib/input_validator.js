function validateInput(schema, userInput) {
    const errors = [];

    for (const field of schema) {
        const { name, type, required, options } = field;

        if (required && !userInput.hasOwnProperty(name)) {
            errors.push(`Missing required field: "${name}".`);
            continue;
        }
        
        if (userInput.hasOwnProperty(name)) {
            const value = userInput[name];
            if (type === 'string' && typeof value !== 'string') {
                errors.push(`Field "${name}" must be a string.`);
            }
            if (type === 'text' && typeof value !== 'string') {
                errors.push(`Field "${name}" must be a string (text).`);
            }
            if (type === 'dropdown' && !options.includes(value)) {
                errors.push(`Field "${name}" has an invalid value. Must be one of: ${options.join(', ')}.`);
            }
        }
    }

    if (errors.length > 0) {
        throw new Error(`Input validation failed: ${errors.join(' ')}`);
    }

    return true;
}

module.exports = { validateInput }; 