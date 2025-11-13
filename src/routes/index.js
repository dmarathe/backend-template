/**
 * Main routes aggregator
 */

const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
// Add more routes here as needed
// const productRoutes = require('./productRoutes');
// const orderRoutes = require('./orderRoutes');

// Mount routes
router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API v1',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users'
      // Add your endpoints here
    }
  });
});

module.exports = router;
