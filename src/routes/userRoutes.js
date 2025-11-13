/**
 * User routes - Sample CRUD routes template
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
  createUserValidation,
  userIdValidation
} = require('../middleware/validator');
const { createResourceLimiter } = require('../middleware/rateLimiter');

// Create new user
router.post('/', createResourceLimiter, createUserValidation, userController.createUser);

// Get all users (with pagination)
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userIdValidation, userController.getUser);

// Update user
router.patch('/:id', userIdValidation, userController.updateUser);

// Delete user
router.delete('/:id', userIdValidation, userController.deleteUser);

module.exports = router;

