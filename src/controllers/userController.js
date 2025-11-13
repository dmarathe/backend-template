/**
 * User controller - handles user-related HTTP requests
 * This is a sample controller template
 */

const userService = require('../services/userService');
const { formatResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

class UserController {
  /**
   * Create a new user
   * POST /api/v1/users
   */
  async createUser(req, res, next) {
    try {
      const { name, email } = req.body;
      
      const user = await userService.createUser({ name, email });
      
      res.status(201).json(
        formatResponse(true, user, 'User created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      const user = await userService.getUserById(userId);
      
      res.json(
        formatResponse(true, user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination
   * GET /api/v1/users?limit=10&offset=0
   */
  async getAllUsers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const users = await userService.getAllUsers({ limit, offset });
      
      res.json(
        formatResponse(true, {
          users,
          count: users.length,
          limit,
          offset
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PATCH /api/v1/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await userService.updateUser(userId, updates);
      
      res.json(
        formatResponse(true, user, 'User updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      await userService.deleteUser(userId);
      
      res.json(
        formatResponse(true, null, 'User deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

