# Database Migrations

## Overview

Migrations help you version control your database schema. Each migration file represents a change to the database structure.

## Quick Start

```bash
# Run all migrations
node migrate.js

# Rollback migrations (if needed)
node migrate.js down
```

## Creating a New Migration

### Step 1: Copy the Template
```bash
cp migrations/MIGRATION_TEMPLATE.js migrations/002_create_products.js
```

### Step 2: Edit the Migration
```javascript
module.exports = {
  up: (db, callback) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, callback);
  },

  down: (db, callback) => {
    db.run('DROP TABLE IF EXISTS products', callback);
  }
};
```

### Step 3: Run the Migration
```bash
node migrate.js
```

## Migration Naming Convention

Format: `XXX_description.js`

Examples:
- `001_create_users.js`
- `002_create_products.js`
- `003_add_user_phone.js`
- `004_create_orders.js`

**Note**: Migrations run in alphabetical order, so use numbered prefixes.

## Common Migration Patterns

### 1. Create Table
```javascript
up: (db, callback) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS table_name (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, callback);
}
```

### 2. Add Column
```javascript
up: (db, callback) => {
  db.run(`
    ALTER TABLE users ADD COLUMN phone TEXT
  `, callback);
}
```

### 3. Create Index
```javascript
up: (db, callback) => {
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email)
  `, callback);
}
```

### 4. Create Unique Index
```javascript
up: (db, callback) => {
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username 
    ON users(username)
  `, callback);
}
```

### 5. Table with Foreign Key
```javascript
up: (db, callback) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, callback);
}
```

### 6. Multiple Statements
```javascript
up: (db, callback) => {
  // Execute statements sequentially
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `, (err) => {
    if (err) return callback(err);
    
    db.run(`
      CREATE INDEX idx_products_name ON products(name)
    `, callback);
  });
}
```

### 7. Insert Initial Data
```javascript
up: (db, callback) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `, (err) => {
    if (err) return callback(err);
    
    // Insert seed data
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    stmt.run('Electronics');
    stmt.run('Books');
    stmt.run('Clothing');
    stmt.finalize(callback);
  });
}
```

## Rollback Migrations

Rollbacks undo migrations in reverse order:

```javascript
down: (db, callback) => {
  // Drop what you created
  db.run('DROP TABLE IF EXISTS table_name', callback);
}
```

```bash
# Rollback all migrations
node migrate.js down
```

## Best Practices

### 1. Never Modify Existing Migrations
Once a migration has been run in production, create a new migration instead of modifying the old one.

❌ **Don't do this:**
```javascript
// Modifying 001_create_users.js after it's been deployed
```

✅ **Do this instead:**
```javascript
// Create 002_add_user_phone.js
```

### 2. Always Provide Rollback (down)
Every migration should have a `down` function to undo changes:

```javascript
module.exports = {
  up: (db, callback) => {
    // Create table
  },
  down: (db, callback) => {
    // Drop table
  }
};
```

### 3. Test Migrations Locally First
```bash
# Test up migration
node migrate.js

# Test down migration
node migrate.js down

# Test up again
node migrate.js
```

### 4. Use IF NOT EXISTS / IF EXISTS
Prevents errors if migration runs multiple times:

```javascript
CREATE TABLE IF NOT EXISTS ...
DROP TABLE IF EXISTS ...
CREATE INDEX IF NOT EXISTS ...
```

### 5. Handle Errors Properly
Always check for errors and call callback:

```javascript
up: (db, callback) => {
  db.run(sql, (err) => {
    if (err) {
      return callback(err); // Return error
    }
    callback(); // Success
  });
}
```

### 6. Keep Migrations Simple
One migration = one logical change

❌ **Don't:**
```javascript
// Create users, products, orders, and categories all in one migration
```

✅ **Do:**
```javascript
// 001_create_users.js
// 002_create_products.js
// 003_create_orders.js
// 004_create_categories.js
```

## SQLite Data Types

```javascript
INTEGER  // Whole numbers
REAL     // Floating point
TEXT     // Strings
BLOB     // Binary data
NULL     // Null value
```

## Common Column Definitions

```javascript
id INTEGER PRIMARY KEY AUTOINCREMENT  // Auto-incrementing ID
name TEXT NOT NULL                    // Required text
email TEXT UNIQUE                     // Unique text
price REAL DEFAULT 0.0               // Number with default
is_active INTEGER DEFAULT 1          // Boolean (0 or 1)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP  // Timestamp
```

## Foreign Keys

Enable foreign keys in your database connection:
```javascript
db.run('PRAGMA foreign_keys = ON');
```

Define foreign key constraints:
```javascript
FOREIGN KEY (user_id) REFERENCES users(id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
```

## Migration Workflow

1. **Create Migration File**
   ```bash
   cp migrations/MIGRATION_TEMPLATE.js migrations/003_add_feature.js
   ```

2. **Write Up and Down Functions**
   ```javascript
   module.exports = {
     up: (db, callback) => { /* ... */ },
     down: (db, callback) => { /* ... */ }
   };
   ```

3. **Test Locally**
   ```bash
   node migrate.js        # Run migration
   node migrate.js down   # Test rollback
   node migrate.js        # Run again
   ```

4. **Commit and Deploy**
   ```bash
   git add migrations/003_add_feature.js
   git commit -m "Add migration for new feature"
   ```

5. **Run on Server**
   ```bash
   node migrate.js
   ```

## Example: Complete Migration

```javascript
/**
 * Migration: Create products and categories
 * File: 002_create_products_and_categories.js
 */

module.exports = {
  up: (db, callback) => {
    // Create categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) return callback(err);

      // Create products table with foreign key
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL DEFAULT 0.0,
          category_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `, (err) => {
        if (err) return callback(err);

        // Create indexes
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_products_category 
          ON products(category_id)
        `, callback);
      });
    });
  },

  down: (db, callback) => {
    // Drop in reverse order (products before categories)
    db.run('DROP TABLE IF EXISTS products', (err) => {
      if (err) return callback(err);
      db.run('DROP TABLE IF EXISTS categories', callback);
    });
  }
};
```

## Troubleshooting

### Migration Fails
- Check SQL syntax
- Verify table/column names
- Check foreign key constraints
- Review error message in console

### Table Already Exists
- Use `IF NOT EXISTS` in CREATE statements
- Check if migration was already run

### Foreign Key Errors
- Ensure foreign keys are enabled: `PRAGMA foreign_keys = ON`
- Verify referenced table exists
- Check constraint definitions

---

For a template to copy, see `MIGRATION_TEMPLATE.js`.

