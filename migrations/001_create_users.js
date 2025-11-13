/**
 * Migration: Create users table
 * This is a sample migration for the User entity
 */

module.exports = {
  /**
   * Apply migration
   * @param {Object} db - SQLite database instance
   * @param {Function} callback - Callback function
   */
  up: (db, callback) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        callback(err);
        return;
      }

      // Create index on email for faster lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `, callback);
    });
  },

  /**
   * Rollback migration
   * @param {Object} db - SQLite database instance
   * @param {Function} callback - Callback function
   */
  down: (db, callback) => {
    db.run('DROP TABLE IF EXISTS users', callback);
  }
};

