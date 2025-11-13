/**
 * Database configuration and connection for SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

// Create database path
const dbPath = path.join(__dirname, '../../database.sqlite');

// Create SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Error opening database:', err.message);
    process.exit(1);
  }
  logger.info('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrapper functions to maintain similar API to PostgreSQL
async function query(text, params = []) {
  return new Promise((resolve, reject) => {
    logger.debug('Executing query:', text, params);

    // For SELECT queries
    if (text.trim().toUpperCase().startsWith('SELECT') ||
        text.trim().toUpperCase().startsWith('PRAGMA')) {
      db.all(text, params, (err, rows) => {
        if (err) {
          logger.error('Database query error:', { text, error: err.message });
          reject(err);
        } else {
          // Convert to PostgreSQL-like format
          resolve({
            rows,
            rowCount: rows.length
          });
        }
      });
    } else {
      // For INSERT, UPDATE, DELETE
      db.run(text, params, function(err) {
        if (err) {
          logger.error('Database query error:', { text, error: err.message });
          reject(err);
        } else {
          // Convert to PostgreSQL-like format
          resolve({
            rows: this.changes ? [{ id: this.lastID }] : [],
            rowCount: this.changes || 0
          });
        }
      });
    }
  });
}

async function getClient() {
  // SQLite doesn't need connection pooling like PostgreSQL
  // Return the database instance directly
  return {
    query: (text, params) => query(text, params),
    release: () => {} // No-op for SQLite
  };
}

module.exports = {
  db,
  query,
  getClient
};
