/**
 * Migration Template
 * Copy this file and rename it with a number prefix: XXX_description.js
 * Example: 002_create_products.js
 */

module.exports = {
  /**
   * Apply migration (create/modify database schema)
   * @param {Object} db - SQLite database instance
   * @param {Function} callback - Callback function(err)
   */
  up: (db, callback) => {
    // Example: Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS your_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        callback(err);
        return;
      }

      // Optional: Create indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_your_table_name ON your_table(name)
      `, callback);
    });
  },

  /**
   * Rollback migration (undo changes)
   * @param {Object} db - SQLite database instance
   * @param {Function} callback - Callback function(err)
   */
  down: (db, callback) => {
    db.run('DROP TABLE IF EXISTS your_table', callback);
  }
};

/*
 * Common Migration Patterns:
 * 
 * 1. Add Column:
 *    ALTER TABLE users ADD COLUMN phone TEXT
 * 
 * 2. Create Index:
 *    CREATE INDEX idx_users_email ON users(email)
 * 
 * 3. Foreign Key:
 *    CREATE TABLE orders (
 *      id INTEGER PRIMARY KEY,
 *      user_id INTEGER,
 *      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 *    )
 * 
 * 4. Unique Constraint:
 *    CREATE UNIQUE INDEX idx_users_username ON users(username)
 * 
 * 5. Multiple Statements:
 *    db.run(statement1, (err) => {
 *      if (err) return callback(err);
 *      db.run(statement2, callback);
 *    });
 */

