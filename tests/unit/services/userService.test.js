/**
 * User Service Tests
 * Sample test file demonstrating how to test services
 */

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const userService = require('../../../src/services/userService');
const userRepository = require('../../../src/repositories/userRepository');

describe('UserService', () => {
  let sandbox;

  beforeEach(() => {
    // Create a sandbox for stubs/spies
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    // Restore all stubs/spies
    sandbox.restore();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const mockUser = { id: 1, ...userData, created_at: new Date() };

      sandbox.stub(userRepository, 'findByEmail').resolves(null);
      sandbox.stub(userRepository, 'create').resolves(mockUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).to.deep.equal(mockUser);
      expect(userRepository.findByEmail.calledOnce).to.be.true;
      expect(userRepository.create.calledOnce).to.be.true;
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const existingUser = { id: 1, name: 'Jane', email: 'john@example.com' };

      sandbox.stub(userRepository, 'findByEmail').resolves(existingUser);

      // Act & Assert
      try {
        await userService.createUser(userData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('already registered');
        expect(userRepository.findByEmail.calledOnce).to.be.true;
      }
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com',
        created_at: new Date()
      };

      sandbox.stub(userRepository, 'findById').resolves(mockUser);

      // Act
      const result = await userService.getUserById(1);

      // Assert
      expect(result).to.deep.equal(mockUser);
      expect(userRepository.findById.calledWith(1)).to.be.true;
    });

    it('should throw error if user not found', async () => {
      // Arrange
      sandbox.stub(userRepository, 'findById').rejects(new Error('User with ID 999 not found'));

      // Act & Assert
      try {
        await userService.getUserById(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ];

      sandbox.stub(userRepository, 'findAll').resolves(mockUsers);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).to.deep.equal(mockUsers);
      expect(userRepository.findAll.calledWith(50, 0)).to.be.true;
    });

    it('should return users with custom pagination', async () => {
      // Arrange
      const mockUsers = [
        { id: 3, name: 'Bob', email: 'bob@example.com' }
      ];

      sandbox.stub(userRepository, 'findAll').resolves(mockUsers);

      // Act
      const result = await userService.getAllUsers({ limit: 10, offset: 20 });

      // Assert
      expect(result).to.deep.equal(mockUsers);
      expect(userRepository.findAll.calledWith(10, 20)).to.be.true;
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updates = { name: 'John Updated' };
      const mockUpdatedUser = { 
        id: userId, 
        name: 'John Updated', 
        email: 'john@example.com' 
      };

      sandbox.stub(userRepository, 'update').resolves(mockUpdatedUser);

      // Act
      const result = await userService.updateUser(userId, updates);

      // Assert
      expect(result).to.deep.equal(mockUpdatedUser);
      expect(userRepository.update.calledWith(userId, updates)).to.be.true;
    });

    it('should filter out invalid fields', async () => {
      // Arrange
      const userId = 1;
      const updates = { name: 'John', invalid_field: 'test', id: 999 };
      const filteredUpdates = { name: 'John' };
      const mockUpdatedUser = { id: userId, name: 'John', email: 'john@example.com' };

      sandbox.stub(userRepository, 'update').resolves(mockUpdatedUser);

      // Act
      const result = await userService.updateUser(userId, updates);

      // Assert
      expect(userRepository.update.calledWith(userId, filteredUpdates)).to.be.true;
    });

    it('should throw error if no valid fields to update', async () => {
      // Arrange
      const userId = 1;
      const updates = { invalid_field: 'test' };

      // Act & Assert
      try {
        await userService.updateUser(userId, updates);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('No valid fields');
      }
    });

    it('should throw error if new email is already taken', async () => {
      // Arrange
      const userId = 1;
      const updates = { email: 'taken@example.com' };
      const existingUser = { id: 2, email: 'taken@example.com' };

      sandbox.stub(userRepository, 'findByEmail').resolves(existingUser);

      // Act & Assert
      try {
        await userService.updateUser(userId, updates);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('already registered');
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 1;
      sandbox.stub(userRepository, 'delete').resolves(true);

      // Act
      const result = await userService.deleteUser(userId);

      // Assert
      expect(result).to.be.true;
      expect(userRepository.delete.calledWith(userId)).to.be.true;
    });
  });
});

