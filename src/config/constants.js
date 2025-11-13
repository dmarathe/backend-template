/**
 * Application constants
 * Define your application-wide constants here
 */

module.exports = {
  // Sample constants
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 50,
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 100,

  // Sample status enums
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },

  // Add your own constants here
  // Example:
  // ORDER_STATUS: {
  //   PENDING: 'pending',
  //   PROCESSING: 'processing',
  //   COMPLETED: 'completed',
  //   CANCELLED: 'cancelled'
  // },
  //
  // PAYMENT_METHODS: {
  //   CREDIT_CARD: 'credit_card',
  //   PAYPAL: 'paypal',
  //   BANK_TRANSFER: 'bank_transfer'
  // }
};
