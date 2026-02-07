# TaskPilot Backend API

RESTful API built with Node.js, Express, TypeScript, and PostgreSQL for the TaskPilot task management application.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcrypt for password hashing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install PostgreSQL**:
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql@16`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

3. **Start PostgreSQL service**:
   - **Windows**: PostgreSQL service should auto-start
   - **macOS**: `brew services start postgresql@16`
   - **Linux**: `sudo systemctl start postgresql`

## Database Setup

1. **Create database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE taskpilot;
   
   # Exit psql
   \q
   ```

2. **Run database schema**:
   ```bash
   psql -U postgres -d taskpilot -f database/schema.sql
   ```

## Configuration

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your credentials**:
   ```env
   # Server
   PORT=5000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=taskpilot
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

## Running the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/profile` | Get user profile | Yes |

### Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user's tasks | Yes |
| GET | `/:id` | Get specific task | Yes |
| POST | `/` | Create new task | Yes |
| PATCH | `/:id` | Update task | Yes |
| DELETE | `/:id` | Delete task | Yes |
| POST | `/:id/start` | Start task timer | Yes |
| POST | `/:id/stop` | Stop task timer | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API and database status |

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "priority": "high",
    "category": "Development",
    "tags": ["documentation", "urgent"]
  }'
```

### Start Timer
```bash
curl -X POST http://localhost:5000/api/tasks/1/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

All API responses follow this structure:

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error message",
  "stack": "..." // Only in development
}
```

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username
- `password`: Hashed password (bcrypt)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Tasks Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Task title
- `description`: Task description
- `status`: Enum (todo, in-progress, completed)
- `priority`: Enum (low, medium, high)
- `category`: Task category
- `total_time`: Total tracked time in seconds
- `is_tracking`: Current tracking status
- `tags`: Array of tags
- `completed_at`: Completion timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Time Entries Table
- `id`: Primary key
- `task_id`: Foreign key to tasks
- `start_time`: Timer start timestamp
- `end_time`: Timer end timestamp
- `duration`: Duration in seconds

## Error Handling

The API uses centralized error handling with custom `ApiError` class:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- SQL injection prevention (parameterized queries)
- CORS protection
- Environment variable security

## Development

**Project Structure**:
```
backend/
├── database/
│   └── schema.sql          # PostgreSQL schema
├── src/
│   ├── config/
│   │   └── database.ts     # Database connection
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── taskController.ts
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   └── validator.ts    # Request validation
│   ├── models/
│   │   ├── User.ts
│   │   └── Task.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── taskRoutes.ts
│   └── index.ts            # Entry point
├── .env.example
├── nodemon.json
├── package.json
└── tsconfig.json
```

## Troubleshooting

**Database connection errors**:
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `taskpilot` exists
- Verify schema has been imported

**Port already in use**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill
```

**Module import errors**:
```bash
rm -rf node_modules
npm install
```

## License

MIT
