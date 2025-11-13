/**
 * Helper utility functions
 */

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {Object} data - Response data
 * @param {string} message - Optional message
 * @returns {Object} Formatted response
 */
function formatResponse(success, data, message = null) {
  const response = { success };
  
  if (data) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Format error response
 * @param {string} error - Error message
 * @param {Array} errors - Optional array of validation errors
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, errors = null) {
  const response = {
    success: false,
    error
  };
  
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  
  return response;
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  formatResponse,
  formatErrorResponse,
  delay
};
