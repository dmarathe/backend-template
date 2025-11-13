# Quick Reference Guide

## 🎯 Adding a New Resource (e.g., "Product")

### 1. Repository Layer (`src/repositories/productRepository.js`)
```javascript
const { query } = require('../config/database');

class ProductRepository {
  async create(data) {
    const result = await query('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, data.price]);
    const product = await query('SELECT * FROM products WHERE id = last_insert_rowid()');
    return product.rows[0];
  }
  
  async findById(id) {
    const result = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (result.rows.length === 0) throw new Error(`Product ${id} not found`);
    return result.rows[0];
  }
  
  async findAll(limit, offset) {
    const result = await query('SELECT * FROM products LIMIT ? OFFSET ?', [limit, offset]);
    return result.rows;
  }
  
  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
    return await this.findById(id);
  }
  
  async delete(id) {
    await query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new ProductRepository();
```

### 2. Service Layer (`src/services/productService.js`)
```javascript
const productRepository = require('../repositories/productRepository');

class ProductService {
  async createProduct(data) {
    // Add validation, business logic
    return await productRepository.create(data);
  }
  
  async getProductById(id) {
    return await productRepository.findById(id);
  }
  
  async getAllProducts(options) {
    const { limit = 50, offset = 0 } = options;
    return await productRepository.findAll(limit, offset);
  }
  
  async updateProduct(id, updates) {
    // Add validation
    return await productRepository.update(id, updates);
  }
  
  async deleteProduct(id) {
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
```

### 3. Controller Layer (`src/controllers/productController.js`)
```javascript
const productService = require('../services/productService');
const { formatResponse } = require('../utils/helpers');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(formatResponse(true, product, 'Created'));
    } catch (error) {
      next(error);
    }
  }
  
  async getProduct(req, res, next) {
    try {
      const product = await productService.getProductById(parseInt(req.params.id));
      res.json(formatResponse(true, product));
    } catch (error) {
      next(error);
    }
  }
  
  async getAllProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const products = await productService.getAllProducts({ limit, offset });
      res.json(formatResponse(true, { products, count: products.length, limit, offset }));
    } catch (error) {
      next(error);
    }
  }
  
  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(parseInt(req.params.id), req.body);
      res.json(formatResponse(true, product, 'Updated'));
    } catch (error) {
      next(error);
    }
  }
  
  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(parseInt(req.params.id));
      res.json(formatResponse(true, null, 'Deleted'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
```

### 4. Routes (`src/routes/productRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { createResourceLimiter } = require('../middleware/rateLimiter');

router.post('/', createResourceLimiter, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

### 5. Register Routes (`src/routes/index.js`)
```javascript
const productRoutes = require('./productRoutes');
router.use('/products', productRoutes);
```

## 📝 Adding Validation

In `src/middleware/validator.js`:

```javascript
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Name must be between 3 and 200 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  validate
];

// Export it
module.exports = {
  // ... existing exports
  createProductValidation
};
```

Use in routes:
```javascript
const { createProductValidation } = require('../middleware/validator');
router.post('/', createProductValidation, productController.createProduct);
```

## 🔄 Adding a Background Job

In `src/jobs/cleanupJob.js`:

```javascript
const cron = require('node-cron');
const logger = require('../utils/logger');

class CleanupJob {
  constructor() {
    this.isRunning = false;
  }

  start(schedule = '0 2 * * *') { // 2 AM daily
    this.job = cron.schedule(schedule, async () => {
      await this.execute();
    });
    this.isRunning = true;
    logger.info('Cleanup job started');
  }

  async execute() {
    try {
      // Your cleanup logic
      logger.info('Cleanup completed');
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
    }
  }
}

module.exports = new CleanupJob();
```

Register in `src/app.js`:
```javascript
const cleanupJob = require('./jobs/cleanupJob');
cleanupJob.start();
```

## 🎨 Cron Schedule Examples

```javascript
'*/5 * * * *'     // Every 5 minutes
'0 * * * *'       // Every hour
'0 0 * * *'       // Daily at midnight
'0 2 * * *'       // Daily at 2 AM
'0 0 * * 0'       // Weekly (Sunday)
'0 0 1 * *'       // Monthly (1st day)
```

## 🛠️ Common Patterns

### Custom Error
```javascript
throw new Error('Custom error message');
```

### Logging
```javascript
logger.info('Message', { data });
logger.error('Error', error);
logger.debug('Debug info');
logger.warn('Warning');
```

### Response Format
```javascript
// Success with data
formatResponse(true, data, 'Optional message')

// Success without data
formatResponse(true, null, 'Success message')

// Error (handled by middleware)
throw new Error('Error message')
```

### Pagination
```javascript
async getAllProducts(req, res, next) {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const products = await productService.getAllProducts({ limit, offset });
  res.json(formatResponse(true, { products, count: products.length, limit, offset }));
}
```

## 📊 Database Queries

### Insert
```javascript
await query('INSERT INTO table (col1, col2) VALUES (?, ?)', [val1, val2]);
```

### Select
```javascript
const result = await query('SELECT * FROM table WHERE id = ?', [id]);
const rows = result.rows;
```

### Update
```javascript
await query('UPDATE table SET col1 = ? WHERE id = ?', [val, id]);
```

### Delete
```javascript
await query('DELETE FROM table WHERE id = ?', [id]);
```

## 🔐 Rate Limiter Options

```javascript
const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests
  message: {
    success: false,
    error: 'Too many requests'
  }
});
```

## 🎯 Validation Rules

```javascript
body('email').isEmail()
body('age').isInt({ min: 0, max: 120 })
body('url').isURL()
body('date').isISO8601()
body('field').trim().isLength({ min: 3, max: 100 })
body('field').matches(/^[a-zA-Z0-9]+$/)
param('id').isInt({ min: 1 })
query('page').optional().isInt({ min: 1 })
```

## 🚀 Starting the Server

```bash
# Development
npm run dev

# Production
npm start

# With specific port
PORT=4000 npm start
```

## 📦 Folder Structure at a Glance

```
src/
├── app.js              # App setup
├── routes/            # Route definitions
│   └── index.js       # Route aggregator
├── controllers/       # HTTP handlers
├── services/          # Business logic
├── repositories/      # Data access
├── middleware/        # Express middleware
├── jobs/              # Background jobs
├── config/            # Configuration
└── utils/             # Utilities
```

---

**Pro Tip:** Start by copying the User example files and renaming them to your resource name!

