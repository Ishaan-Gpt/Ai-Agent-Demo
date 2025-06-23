/**
 * Utility to merge static fields with user inputs for agent execution
 */

/**
 * Processes placeholders in field values
 * @param {string} value - Field value that may contain placeholders
 * @param {Object} userInputs - User-provided inputs for substitution
 * @returns {string} Processed value with placeholders replaced
 */
function processPlaceholders(value, userInputs = {}) {
    if (typeof value !== 'string') {
        return value;
    }
    
    let processedValue = value;
    
    // Replace timestamp placeholder
    if (processedValue.includes('{{timestamp}}')) {
        processedValue = processedValue.replace('{{timestamp}}', new Date().toISOString());
    }
    
    // Replace API key placeholder
    if (processedValue.includes('{{API_KEY}}')) {
        const apiKey = userInputs.api_key || userInputs.apiKey || userInputs.key;
        if (apiKey) {
            processedValue = processedValue.replace('{{API_KEY}}', apiKey);
        } else {
            console.warn('[MergeFields] API_KEY placeholder found but no API key provided in user inputs');
        }
    }
    
    // Replace user ID placeholder
    if (processedValue.includes('{{USER_ID}}')) {
        // This will be handled in mergeFields function
        processedValue = processedValue.replace('{{USER_ID}}', '{{USER_ID_PLACEHOLDER}}');
    }
    
    return processedValue;
}

/**
 * Processes headers to replace placeholders
 * @param {Object} headers - Headers object
 * @param {Object} userInputs - User-provided inputs
 * @returns {Object} Processed headers
 */
function processHeaders(headers = {}, userInputs = {}) {
    const processedHeaders = {};
    
    for (const [key, value] of Object.entries(headers)) {
        processedHeaders[key] = processPlaceholders(value, userInputs);
    }
    
    return processedHeaders;
}

/**
 * Merges static fields with user inputs to create the final payload
 * @param {Object} staticFields - Static fields defined by creator
 * @param {Object} userInputs - User-provided inputs
 * @param {string} userId - Current user ID
 * @returns {Object} Merged payload for agent execution
 */
function mergeFields(staticFields = {}, userInputs = {}, userId = null) {
    // Process static fields to replace placeholders
    const processedStaticFields = {};
    for (const [key, value] of Object.entries(staticFields)) {
        processedStaticFields[key] = processPlaceholders(value, userInputs);
    }

    // Create merged payload
    const mergedPayload = {
        // Add user ID if provided
        ...(userId && { user_id: userId }),
        
        // Add static fields first (these are creator-defined)
        ...processedStaticFields,
        
        // Add user inputs (these override static fields if same key)
        ...userInputs
    };

    // Replace any remaining USER_ID placeholders
    for (const [key, value] of Object.entries(mergedPayload)) {
        if (typeof value === 'string' && value.includes('{{USER_ID_PLACEHOLDER}}')) {
            mergedPayload[key] = value.replace('{{USER_ID_PLACEHOLDER}}', userId || 'anonymous');
        }
    }

    return mergedPayload;
}

/**
 * Validates that all required static fields are present
 * @param {Object} staticFields - Static fields to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
function validateStaticFields(staticFields = {}, requiredFields = []) {
    const errors = [];
    
    for (const field of requiredFields) {
        if (!staticFields.hasOwnProperty(field) || !staticFields[field]) {
            errors.push(`Missing required static field: ${field}`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validates user inputs against agent schema
 * @param {Array} inputSchema - Agent input schema
 * @param {Object} userInputs - User-provided inputs
 * @returns {Object} Validation result
 */
function validateUserInputs(inputSchema = [], userInputs = {}) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    for (const field of inputSchema) {
        if (field.required && (!userInputs[field.name] || userInputs[field.name] === '')) {
            errors.push(`Missing required field: ${field.label || field.name}`);
        }
    }
    
    // Check field types and validate
    for (const field of inputSchema) {
        const value = userInputs[field.name];
        if (value !== undefined && value !== '') {
            // Type validation
            if (field.type === 'number' && isNaN(Number(value))) {
                errors.push(`${field.label || field.name} must be a number`);
            }
            
            if (field.type === 'url' && !isValidUrl(value)) {
                errors.push(`${field.label || field.name} must be a valid URL`);
            }
            
            if (field.type === 'email' && !isValidEmail(value)) {
                errors.push(`${field.label || field.name} must be a valid email address`);
            }
            
            // Length validation
            if (field.max_length && value.length > field.max_length) {
                errors.push(`${field.label || field.name} must be ${field.max_length} characters or less`);
            }
            
            if (field.min_length && value.length < field.min_length) {
                errors.push(`${field.label || field.name} must be at least ${field.min_length} characters`);
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
 * Simple URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Simple email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Prepares headers for the request, including defaults
 * @param {Object} customHeaders - Custom headers from agent config
 * @param {Object} userInputs - User-provided inputs for header substitution
 * @returns {Object} Final headers object
 */
function prepareHeaders(customHeaders = {}, userInputs = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Agent-Marketplace/1.0'
    };
    
    const processedHeaders = processHeaders(customHeaders, userInputs);
    
    return {
        ...defaultHeaders,
        ...processedHeaders
    };
}

/**
 * Creates the final execution payload with all necessary data
 * @param {Object} agent - Agent configuration
 * @param {Object} userInputs - User-provided inputs
 * @param {string} userId - Current user ID
 * @returns {Object} Complete execution payload
 */
function createExecutionPayload(agent, userInputs, userId) {
    // Validate user inputs first
    const validation = validateUserInputs(agent.input_schema, userInputs);
    if (!validation.isValid) {
        throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
    }
    
    const payload = mergeFields(agent.static_fields, userInputs, userId);
    
    return {
        url: agent.execution_url,
        method: agent.http_method || 'POST',
        headers: prepareHeaders(agent.headers, userInputs),
        data: payload
    };
}

module.exports = {
    mergeFields,
    validateStaticFields,
    validateUserInputs,
    prepareHeaders,
    createExecutionPayload,
    processPlaceholders,
    processHeaders
}; 