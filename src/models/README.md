# Models Directory

## Purpose

This directory is for domain models and business entities that don't fit into the repository pattern or need to encapsulate complex business logic.

## When to Use Models

### ✅ Use Models For:

1. **Complex Domain Objects**
   - Objects with behavior beyond simple CRUD
   - Domain entities with business rules
   - Value objects

2. **Data Transformation**
   - Converting between different data formats
   - Aggregating data from multiple sources
   - Complex calculations

3. **Business Logic Encapsulation**
   - Game logic (e.g., chess moves, scoring)
   - Payment processing rules
   - State machines

### ❌ Don't Use Models For:

- Simple CRUD operations (use repositories)
- HTTP request/response handling (use controllers)
- Data validation (use middleware)
- Database queries (use repositories)

## Example: OrderModel

```javascript
/**
 * Order model with business logic
 */

class OrderModel {
  constructor(orderData) {
    this.id = orderData.id;
    this.items = orderData.items || [];
    this.status = orderData.status || 'pending';
    this.createdAt = orderData.created_at;
  }

  /**
   * Calculate total order amount
   */
  calculateTotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled() {
    return ['pending', 'processing'].includes(this.status);
  }

  /**
   * Apply discount
   */
  applyDiscount(discountPercentage) {
    const total = this.calculateTotal();
    return total - (total * discountPercentage / 100);
  }

  /**
   * Validate order items
   */
  validateItems() {
    if (this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    for (const item of this.items) {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be positive');
      }
      if (item.price < 0) {
        throw new Error('Item price cannot be negative');
      }
    }

    return true;
  }
}

module.exports = OrderModel;
```

## Example: BoardModel (Game Logic)

```javascript
/**
 * Game board with logic
 */

class BoardModel {
  constructor(size = 3) {
    this.size = size;
    this.grid = this.initializeGrid();
  }

  initializeGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill(0)
    );
  }

  makeMove(x, y, player) {
    if (this.isValidMove(x, y)) {
      this.grid[x][y] = player;
      return true;
    }
    return false;
  }

  isValidMove(x, y) {
    return x >= 0 && x < this.size && 
           y >= 0 && y < this.size && 
           this.grid[x][y] === 0;
  }

  checkWinner() {
    // Complex game logic
    // ...
  }
}

module.exports = BoardModel;
```

## Best Practices

1. **Single Responsibility**: Each model should represent one domain concept
2. **Immutability**: Consider making models immutable when possible
3. **Validation**: Include validation methods
4. **Documentation**: Document business rules clearly
5. **Testing**: Models with complex logic should be well-tested

## Alternative: Using Services

For most APIs, you might not need models at all! Consider:

- **Simple CRUD**: Use Repository pattern only
- **Business Logic**: Put in Service layer
- **Data Transformation**: Helper functions in utils

Models are optional. Only create them when you have complex domain logic that benefits from encapsulation.

---

**Note**: The sample User API in this skeleton doesn't use models because it's simple CRUD. Add models when your domain logic becomes more complex.

