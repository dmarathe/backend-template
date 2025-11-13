# Tic-Tac-Toe API Documentation

##  How to Play

### Method 1: Using the API

1. **Create two players**
```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"username": "alice"}'

curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"username": "bob"}'
```

2. **Both players join queue** (in separate terminals)
```bash
# Terminal 1 - Connect to queue SSE
curl -N http://localhost:3000/api/v1/queue/events?player_id=1

# Terminal 2 - Player 1 joins queue
curl -X POST http://localhost:3000/api/v1/queue/join \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1, "grid_size": 3}'

# Terminal 3 - Connect to queue SSE
curl -N http://localhost:3000/api/v1/queue/events?player_id=2

# Terminal 4 - Player 2 joins queue (match will be found!)
curl -X POST http://localhost:3000/api/v1/queue/join \
  -H "Content-Type: application/json" \
  -d '{"player_id": 2, "grid_size": 3}'
```

3. **Connect to game SSE** (both players)
```bash
# Terminal 1
curl -N http://localhost:3000/api/v1/games/1/events?player_id=1

# Terminal 2
curl -N http://localhost:3000/api/v1/games/1/events?player_id=2
```

4. **Make moves**
```bash
# Player 1's turn
curl -X POST http://localhost:3000/api/v1/games/1/move \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1, "position_x": 0, "position_y": 0}'

# Player 2's turn
curl -X POST http://localhost:3000/api/v1/games/1/move \
  -H "Content-Type: application/json" \
  -d '{"player_id": 2, "position_x": 1, "position_y": 1}'
```

## Important Links

- **Health Check**: `GET /health`
- **API Root**: `GET /api/v1/`

## Detailed API Reference

### Create Player API

**Endpoint:** `POST /api/v1/players`

**Description:** Creates a new player account with a unique username.

**Request Body:**
```json
{
  "username": "string"  // Required: Unique username, 1-50 characters
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"username": "alice"}'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "alice",
    "created_at": "2025-10-29T12:00:00.000Z"
  },
  "message": "Player created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Username already taken or invalid
- `500 Internal Server Error`: Server error

---

### Join Queue API

**Endpoint:** `POST /api/v1/queue/join`

**Description:** Adds a player to the matchmaking queue to find an opponent.

**Request Body:**
```json
{
  "player_id": 1,        // Required: Player ID
  "grid_size": 3         // Optional: Grid size (3-10, default: 3)
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/queue/join \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1, "grid_size": 3}'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "queue_id": 1,
    "player_id": 1,
    "grid_size": 3,
    "status": "waiting",
    "position_in_queue": 1,
    "waiting_players": 2,
    "created_at": "2025-10-29T12:00:00.000Z",
    "expires_at": "2025-10-29T12:10:00.000Z"
  },
  "message": "Waiting for opponent with grid size 3..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid player ID or grid size
- `404 Not Found`: Player not found
- `409 Conflict`: Player already in queue
- `500 Internal Server Error`: Server error

---

### SSE Events API

#### Queue Events
**Endpoint:** `GET /api/v1/queue/events?player_id={id}`

**Description:** Establishes a Server-Sent Events connection for real-time queue updates.

**Query Parameters:**
- `player_id`: Player ID (required)

**Connection Example:**
```javascript
const eventSource = new EventSource('/api/v1/queue/events?player_id=1');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event type:', event.type);
  console.log('Event data:', data);
};
```

**Event Types:**

**`queue_joined`** - Initial connection confirmation
```json
{
  "message": "Connected to matchmaking queue",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

**`match_found`** - Match found, includes game details
```json
{
  "game_id": 1,
  "opponent_id": 2,
  "grid_size": 3,
  "your_turn": true,
  "player_number": 1,
  "board": [[0,0,0],[0,0,0],[0,0,0]],
  "message": "Match found! Game starting..."
}
```

**`queue_cancelled`** - Queue entry cancelled/expired
```json
{
  "message": "Queue entry expired",
  "timestamp": "2025-10-29T12:10:00.000Z"
}
```

#### Game Events
**Endpoint:** `GET /api/v1/games/{gameId}/events?player_id={playerId}`

**Description:** Establishes a Server-Sent Events connection for real-time game updates.

**Query Parameters:**
- `player_id`: Player ID (required)

**Connection Example:**
```javascript
const gameEventSource = new EventSource('/api/v1/games/1/events?player_id=1');

gameEventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Game event:', event.type, data);
};
```

**Event Types:**

**`game_started`** - Game initialization
```json
{
  "game_id": 1,
  "player1_id": 1,
  "player2_id": 2,
  "grid_size": 3,
  "current_turn": 1,
  "board": [[0,0,0],[0,0,0],[0,0,0]]
}
```

**`move`** - Opponent made a move
```json
{
  "playerId": 2,
  "x": 0,
  "y": 0,
  "moveNumber": 1,
  "board": [[2,0,0],[0,0,0],[0,0,0]],
  "nextTurn": 1
}
```

**`game_over`** - Game ended (win/loss/draw)
```json
{
  "status": "completed",
  "winner": 1,
  "board": [[1,2,1],[2,1,2],[1,0,2]],
  "winType": "row",
  "winLine": [0,1,2]
}
```

**`opponent_disconnected`** - Opponent left the game
```json
{
  "message": "Opponent disconnected",
  "timestamp": "2025-10-29T12:05:00.000Z"
}
```

---

### Make Move API

**Endpoint:** `POST /api/v1/games/{gameId}/move`

**Description:** Makes a move in an active game.

**Request Body:**
```json
{
  "player_id": 1,       // Required: Player ID
  "position_x": 0,      // Required: X coordinate (0-based)
  "position_y": 0       // Required: Y coordinate (0-based)
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/v1/games/1/move \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1, "position_x": 0, "position_y": 0}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "move_id": 1,
    "game_status": "in_progress",
    "next_turn": 2,
    "board": [[1,0,0],[0,0,0],[0,0,0]],
    "move_number": 1,
    "game_over": false,
    "winner_id": null
  }
}
```

**Game Over Response:**
```json
{
  "success": true,
  "data": {
    "move_id": 9,
    "game_status": "completed",
    "next_turn": null,
    "board": [[1,2,1],[2,1,2],[1,0,2]],
    "move_number": 9,
    "game_over": true,
    "winner_id": 1
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid position or not player's turn
- `403 Forbidden`: Game not found or player not in game
- `409 Conflict`: Position already occupied
- `410 Gone`: Game already completed
- `500 Internal Server Error`: Server error

---

### Leaderboard API

#### Get Complete Leaderboard
**Endpoint:** `GET /api/v1/leaderboard`

**Description:** Returns the complete leaderboard with all players ranked by total wins.

**Query Parameters:**
- `limit`: Number of players to return (default: 50)
- `offset`: Number of players to skip (default: 0)

**Request Example:**
```bash
curl "http://localhost:3000/api/v1/leaderboard?limit=10"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "player_id": 1,
        "username": "alice",
        "total_games": 50,
        "total_wins": 35,
        "total_draws": 5,
        "total_losses": 10,
        "win_ratio": 0.7,
        "avg_moves_per_win": 6.2
      }
    ],
    "total_players": 100,
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Top by Wins
**Endpoint:** `GET /api/v1/leaderboard/wins`

**Description:** Returns top players ranked by total wins.

**Query Parameters:**
- `limit`: Number of players to return (default: 10)

**Request Example:**
```bash
curl "http://localhost:3000/api/v1/leaderboard/wins?limit=5"
```

#### Get Top by Efficiency
**Endpoint:** `GET /api/v1/leaderboard/efficiency`

**Description:** Returns top players ranked by efficiency (lower average moves per win is better).

**Query Parameters:**
- `limit`: Number of players to return (default: 10)

**Request Example:**
```bash
curl "http://localhost:3000/api/v1/leaderboard/efficiency?limit=5"
```

#### Get Top by Win Ratio
**Endpoint:** `GET /api/v1/leaderboard/win-ratio`

**Description:** Returns top players ranked by win ratio (wins/total games).

**Query Parameters:**
- `limit`: Number of players to return (default: 10)

**Request Example:**
```bash
curl "http://localhost:3000/api/v1/leaderboard/win-ratio?limit=5"
```

#### Get Player Ranking
**Endpoint:** `GET /api/v1/leaderboard/player/{playerId}`

**Description:** Returns a specific player's ranking information.

**Request Example:**
```bash
curl "http://localhost:3000/api/v1/leaderboard/player/1"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "player_id": 1,
    "username": "alice",
    "rank": 5,
    "total_games": 50,
    "total_wins": 35,
    "total_draws": 5,
    "total_losses": 10,
    "win_ratio": 0.7,
    "avg_moves_per_win": 6.2,
    "ranking_criteria": {
      "by_wins": 5,
      "by_efficiency": 3,
      "by_win_ratio": 8
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Player not found or has no games
- `500 Internal Server Error`: Server error
