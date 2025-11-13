# Testing Guide

## Overview

This project uses **Mocha** as the test framework, **Chai** for assertions, and **Sinon** for mocking/stubbing.

## Test Structure

```
tests/
├── setup.js                # Test utilities and helpers
├── TESTING_GUIDE.md       # This file
├── TEST_TEMPLATE.test.js  # Template for new tests
└── unit/                  # Unit tests
    ├── services/          # Service layer tests
    │   └── userService.test.js
    └── utils/             # Utility tests
        └── helpers.test.js
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx mocha tests/unit/services/userService.test.js
```

## Test Framework Components

### 1. Mocha (Test Runner)
- `describe()` - Group related tests
- `it()` - Individual test case
- `beforeEach()` - Run before each test
- `afterEach()` - Run after each test
- `before()` - Run once before all tests
- `after()` - Run once after all tests

### 2. Chai (Assertions)
```javascript
const { expect } = require('chai');

// Equality
expect(value).to.equal(5);
expect(value).to.deep.equal({ id: 1 });

// Truthiness
expect(value).to.be.true;
expect(value).to.be.false;
expect(value).to.exist;
expect(value).to.be.null;
expect(value).to.be.undefined;

// Type checking
expect(value).to.be.a('string');
expect(value).to.be.an('array');
expect(value).to.be.instanceOf(Error);

// Comparisons
expect(value).to.be.at.least(5);
expect(value).to.be.lessThan(10);
expect(value).to.be.within(5, 10);

// Arrays
expect(array).to.have.length(3);
expect(array).to.include(5);

// Objects
expect(obj).to.have.property('name');
expect(obj.name).to.equal('John');
```

### 3. Sinon (Mocking/Stubbing)
```javascript
const sinon = require('sinon');

// Create sandbox
const sandbox = sinon.createSandbox();

// Stub a function
sandbox.stub(userRepository, 'findById').resolves({ id: 1 });

// Spy on a function
const spy = sandbox.spy(console, 'log');

// Check if called
expect(stub.calledOnce).to.be.true;
expect(stub.calledWith(1)).to.be.true;

// Restore all stubs
sandbox.restore();
```

## Writing Service Tests

### Pattern: Arrange → Act → Assert

```javascript
describe('UserService', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a user successfully', async () => {
    // ARRANGE - Set up test data and mocks
    const userData = { name: 'John', email: 'john@example.com' };
    const mockUser = { id: 1, ...userData };
    
    sandbox.stub(userRepository, 'findByEmail').resolves(null);
    sandbox.stub(userRepository, 'create').resolves(mockUser);

    // ACT - Execute the function being tested
    const result = await userService.createUser(userData);

    // ASSERT - Verify the results
    expect(result).to.deep.equal(mockUser);
    expect(userRepository.findByEmail.calledOnce).to.be.true;
    expect(userRepository.create.calledOnce).to.be.true;
  });
});
```

## Test Examples

### Testing Success Cases
```javascript
it('should return user by id', async () => {
  const mockUser = { id: 1, name: 'John' };
  sandbox.stub(userRepository, 'findById').resolves(mockUser);
  
  const result = await userService.getUserById(1);
  
  expect(result).to.deep.equal(mockUser);
});
```

### Testing Error Cases
```javascript
it('should throw error if user not found', async () => {
  sandbox.stub(userRepository, 'findById')
    .rejects(new Error('User not found'));
  
  try {
    await userService.getUserById(999);
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error.message).to.include('not found');
  }
});
```

### Testing with Multiple Stubs
```javascript
it('should not create duplicate users', async () => {
  const userData = { name: 'John', email: 'john@example.com' };
  const existingUser = { id: 1, email: 'john@example.com' };
  
  sandbox.stub(userRepository, 'findByEmail').resolves(existingUser);
  const createStub = sandbox.stub(userRepository, 'create');
  
  try {
    await userService.createUser(userData);
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error.message).to.include('already registered');
    expect(createStub.called).to.be.false; // Verify create was not called
  }
});
```

## Testing Utilities

### Using Test Setup Helpers
```javascript
const { 
  createTestDatabase, 
  cleanupTestDatabase,
  createTestTables,
  insertTestData 
} = require('../setup');

describe('Integration Tests', () => {
  let db;

  before(async () => {
    db = await createTestDatabase();
    await createTestTables(db);
  });

  after(async () => {
    await cleanupTestDatabase(db);
  });

  it('should work with real database', async () => {
    const userId = await insertTestData(db, 'users', {
      name: 'John',
      email: 'john@example.com'
    });
    
    expect(userId).to.be.a('number');
  });
});
```

## Best Practices

### 1. Test One Thing at a Time
```javascript
// ❌ Bad - Testing multiple things
it('should create and update user', async () => {
  const user = await userService.createUser(data);
  const updated = await userService.updateUser(user.id, newData);
  // ...
});

// ✅ Good - Separate tests
it('should create user', async () => { /* ... */ });
it('should update user', async () => { /* ... */ });
```

### 2. Use Descriptive Test Names
```javascript
// ❌ Bad
it('works', () => { /* ... */ });

// ✅ Good
it('should return 404 when user does not exist', () => { /* ... */ });
```

### 3. Clean Up After Each Test
```javascript
afterEach(() => {
  sandbox.restore(); // Always restore stubs
});
```

### 4. Test Both Success and Failure Cases
```javascript
describe('createUser', () => {
  it('should create user successfully', async () => { /* ... */ });
  it('should throw error if email exists', async () => { /* ... */ });
  it('should throw error if email invalid', async () => { /* ... */ });
});
```

### 5. Keep Tests Independent
Each test should be able to run alone without depending on other tests.

### 6. Use Fixtures for Complex Data
```javascript
const validUserData = {
  name: 'John Doe',
  email: 'john@example.com'
};

it('test 1', () => {
  const user = { ...validUserData };
  // Use user
});
```

## Common Testing Patterns

### Testing Async Functions
```javascript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).to.exist;
});
```

### Testing Promises
```javascript
it('should resolve promise', () => {
  return asyncFunction().then(result => {
    expect(result).to.exist;
  });
});
```

### Testing Error Throwing
```javascript
it('should throw error', () => {
  expect(() => functionThatThrows()).to.throw(Error);
});
```

### Testing Callbacks
```javascript
it('should call callback', (done) => {
  functionWithCallback((err, result) => {
    expect(err).to.be.null;
    expect(result).to.exist;
    done();
  });
});
```

## Coverage Goals

- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Utilities**: 90%+ coverage
- **Overall**: 75%+ coverage

## Tips

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Mock external dependencies** (databases, APIs)
4. **Keep tests fast** - use mocks instead of real I/O
5. **Test edge cases** - null, undefined, empty arrays, etc.
6. **Use meaningful assertions** - test what matters
7. **Group related tests** with `describe` blocks

## Example Test File Structure

```javascript
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

describe('ResourceService', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('create', () => {
    it('should create resource successfully', async () => {
      // Test implementation
    });

    it('should handle validation errors', async () => {
      // Test implementation
    });
  });

  describe('getById', () => {
    it('should return resource', async () => {
      // Test implementation
    });

    it('should throw error if not found', async () => {
      // Test implementation
    });
  });

  // More test groups...
});
```

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Documentation](https://www.chaijs.com/)
- [Sinon Documentation](https://sinonjs.org/)

---

For a template to copy when creating new tests, see `TEST_TEMPLATE.test.js`.

