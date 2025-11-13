/**
 * User service - business logic for user operations
 * This is a sample service template
 */

const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data {name, email}
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    const { name, email } = userData;

    // Add business logic here (e.g., validation, checking duplicates)
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error(`Email '${email}' is already registered`);
    }

    // Create user
    const user = await userRepository.create({ name, email });

    logger.info('New user created:', { id: user.id, email });
    
    return user;
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    return user;
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options {limit, offset}
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers(options = {}) {
    const { limit = 50, offset = 0 } = options;
    return await userRepository.findAll(limit, offset);
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updates) {
    // Validate allowed fields
    const allowedFields = ['name', 'email'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Check if new email is already taken
    if (filteredUpdates.email) {
      const existing = await userRepository.findByEmail(filteredUpdates.email);
      if (existing && existing.id !== userId) {
        throw new Error(`Email '${filteredUpdates.email}' is already registered`);
      }
    }

    return await userRepository.update(userId, filteredUpdates);
  }

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    // Add any cleanup logic here if needed
    return await userRepository.delete(userId);
  }
}

module.exports = new UserService();

