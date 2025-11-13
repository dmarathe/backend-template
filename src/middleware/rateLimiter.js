/**
 * Rate limiting middleware
 * Configure rate limits for different endpoints
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter (applied to all /api routes)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for resource creation endpoints
const createResourceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 creations per 15 minutes
  message: {
    success: false,
    error: 'Too many creation attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Add more custom rate limiters as needed
// Example: Stricter limiter for sensitive operations
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // 5 attempts per 15 minutes
//   message: {
//     success: false,
//     error: 'Too many authentication attempts, please try again later'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

module.exports = {
  apiLimiter,
  createResourceLimiter
  // Export your custom rate limiters here
};
