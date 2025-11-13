/**
 * Test setup and utilities
 * This file provides helper functions for testing
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Test database path
const TEST_DB_PATH = path.join(__dirname, 'test.sqlite');

/**
 * Create a test database connection
 * @returns {Promise<Object>} Database instance
 */
function createTestDatabase() {
  return new Promise((resolve, reject) => {
    // Remove existing test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    const db = new sqlite3.Database(TEST_DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      }
    });
  });
}

/**
 * Close and cleanup test database
 * @param {Object} db - Database instance
 * @returns {Promise<void>}
 */
function cleanupTestDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        // Remove test database file
        if (fs.existsSync(TEST_DB_PATH)) {
          fs.unlinkSync(TEST_DB_PATH);
        }
        resolve();
      }
    });
  });
}

/**
 * Run a database query for testing
 * @param {Object} db - Database instance
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
}

/**
 * Create test tables (users table for testing)
 * @param {Object} db - Database instance
 * @returns {Promise<void>}
 */
function createTestTables(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Insert test data
 * @param {Object} db - Database instance
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<number>} Inserted row ID
 */
function insertTestData(db, table, data) {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    db.run(sql, values, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

module.exports = {
  createTestDatabase,
  cleanupTestDatabase,
  runQuery,
  createTestTables,
  insertTestData,
  TEST_DB_PATH
};

