/**
 * Custom error classes for the application
 */

class GameError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidMoveError extends GameError {
  constructor(message = 'Invalid move') {
    super(message, 400);
  }
}

class GameNotFoundError extends GameError {
  constructor(message = 'Game not found') {
    super(message, 404);
  }
}

class PlayerNotFoundError extends GameError {
  constructor(message = 'Player not found') {
    super(message, 404);
  }
}

class NotPlayerTurnError extends GameError {
  constructor(message = 'Not your turn') {
    super(message, 400);
  }
}

class GameAlreadyFinishedError extends GameError {
  constructor(message = 'Game has already finished') {
    super(message, 400);
  }
}

class PositionOccupiedError extends GameError {
  constructor(message = 'Position already occupied') {
    super(message, 400);
  }
}

class InvalidGridSizeError extends GameError {
  constructor(message = 'Invalid grid size') {
    super(message, 400);
  }
}

class PlayerAlreadyInQueueError extends GameError {
  constructor(message = 'Player already in queue') {
    super(message, 400);
  }
}

class PlayerInActiveGameError extends GameError {
  constructor(message = 'Player already in an active game') {
    super(message, 400);
  }
}

class QueueNotFoundError extends GameError {
  constructor(message = 'Queue entry not found') {
    super(message, 404);
  }
}

class ValidationError extends GameError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

module.exports = {
  GameError,
  InvalidMoveError,
  GameNotFoundError,
  PlayerNotFoundError,
  NotPlayerTurnError,
  GameAlreadyFinishedError,
  PositionOccupiedError,
  InvalidGridSizeError,
  PlayerAlreadyInQueueError,
  PlayerInActiveGameError,
  QueueNotFoundError,
  ValidationError
};
