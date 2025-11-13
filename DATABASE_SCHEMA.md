# Database Schema Documentation

This document describes the SQLite database schema for the Tic-Tac-Toe API application.

## Overview

The database consists of 5 main tables plus the migration tracking table. All tables use proper foreign key relationships, indexes for performance, and constraints for data integrity.

## Tables

### 1. players

Stores player information and account details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing player ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Player's unique username |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `players_username_idx` on `username`

**Relationships:**
- Referenced by: `game_queue.player_id`, `games.player1_id`, `games.player2_id`, `games.current_turn`, `games.winner_id`, `moves.player_id`, `player_stats.player_id`

---

### 2. game_queue

Manages the matchmaking queue system for finding opponents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing queue entry ID |
| player_id | INTEGER | NOT NULL, FK → players.id (CASCADE) | Player waiting in queue |
| grid_size | INTEGER | NOT NULL, DEFAULT 3 | Game board size (3-10) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'waiting' | Queue status: 'waiting', 'matched', 'cancelled' |
| matched_game_id | INTEGER | FK → games.id (SET NULL) | Game created when match found |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Queue entry creation time |
| expires_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP + 10min | Queue entry expiration time |

**Constraints:**
- `check_queue_status`: `status IN ('waiting', 'matched', 'cancelled')`

**Indexes:**
- `game_queue_status_grid_size_idx` on `(status, grid_size)` where `status = 'waiting'`
- `game_queue_player_id_idx` on `player_id`
- `game_queue_expires_at_idx` on `expires_at` where `status = 'waiting'`

---

### 3. games

Stores game instances and their current state.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing game ID |
| grid_size | INTEGER | NOT NULL, DEFAULT 3 | Game board size |
| board_state | JSONB | NOT NULL, DEFAULT '{"grid": []}' | Current board state as JSON |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'in_progress' | Game status: 'in_progress', 'completed', 'draw', 'abandoned' |
| current_turn | INTEGER | FK → players.id (SET NULL) | Player whose turn it is |
| winner_id | INTEGER | FK → players.id (SET NULL) | Winner player ID (null for draws) |
| player1_id | INTEGER | NOT NULL, FK → players.id (CASCADE) | First player (goes first) |
| player2_id | INTEGER | NOT NULL, FK → players.id (CASCADE) | Second player |
| started_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Game start time |
| completed_at | TIMESTAMP | NULL | Game completion time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Game creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- `check_status`: `status IN ('in_progress', 'completed', 'draw', 'abandoned')`
- `check_different_players`: `player1_id != player2_id`

**Indexes:**
- `games_status_idx` on `status`
- `games_player1_id_player2_id_idx` on `(player1_id, player2_id)`
- `games_board_state_idx` on `board_state` (GIN index)

**Relationships:**
- Referenced by: `game_queue.matched_game_id`, `moves.game_id`

---

### 4. moves

Audit trail of all moves made in games.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing move ID |
| game_id | INTEGER | NOT NULL, FK → games.id (CASCADE) | Game this move belongs to |
| player_id | INTEGER | NOT NULL, FK → players.id (CASCADE) | Player who made the move |
| position_x | INTEGER | NOT NULL | X coordinate of the move (0-based) |
| position_y | INTEGER | NOT NULL | Y coordinate of the move (0-based) |
| move_number | INTEGER | NOT NULL | Sequential move number in the game |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Move timestamp |

**Constraints:**
- `unique_position_per_game`: UNIQUE `(game_id, position_x, position_y)`
- `check_position_x`: `position_x >= 0`
- `check_position_y`: `position_y >= 0`

**Indexes:**
- `moves_game_id_idx` on `game_id`
- `moves_game_id_position_x_position_y_idx` on `(game_id, position_x, position_y)`

---

### 5. player_stats

Aggregated statistics for leaderboard functionality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| player_id | INTEGER | PRIMARY KEY, FK → players.id (CASCADE) | Player ID (primary key) |
| total_games | INTEGER | NOT NULL, DEFAULT 0 | Total games played |
| total_wins | INTEGER | NOT NULL, DEFAULT 0 | Total games won |
| total_draws | INTEGER | NOT NULL, DEFAULT 0 | Total games drawn |
| total_losses | INTEGER | NOT NULL, DEFAULT 0 | Total games lost |
| total_moves_in_wins | INTEGER | NOT NULL, DEFAULT 0 | Total moves made in winning games |
| win_ratio | DECIMAL(5,4) | NOT NULL, DEFAULT 0.0000 | Win ratio (wins/total_games) |
| avg_moves_per_win | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Average moves per win |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Statistics last update time |

**Indexes:**
- `player_stats_total_wins_idx` on `total_wins` (DESC)
- `player_stats_avg_moves_per_win_idx` on `avg_moves_per_win` (ASC)
- `player_stats_win_ratio_idx` on `win_ratio` (DESC)

---

### 6. pgmigrations

Migration tracking table (created automatically by node-pg-migrate).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| name | VARCHAR | NOT NULL | Migration filename |
| run_on | TIMESTAMP | NOT NULL | When migration was executed |

## Entity Relationship Diagram

```
players (1) ────┬─── (many) game_queue
                │
                ├─── (many) games (as player1)
                │
                ├─── (many) games (as player2)
                │
                ├─── (many) moves
                │
                └─── (1) player_stats

games (1) ──────┬─── (1) game_queue (matched_game)
                │
                └─── (many) moves
```

## Key Relationships

1. **One-to-One**: `players.player_id → player_stats.player_id`
2. **One-to-Many**: `players.id → game_queue.player_id`
3. **One-to-Many**: `players.id → games.player1_id/player2_id`
4. **One-to-Many**: `games.id → moves.game_id`
5. **One-to-One**: `games.id → game_queue.matched_game_id`

## Data Types and Constraints

### Board State Format (TEXT/JSON)
The `games.board_state` field stores the current game board as JSON text:
```json
{
  "grid": [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 2]
  ]
}
```
- `0`: Empty cell
- `1`: Player 1's mark
- `2`: Player 2's mark

### Status Values
- **Game Status**: `in_progress`, `completed`, `draw`, `abandoned`
- **Queue Status**: `waiting`, `matched`, `cancelled`

### Grid Size Constraints
- Minimum: 3x3 (DEFAULT_GRID_SIZE)
- Maximum: 10x10 (MAX_GRID_SIZE)

## Indexes for Performance

The database includes strategic indexes for:
- Queue lookups by status and grid size
- Player statistics sorting for leaderboards
- Game state queries
- Move validation and history
- Foreign key relationships

## Migration Order

Migrations should be run in this order:
1. `001_create_players.js`
2. `002_create_game_queue.js`
3. `003_create_games.js`
4. `004_create_moves.js`
5. `005_create_player_stats.js`
