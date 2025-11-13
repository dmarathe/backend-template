/**
 * Unit tests for helper functions
 * Sample test demonstrating how to test utilities
 */

const { describe, it } = require('mocha');
const { expect } = require('chai');
const {
  formatResponse,
  formatErrorResponse,
  delay
} = require('../../../src/utils/helpers');

describe('Helper Utilities', () => {

  describe('formatResponse', () => {
    it('should format success response with data', () => {
      const result = formatResponse(true, { id: 1, name: 'Test' });
      
      expect(result).to.deep.equal({
        success: true,
        data: { id: 1, name: 'Test' }
      });
    });

    it('should format success response with data and message', () => {
      const result = formatResponse(true, { id: 1 }, 'Created successfully');
      
      expect(result).to.deep.equal({
        success: true,
        data: { id: 1 },
        message: 'Created successfully'
      });
    });

    it('should format response without data', () => {
      const result = formatResponse(true, null, 'Operation completed');
      
      expect(result).to.deep.equal({
        success: true,
        message: 'Operation completed'
      });
    });

    it('should format failure response', () => {
      const result = formatResponse(false, null, 'Operation failed');
      
      expect(result).to.deep.equal({
        success: false,
        message: 'Operation failed'
      });
    });

    it('should handle undefined data', () => {
      const result = formatResponse(true, undefined, 'Success');
      
      expect(result).to.deep.equal({
        success: true,
        message: 'Success'
      });
    });

    it('should handle complex data objects', () => {
      const data = {
        user: { id: 1, name: 'Alice' },
        items: [1, 2, 3],
        nested: { deep: { value: true } }
      };
      
      const result = formatResponse(true, data);
      
      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal(data);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response with message', () => {
      const result = formatErrorResponse('Something went wrong');
      
      expect(result).to.deep.equal({
        success: false,
        error: 'Something went wrong'
      });
    });

    it('should format error response with validation errors array', () => {
      const errors = [
        { field: 'username', message: 'Required' },
        { field: 'email', message: 'Invalid format' }
      ];
      const result = formatErrorResponse('Validation failed', errors);
      
      expect(result).to.deep.equal({
        success: false,
        error: 'Validation failed',
        errors
      });
    });

    it('should handle missing errors', () => {
      const result = formatErrorResponse('Error occurred');
      
      expect(result).to.deep.equal({
        success: false,
        error: 'Error occurred'
      });
    });

    it('should handle null errors', () => {
      const result = formatErrorResponse('Error', null);
      
      expect(result).to.deep.equal({
        success: false,
        error: 'Error'
      });
    });

    it('should handle empty errors array', () => {
      const result = formatErrorResponse('Validation error', []);
      
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Validation error');
      expect(result.errors).to.be.undefined; // Empty array not included
    });

    it('should include errors array when non-empty', () => {
      const errors = [{ field: 'password', message: 'Too short' }];
      const result = formatErrorResponse('Validation error', errors);
      
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Validation error');
      expect(result.errors).to.deep.equal(errors);
    });
  });

  describe('delay', () => {
    it('should delay execution for specified time', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      
      expect(elapsed).to.be.at.least(95); // Allow small margin
      expect(elapsed).to.be.lessThan(150);
    });

    it('should work with zero delay', async () => {
      const start = Date.now();
      await delay(0);
      const elapsed = Date.now() - start;
      
      expect(elapsed).to.be.lessThan(50);
    });

    it('should work with small delay', async () => {
      const start = Date.now();
      await delay(10);
      const elapsed = Date.now() - start;
      
      expect(elapsed).to.be.at.least(5);
      expect(elapsed).to.be.lessThan(50);
    });

    it('should return promise', () => {
      const result = delay(1);
      expect(result).to.be.instanceOf(Promise);
    });

    it('should allow chaining', async () => {
      const start = Date.now();
      await delay(50).then(() => delay(50));
      const elapsed = Date.now() - start;
      
      expect(elapsed).to.be.at.least(95);
      expect(elapsed).to.be.lessThan(150);
    });
  });

  describe('integration tests', () => {
    it('should format responses for typical API flow', () => {
      // Success case
      const successData = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const success = formatResponse(true, successData, 'User created');
      
      expect(success.success).to.be.true;
      expect(success.data).to.deep.equal(successData);
      expect(success.message).to.equal('User created');
      
      // Error case
      const errors = [{ field: 'email', message: 'Invalid format' }];
      const error = formatErrorResponse('Validation failed', errors);
      
      expect(error.success).to.be.false;
      expect(error.error).to.equal('Validation failed');
      expect(error.errors).to.deep.equal(errors);
    });

    it('should handle typical CRUD operation responses', () => {
      // Create
      const createResponse = formatResponse(true, { id: 1 }, 'Resource created');
      expect(createResponse.success).to.be.true;
      expect(createResponse.message).to.equal('Resource created');
      
      // Read
      const readResponse = formatResponse(true, { id: 1, name: 'Item' });
      expect(readResponse.success).to.be.true;
      expect(readResponse.data).to.exist;
      
      // Update
      const updateResponse = formatResponse(true, { id: 1, name: 'Updated' }, 'Updated successfully');
      expect(updateResponse.success).to.be.true;
      expect(updateResponse.message).to.equal('Updated successfully');
      
      // Delete
      const deleteResponse = formatResponse(true, null, 'Deleted successfully');
      expect(deleteResponse.success).to.be.true;
      expect(deleteResponse.data).to.not.exist;
    });
  });
});
