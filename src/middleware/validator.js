/**
 * Request validation middleware using express-validator
 * Add your custom validation rules here
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to check validation results
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()));
  }
  next();
}

// ========================================
// Sample validation rules for User entity
// ========================================

const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  validate
];

const userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  validate
];

// ========================================
// Add your own validation rules here
// ========================================

// Example: Product validation
// const createProductValidation = [
//   body('name')
//     .trim()
//     .isLength({ min: 3, max: 200 })
//     .withMessage('Product name must be between 3 and 200 characters'),
//   body('price')
//     .isFloat({ min: 0 })
//     .withMessage('Price must be a positive number'),
//   validate
// ];

module.exports = {
  validate,
  createUserValidation,
  userIdValidation
  // Export your validation rules here
};
