# 🧩 Problem Service

A microservice for managing coding problems, built as part of the **Abhicode** platform.

---

## 📌 Tech Stack

| Technology | Purpose              |
| ---------- | -------------------- |
| Node.js    | Runtime              |
| Express 5  | Web framework        |
| MongoDB    | Database             |
| Mongoose   | ODM                  |
| Winston    | Logging library      |
| winston-mongodb| DB logging transport |
| dotenv     | Environment variables|
| nodemon    | Development hot-reload|

---

## 📁 Project Structure

```
problem-service/
├── .env                          # Environment variables (PORT, DB URLs)
├── app.log                       # Local logger file (pretty JSON output)
├── package.json                  # Project metadata & dependencies
├── src/
│   ├── index.js                  # Entry point — connects to DB and starts server
│   ├── app.js                    # Express app setup, routing, & error handling
│   ├── config/
│   │   ├── db.config.js          # MongoDB connection handler
│   │   ├── logger.config.js      # Winston logger setup (Console, File, MongoDB)
│   │   └── server.config.js      # Loads and exports env variables
│   ├── controllers/
│   │   ├── index.js              # Barrel export for controllers
│   │   └── problem.controller.js # Maps HTTP requests to service layer
│   ├── errors/
│   │   ├── base.error.js         # Base custom error class (captures stack trace)
│   │   ├── internalServer.error.js
│   │   ├── notFound.error.js
│   │   └── index.js              # Barrel export for error classes
│   ├── models/
│   │   ├── index.js              # Barrel export for models
│   │   └── problem.model.js      # Mongoose schema for Problems
│   ├── repositories/
│   │   ├── index.js              # Barrel export for repositories
│   │   └── problem.repository.js # Database queries & operations
│   ├── services/
│   │   ├── index.js              # Barrel export for services
│   │   └── problem.service.js    # Core business logic layer
│   ├── validators/
│   │   └── index.js              # Validation middleware
│   ├── utils/
│   │   └── index.js              # Formatting & helper utilities
│   └── routes/
│       ├── index.js              # Main API router
│       └── v1/
│           ├── index.js          # v1 router
│           └── problems.routes.js# Problem-specific routes
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v20+ installed
- **MongoDB** running locally or a cloud URI

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd problem-service

# 2. Install dependencies
npm install

# 3. Create .env file with MongoDB URLs
cat <<EOT >> .env
PORT=3001
MONGODB_URL=mongodb://localhost:27017/Abhicode-problem-service
MONGODB_LOGS_URL=mongodb://localhost:27017/Abhicode-logger-service
EOT

# 4. Start the server
npm run dev      # Development mode (with hot-reload)
npm run start    # Production mode
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:3001`

### Health Check

| Method | Endpoint                     | Description                   | Status      |
| ------ | ---------------------------- | ----------------------------- | ----------- |
| GET    | `/ping`                      | Check if service is alive     | ✅ Active   |
| GET    | `/api/v1/problems/ping`      | Check if problem controller is up | ✅ Active   |

### Problem CRUD Operations

| Method | Endpoint                     | Description                   | Status      |
| ------ | ---------------------------- | ----------------------------- | ----------- |
| GET    | `/api/v1/problems`           | Get all problems              | ✅ Active   |
| GET    | `/api/v1/problems/:id`       | Get a single problem by ID    | ✅ Active   |
| POST   | `/api/v1/problems`           | Create a new problem          | ✅ Active   |
| PUT    | `/api/v1/problems/:id`       | Update an existing problem    | ✅ Active   |
| DELETE | `/api/v1/problems/:id`       | Delete a problem              | ✅ Active   |

---

## 🪵 Logger Setup (Winston)

The logger is configured globally to output clean, structured logs:

1. **Console**: Colorized terminal output with exact caller filepath and line number (`📍 at ProblemRepository.deleteProblem → repositories/problem.repository.js:85`).
2. **MongoDB**: Stored in a separate database (`Abhicode-logger-service`) with stack traces automatically parsed into clean arrays.
3. **Local File (`app.log`)**: Stored in pretty-printed multi-line JSON format.

```json
{
  "level": "error",
  "message": "Problem with id:6a80b1017f7ef9ac0112bd89 not found in the db",
  "stack": [
    "Error: Problem with id:6a80b1017f7ef9ac0112bd89 not found in the db",
    "at ProblemRepository.deleteProblem (file:///Users/.../problem.repository.js:85:29)",
    "at async ProblemService.deleteProblem (file:///Users/.../problem.service.js:73:23)"
  ],
  "timestamp": "2026-08-25 19:46:31"
}
```

---

## 🏗️ Implemented Architecture

The project follows a standard **Controller-Service-Repository** pattern:

```
Client Request ──► Controller ──► Service ──► Repository ──► MongoDB
```

* **Controller**: Parses incoming request params and body.
* **Service**: Contains business logic (validations, formatting, external calls).
* **Repository**: Communicates directly with Mongoose models.
* **Global Error Middleware**: Catch-all handler (`errorHandler.js`) that processes custom exceptions (`NotFoundError`, `InternalServerError`) and formats standard HTTP responses.

---

## 📝 ESM Notes

- This project uses **ES Modules** (`"type": "module"`). All imports must include the **full file path with `.js` extension** (e.g., `import x from './routes/index.js'`). Directory imports are not supported in ESM.
- The server runs on **port 3001** by default (configurable via `.env`).
