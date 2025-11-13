/**
 * Global error handling middleware
 */

const logger = require('../utils/logger');
const { GameError, ValidationError } = require('../utils/errors');
const { formatErrorResponse } = require('../utils/helpers');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle known game errors
  if (err instanceof GameError) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err.message)
    );
  }

  // Handle validation errors
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err.message, err.errors)
    );
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    return res.status(400).json(
      formatErrorResponse('Validation failed', errors)
    );
  }

  // Handle database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json(
          formatErrorResponse('Resource already exists')
        );
      case '23503': // Foreign key violation
        return res.status(400).json(
          formatErrorResponse('Invalid reference to related resource')
        );
      case '23502': // Not null violation
        return res.status(400).json(
          formatErrorResponse('Required field is missing')
        );
      default:
        logger.error('Database error:', { code: err.code, detail: err.detail });
    }
  }

  // Generic server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json(
    formatErrorResponse(message)
  );
}

/**
 * Handle 404 errors
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function notFoundHandler(req, res) {
  res.status(404).json(
    formatErrorResponse(`Route ${req.originalUrl} not found`)
  );
}

module.exports = {
  errorHandler,
  notFoundHandler
};
