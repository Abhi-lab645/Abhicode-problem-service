# 🧩 Problem Service

A microservice for managing coding problems, built as part of the **Abhicode** platform.

---

## 📌 Tech Stack

| Technology | Purpose              |
| ---------- | -------------------- |
| Node.js    | Runtime              |
| Express 5  | Web framework        |
| dotenv     | Environment variables|
| nodemon    | Development hot-reload|

---

## 📁 Project Structure

```
problem-service/
├── .env                          # Environment variables (PORT)
├── package.json                  # Project metadata & dependencies
├── src/
│   ├── index.js                  # Entry point — starts the server
│   ├── app.js                    # Express app setup & middleware configuration
│   ├── config/
│   │   └── server.config.js      # Loads env variables & exports PORT
│   ├── controllers/
│   │   ├── index.js              # Barrel export for all controllers
│   │   └── problem.controller.js # Route handlers for problem operations
│   ├── routes/
│   │   ├── index.js              # Main API router (mounts /v1)
│   │   └── v1/
│   │       ├── index.js          # v1 router (mounts /problems)
│   │       └── problems.routes.js# Problem-specific route definitions
│   ├── models/                   # (Planned) Database models
│   ├── repositories/             # (Planned) Data access layer
│   ├── services/                 # (Planned) Business logic layer
│   ├── validators/               # (Planned) Request validation
│   └── utils/                    # (Planned) Utility/helper functions
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v20+ installed

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd problem-service

# 2. Install dependencies
npm install

# 3. Create .env file (if not present)
echo "PORT=3001" > .env

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
| GET    | `/ping`                      | Check if service is alive     | ✅ Working  |
| GET    | `/api/v1/problems/ping`      | Check if problem controller is up | ✅ Working  |

### Problem CRUD Operations

| Method | Endpoint                     | Description                   | Status      |
| ------ | ---------------------------- | ----------------------------- | ----------- |
| GET    | `/api/v1/problems`           | Get all problems              | 🚧 Pending |
| GET    | `/api/v1/problems/:id`       | Get a single problem by ID    | 🚧 Pending |
| POST   | `/api/v1/problems`           | Create a new problem          | 🚧 Pending |
| PUT    | `/api/v1/problems/:id`       | Update an existing problem    | 🚧 Pending |
| DELETE | `/api/v1/problems/:id`       | Delete a problem              | 🚧 Pending |

---

## 🏗️ What's Implemented So Far

### ✅ Completed
- **Express App Setup** — Configured with JSON, URL-encoded, text, and raw body parsers
- **Environment Configuration** — `.env` file with `PORT` variable, loaded via `process.loadEnvFile()`
- **Layered Routing Architecture**:
  - `/api` → `apiRouter` (routes/index.js)
  - `/api/v1` → `v1Router` (routes/v1/index.js)
  - `/api/v1/problems` → `problemRouter` (routes/v1/problems.routes.js)
- **Problem Controller** — Defined handler stubs for all CRUD operations (`addProblem`, `getProblem`, `getProblems`, `updateProblem`, `deleteProblem`)
- **Health Check Endpoints** — `/ping` at root level and `/api/v1/problems/ping` at controller level
- **ES Module Support** — Project configured with `"type": "module"` using ES `import/export` syntax

### 🚧 Pending / Planned
- **Models** — Define database schemas for problems
- **Repositories** — Implement data access layer (DB queries)
- **Services** — Add business logic layer between controllers and repositories
- **Validators** — Add request body/params validation
- **Utils** — Add helper/utility functions
- **Database Integration** — Connect to a database (e.g., MongoDB)
- **Error Handling** — Global error handling middleware
- **Controller Logic** — Implement actual logic inside CRUD handler functions

---

## 🔀 Request Flow

```
Client Request
    │
    ▼
src/index.js  (Server entry point)
    │
    ▼
src/app.js  (Express middleware stack)
    │
    ▼
/api  →  src/routes/index.js  (API Router)
    │
    ▼
/api/v1  →  src/routes/v1/index.js  (v1 Router)
    │
    ▼
/api/v1/problems  →  src/routes/v1/problems.routes.js  (Problem Router)
    │
    ▼
src/controllers/problem.controller.js  (Handler Functions)
```

---

## 🧪 Quick Test

After starting the server, test the health check endpoints:

```bash
# Root-level ping
curl http://localhost:3001/ping
# Response: { "message": "Problem service is alive" }

# Problem controller ping
curl http://localhost:3001/api/v1/problems/ping
# Response: { "message": "ping controller is up" }
```

---

## 📝 Notes

- This project uses **ES Modules** (`"type": "module"`). All imports must include the **full file path with `.js` extension** (e.g., `import x from './routes/index.js'`). Directory imports are not supported in ESM.
- The server runs on **port 3001** by default (configurable via `.env`).
