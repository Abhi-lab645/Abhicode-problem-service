# 🧩 Problem Service

A microservice for managing coding problems, built as part of the **Abhicode** platform.

[![Production API](https://img.shields.io/badge/Production%20API-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://problem-service.vercel.app)
[![Database](https://img.shields.io/badge/MongoDB%20Atlas-AWS%20Mumbai%20(ap--south--1)-green?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)

---

## 🌐 Production Deployments

- **Live Service URL:** [https://problem-service.vercel.app](https://problem-service.vercel.app)
- **Live Healthcheck:** [https://problem-service.vercel.app/ping](https://problem-service.vercel.app/ping)
- **Live Problems API:** [https://problem-service.vercel.app/api/v1/problems](https://problem-service.vercel.app/api/v1/problems)
- **Production Database:** MongoDB Atlas (ReplicaSet on AWS `ap-south-1`)

---

## 📌 Tech Stack

| Technology      | Purpose                |
| --------------- | ---------------------- |
| Node.js         | Runtime (v20+)         |
| Express 5       | Web framework          |
| MongoDB Atlas   | Cloud Database (AWS)   |
| Mongoose        | ODM                    |
| CORS            | Cross-Origin Sharing   |
| XSS             | Safe input sanitizer   |
| Winston         | Structured logging     |
| winston-mongodb | DB logging transport   |
| Vercel          | Serverless Deployment  |
| dotenv          | Environment variables  |
| nodemon         | Development hot-reload |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhi-lab645/Abhicode-problem-service.git
   cd Abhicode-problem-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.e36d6zm.mongodb.net/abhicode?retryWrites=true&w=majority
   MONGODB_LOGS_URL=mongodb+srv://<username>:<password>@cluster0.e36d6zm.mongodb.net/abhicode?retryWrites=true&w=majority
   NODE_ENV=development
   ```

4. **Start the service:**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify health check:**
   ```bash
   curl http://localhost:3001/ping
   ```

---

## 📁 Project Structure

```
problem-service/
├── .env                          # Environment variables (PORT, DB URLs)
├── app.log                       # Local logger file (pretty JSON output)
├── package.json                  # Project metadata & dependencies
├── vercel.json                   # Vercel serverless rewrite rules
├── api/
│   └── index.js                  # Vercel serverless entry point with connection caching
├── scripts/
│   └── migrate-problem-metadata.js # Idempotent migration to backfill problemId & topics
├── tests/
│   └── problem.test.js           # Automated test suite (node:test)
├── src/
│   ├── index.js                  # Entry point — connects to DB and starts local Express server
│   ├── app.js                    # Express app setup, CORS, routing, & error handling
│   ├── config/
│   │   ├── db.config.js          # Mongoose connection pooling & caching
│   │   ├── logger.config.js      # Winston logger setup (Console, File, MongoDB)
│   │   └── server.config.js      # Safe env loader (process.env fallback for cloud)
│   ├── controllers/
│   │   ├── index.js              # Barrel export for controllers
│   │   └── problem.controller.js # Maps HTTP requests to service layer
│   ├── errors/
│   │   ├── base.error.js         # Base custom error class (captures stack trace)
│   │   ├── badRequest.error.js   # 400 Bad Request
│   │   ├── conflict.error.js     # 409 Conflict
│   │   ├── internalServer.error.js # 500 Internal Server Error
│   │   ├── notFound.error.js     # 404 Not Found
│   │   └── index.js              # Barrel export for error classes
│   ├── models/
│   │   ├── counter.model.js      # Atomic sequence counter for public problem IDs
│   │   ├── problem.model.js      # Mongoose schema for Problems
│   │   └── index.js              # Barrel export for models
│   ├── repositories/
│   │   ├── problem.repository.js # Database queries, atomic ID allocation, dual lookup
│   │   └── index.js              # Barrel export for repositories
│   ├── services/
│   │   ├── problem.service.js    # Core business logic & validation layer
│   │   └── index.js              # Barrel export for services
│   ├── utils/
│   │   ├── errorHandler.js       # Global Express error middleware
│   │   ├── markdownSanitizer.js  # Markdown sanitization (XSS safe)
│   │   ├── problemHelper.js      # ProblemId formatters, regex escaping, topic validators
│   │   └── index.js              # Barrel export for utils
│   └── routes/
│       ├── index.js              # Main API router
│       └── v1/
│           ├── index.js          # v1 router
│           └── problems.routes.js# Problem-specific routes
```

---

## 🏷️ Problem Metadata Specification

Each problem contains:

- `_id`: MongoDB internal ObjectId (preserved for database identity).
- `problemId`: Unique, permanent human-friendly public identifier (`ABH-0001`, `ABH-0002`, ...). Generated atomically on the backend; immutable once assigned.
- `title`: Problem title (unique, non-empty string).
- `description`: Problem statement with Markdown support (sanitized on input).
- `difficulty`: `'easy' | 'medium' | 'hard'`.
- `topics`: Array of string tags representing DSA concepts, algorithms, and data structures (e.g. `["Array", "Hash Map"]`).
- `testCases`: Array of test case input/output pairs.
- `editorial`: Optional solution approach and editorial notes.

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:3001`

### Health Check

| Method | Endpoint                | Description                       | Status    |
| ------ | ----------------------- | --------------------------------- | --------- |
| GET    | `/ping`                 | Check if service is alive         | ✅ Active |
| GET    | `/api/v1/problems/ping` | Check if problem controller is up | ✅ Active |

### Problem Operations

| Method | Endpoint | Description | Notes |
| --- | --- | --- | --- |
| **GET** | `/api/v1/problems` | List all problems (includes `problemId` & `topics`) | Supports `?search=...` query param |
| **GET** | `/api/v1/problems?search=ABH-0001` | Search problem by public ID or title substring | Case-insensitive title match or exact ID match |
| **GET** | `/api/v1/problems/:id` | Get single problem by ID | Accepts **either** `problemId` (`ABH-0001`) or MongoDB `_id` |
| **POST** | `/api/v1/problems` | Create a new problem | `problemId` generated automatically by backend |
| **PUT** | `/api/v1/problems/:id` | Update existing problem | Supports updating topics, title, description, difficulty |
| **DELETE** | `/api/v1/problems/:id` | Delete a problem | Accepts `problemId` or MongoDB `_id` |

---

### Request & Response Examples

#### 1. Create a Problem (`POST /api/v1/problems`)

**Request Body:**
```json
{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "difficulty": "easy",
  "topics": ["Array", "Hash Map"],
  "testCases": [
    {
      "input": "[2,7,11,15]\n9",
      "output": "[0,1]"
    }
  ],
  "editorial": "Use a hash map to store previously seen values."
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "successfully created a new problem",
  "error": {},
  "data": {
    "_id": "6a80ad57349b8eb983d61bdb",
    "problemId": "ABH-0001",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "easy",
    "topics": ["Array", "Hash Map"],
    "testCases": [
      {
        "input": "[2,7,11,15]\n9",
        "output": "[0,1]",
        "_id": "6a80ad57349b8eb983d61bdc"
      }
    ],
    "editorial": "Use a hash map to store previously seen values.",
    "createdAt": "2026-10-14T09:21:35.453Z",
    "updatedAt": "2026-10-14T09:21:35.453Z"
  }
}
```

#### 2. Get Single Problem (`GET /api/v1/problems/ABH-0001`)

Works with public ID or MongoDB `_id`:
- `GET /api/v1/problems/ABH-0001`
- `GET /api/v1/problems/6a80ad57349b8eb983d61bdb`

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Successfully fetched a problem",
  "error": {},
  "data": {
    "_id": "6a80ad57349b8eb983d61bdb",
    "problemId": "ABH-0001",
    "title": "Two Sum",
    "difficulty": "easy",
    "topics": ["Array", "Hash Map"],
    "testCases": [ ... ],
    "editorial": "..."
  }
}
```

#### 3. Search Problems (`GET /api/v1/problems?search=Two`)

- `GET /api/v1/problems?search=ABH-0001` (Exact public ID search)
- `GET /api/v1/problems?search=Two%20Sum` (Case-insensitive title substring search)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Successfully fetched all the problems",
  "error": {},
  "data": [
    {
      "_id": "6a80ad57349b8eb983d61bdb",
      "problemId": "ABH-0001",
      "title": "Two Sum",
      "difficulty": "easy",
      "topics": ["Array", "Hash Map"],
      "testCases": [ ... ]
    }
  ]
}
```

#### 4. Update Topics (`PUT /api/v1/problems/ABH-0001`)

```json
{
  "topics": ["Array", "Hash Table", "Prefix Sum"]
}
```
*Note: Supplying an empty array `[]` will intentionally clear topics. Omitting `topics` entirely preserves existing topics.*

---

## 🔄 Database Migration

For existing databases that possess legacy documents without `problemId` or `topics`, a safe and idempotent migration script is provided.

```bash
node scripts/migrate-problem-metadata.js
```

### Migration Behavior & Precautions:
1. **Preserves Existing Data:** Does not delete records or alter existing MongoDB `_id` values.
2. **Atomic Counter Synchronization:** Discovers any existing highest sequence number and initializes/reconciles the `Counter` collection.
3. **Idempotent:** Safe to run multiple times; documents that already have a `problemId` are untouched.
4. **Index Verification:** Verifies and enforces a unique index on `problemId`.

---

## 🧪 Testing

Run the automated test suite using Node's native test runner:

```bash
npm test
```

### Test Coverage:
- Topic normalization, whitespace trimming, and case-insensitive deduplication.
- Topic validations (max count, max length, empty string rejections).
- Topic updating, clearing, and preservation when omitted.
- Atomic public ID generation (`ABH-0001`).
- Client spoofing prevention (backend always generates `problemId`).
- ID stability across updates and non-reuse after deletion.
- Dual-lookup by `problemId` and `_id`.
- 404 responses for non-existent and malformed IDs (no 500 or unhandled CastErrors).
- Public ID and title substring search.
- High-concurrency creation conflict safety.

---

## 📮 Postman Manual Test Guide

| Step | Method | URL | Body / Notes | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Create** | `POST` | `http://localhost:3001/api/v1/problems` | Provide `title`, `description`, `difficulty`, `topics: ["Dynamic Programming", "Memoization"]` | `201 Created`, check `data.problemId` and `data.topics` |
| **2. Public ID Lookup** | `GET` | `http://localhost:3001/api/v1/problems/ABH-0001` | None | `200 OK` |
| **3. Legacy ObjectId Lookup** | `GET` | `http://localhost:3001/api/v1/problems/<mongodb_id>` | None | `200 OK` |
| **4. Search by ID** | `GET` | `http://localhost:3001/api/v1/problems?search=ABH-0001` | Query param | `200 OK` (1 result) |
| **5. Search by Title** | `GET` | `http://localhost:3001/api/v1/problems?search=palindrome` | Query param | `200 OK` (matches Palindrome) |
| **6. Update Topics** | `PUT` | `http://localhost:3001/api/v1/problems/ABH-0001` | `{"topics": ["Array", "Two Pointers"]}` | `200 OK`, topics updated |
| **7. Invalid ID 404** | `GET` | `http://localhost:3001/api/v1/problems/ABH-9999` | None | `404 Not Found` |
