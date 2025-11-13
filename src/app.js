/**
 * Express application setup
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { securityHeaders } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
// const sampleJob = require('./jobs/sampleJob'); // Uncomment if you have background jobs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(securityHeaders());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    
    // Start background jobs if needed
    // sampleJob.start();
    // logger.info('Background jobs started');
  });
}

module.exports = app;
