#!/usr/bin/env node

/**
 * Simple SQLite migration runner
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Create database path (same as in src/config/database.js)
const dbPath = path.join(__dirname, 'database.sqlite');

// Create SQLite database connection for migrations
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database for migrations');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const migrationsDir = path.join(__dirname, 'migrations');

function runMigration(migrationPath) {
  return new Promise((resolve, reject) => {
    try {
      const migration = require(migrationPath);

      if (!migration.up) {
        console.log(` Migration ${path.basename(migrationPath)} has no up function`);
        resolve();
        return;
      }

      // Call the migration up function
      migration.up(db, (err) => {
        if (err) {
          console.error(` Migration ${path.basename(migrationPath)} failed:`, err);
          reject(err);
        } else {
          console.log(`Migration ${path.basename(migrationPath)} completed`);
          resolve();
        }
      });
    } catch (error) {
      console.error(`Error loading migration ${migrationPath}:`, error.message);
      reject(error);
    }
  });
}

async function runMigrations(direction = 'up') {
  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();

  console.log(` Running ${files.length} migrations ${direction}...`);

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    await runMigration(migrationPath);
  }
}

// Main execution
const command = process.argv[2] || 'up';

if (command === 'up') {
  runMigrations('up')
    .then(() => {
      console.log(' All migrations completed successfully!');
      db.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Migration failed:', error);
      db.close();
      process.exit(1);
    });
} else if (command === 'down') {
  runMigrations('down')
    .then(() => {
      console.log('All rollbacks completed successfully!');
      db.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Rollback failed:', error);
      db.close();
      process.exit(1);
    });
} else {
  console.log('Usage: node migrate.js [up|down]');
  db.close();
  process.exit(1);
}
