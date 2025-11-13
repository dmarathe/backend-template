# API Skeleton - Express.js Project Template

A production-ready Express.js API skeleton with a clean architecture following the Controller → Service → Repository pattern.

## 🏗️ Project Structure

```
src/
├── app.js                  # Express application setup
├── config/                 # Configuration files
│   ├── constants.js       # Application constants
│   └── database.js        # Database configuration
├── controllers/           # HTTP request handlers
│   └── userController.js # Sample controller
├── services/              # Business logic layer
│   └── userService.js    # Sample service
├── repositories/          # Data access layer
│   └── userRepository.js # Sample repository
├── routes/                # API route definitions
│   ├── index.js          # Routes aggregator
│   └── userRoutes.js     # Sample routes
├── middleware/            # Express middleware
│   ├── errorHandler.js   # Error handling
│   ├── rateLimiter.js    # Rate limiting
│   ├── security.js       # Security headers
│   └── validator.js      # Request validation
├── jobs/                  # Background/cron jobs
│   └── sampleJob.js      # Sample job template
└── utils/                 # Utility functions
    ├── errors.js         # Custom error classes
    ├── helpers.js        # Helper functions
    └── logger.js         # Winston logger
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and configure your settings.

### 3. Run Migrations (if using database)
```bash
node migrate.js
```

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 Architecture

### Controller → Service → Repository Pattern

1. **Controllers** (`src/controllers/`)
   - Handle HTTP requests and responses
   - Validate input (via middleware)
   - Call service layer
   - Format responses

2. **Services** (`src/services/`)
   - Contain business logic
   - Orchestrate operations
   - Call repositories
   - Handle transactions

3. **Repositories** (`src/repositories/`)
   - Data access layer
   - Database queries
   - CRUD operations
   - Return data objects

## 🔨 Adding New Features

### Step 1: Create Database Table (if needed)
Create a migration file in `migrations/` folder.

### Step 2: Create Repository
Create `src/repositories/yourResourceRepository.js`:

```javascript
const { query } = require('../config/database');
const logger = require('../utils/logger');

class YourResourceRepository {
  async create(data) {
    // Implementation
  }
  
  async findById(id) {
    // Implementation
  }
  
  async findAll(limit, offset) {
    // Implementation
  }
  
  async update(id, updates) {
    // Implementation
  }
  
  async delete(id) {
    // Implementation
  }
}

module.exports = new YourResourceRepository();
```

### Step 3: Create Service
Create `src/services/yourResourceService.js`:

```javascript
const yourResourceRepository = require('../repositories/yourResourceRepository');
const logger = require('../utils/logger');

class YourResourceService {
  async createResource(data) {
    // Business logic
    return await yourResourceRepository.create(data);
  }
  
  // Add more methods
}

module.exports = new YourResourceService();
```

### Step 4: Create Controller
Create `src/controllers/yourResourceController.js`:

```javascript
const yourResourceService = require('../services/yourResourceService');
const { formatResponse } = require('../utils/helpers');

class YourResourceController {
  async createResource(req, res, next) {
    try {
      const data = req.body;
      const resource = await yourResourceService.createResource(data);
      res.status(201).json(formatResponse(true, resource, 'Created successfully'));
    } catch (error) {
      next(error);
    }
  }
  
  // Add more methods
}

module.exports = new YourResourceController();
```

### Step 5: Create Routes
Create `src/routes/yourResourceRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const yourResourceController = require('../controllers/yourResourceController');
const { createResourceLimiter } = require('../middleware/rateLimiter');

router.post('/', createResourceLimiter, yourResourceController.createResource);
router.get('/', yourResourceController.getAllResources);
router.get('/:id', yourResourceController.getResource);
router.patch('/:id', yourResourceController.updateResource);
router.delete('/:id', yourResourceController.deleteResource);

module.exports = router;
```

### Step 6: Register Routes
Update `src/routes/index.js`:

```javascript
const yourResourceRoutes = require('./yourResourceRoutes');
router.use('/your-resources', yourResourceRoutes);
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - express-validator
- **Error Handling** - Centralized error middleware

## 📝 Validation

Add validation rules in `src/middleware/validator.js`:

```javascript
const createYourResourceValidation = [
  body('field')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Field must be between 3 and 100 characters'),
  validate
];
```

## 🔄 Background Jobs

Create cron jobs in `src/jobs/`:

```javascript
const cron = require('node-cron');
const logger = require('../utils/logger');

class YourJob {
  start(schedule = '*/5 * * * *') {
    this.job = cron.schedule(schedule, async () => {
      await this.execute();
    });
    logger.info('Job started:', { schedule });
  }
  
  async execute() {
    // Your job logic
  }
}

module.exports = new YourJob();
```

Register in `src/app.js`:
```javascript
const yourJob = require('./jobs/yourJob');
yourJob.start();
```

## 📊 Logging

Uses Winston for logging:

```javascript
const logger = require('../utils/logger');

logger.info('Info message');
logger.error('Error message', error);
logger.debug('Debug message');
logger.warn('Warning message');
```

## 🧪 Testing

Tests are organized in `tests/` directory:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests (if needed)

Run tests:
```bash
npm test
```

## 🌐 API Endpoints

### Sample User Endpoints (Template)

- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Health Check
- `GET /health` - Server health status

## 📦 Included Middleware

- **errorHandler** - Centralized error handling
- **rateLimiter** - Request rate limiting
- **security** - Security headers (Helmet)
- **validator** - Request validation (express-validator)

## 🛠️ Utilities

- **errors.js** - Custom error classes
- **helpers.js** - Response formatters, utilities
- **logger.js** - Winston logger configuration

## 📄 Environment Variables

```env
NODE_ENV=development
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Add your environment variables here
```

## 🤝 Contributing

1. Follow the existing architecture pattern
2. Keep controllers thin, services fat
3. Use proper error handling
4. Add validation for all inputs
5. Write tests for new features
6. Log important operations

## 📝 License

MIT License

---

**Note**: This is a starter template. The sample User API is provided as a reference. Delete or modify it according to your needs.

