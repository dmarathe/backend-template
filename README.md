# Backend Template

A backend setup.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **Logging**: Winston
- **Testing**: Jest
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Scheduling**: Node Cron

## Basic Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your PostgreSQL database credentials and other configuration values.

4. **Database setup**
   - SQLite database will be created automatically when the server starts
   - Tables are created automatically when running `npm run dev`

5. **Start the server**
   - Development: `npm run dev` (runs migrations automatically)
   - Quick development (skip migrations): `npm run dev:quick`
   - Production: `npm start`


The server will start on port 3000 (configurable via `PORT` environment variable).

## Routes

- `GET /health` - Health check endpoint
- `GET /api/v1/` - API information and available endpoints
- `/api/v1/players` - Player management
- `/api/v1/queue` - Matchmaking queue
- `/api/v1/games` - Game management
- `/api/v1/leaderboard` - Leaderboard

## High Level Code Structure

```
src/
├── app.js              # Main Express application setup
├── routes/             # API route definitions
├── controllers/        # Request handlers and business logic
├── services/           # Business service layer
├── models/             # Data models
├── repositories/       # Data access layer
├── middleware/         # Express middlewares (security, rate limiting, etc.)
├── utils/              # Utility functions
├── config/             # Configuration files
└── jobs/               # Background jobs (e.g., queue cleanup)
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback migrations
- `npm run migrate:create` - Create new migration file



## Future Enhancements

-  Add authentication (JWT)
-  SSE test page
-  Add WebSocket for full duplex communication
-  Add game history endpoint
-  Add API documentation (Swagger/OpenAPI)
-  Add more end to end test
-  Add Docker support
-  Add CI/CD pipeline

# Used AI for
- API Doc and Database_schema => used prompt to generate API Doc by providing how to play game and API endpoints
- /scripts/simulateGames.js => Used prompt to generate script to simulate games by providing how to play and giving simulation details
- jobs/queueCleanup.js => Used prompt to generate script to clean up expired queue entries
- /test => Used prompt to generate unit test cases by providing API endpoints and expected responses
