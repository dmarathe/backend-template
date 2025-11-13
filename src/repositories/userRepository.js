/**
 * User repository - handles database operations for users
 * This is a sample repository template
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data {name, email}
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const { name, email } = userData;
    
    const result = await query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    // Get the inserted row
    const userResult = await query(
      'SELECT * FROM users WHERE id = last_insert_rowid()'
    );

    const user = userResult.rows[0];
    logger.info('User created in DB:', { id: user.id, email });
    return user;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   * @throws {Error} If user not found
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get all users with pagination
   * @param {number} limit - Maximum number of users to return
   * @param {number} offset - Number of users to skip
   * @returns {Promise<Array>} Array of users
   */
  async findAll(limit = 50, offset = 0) {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    return await this.findById(id);
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    // First check if user exists
    await this.findById(id);
    
    const result = await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    logger.info('User deleted from DB:', { id });
    return result.rowCount > 0;
  }

  /**
   * Check if user exists
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE id = ?) as exists',
      [id]
    );
    
    return result.rows[0].exists === 1;
  }
}

module.exports = new UserRepository();

