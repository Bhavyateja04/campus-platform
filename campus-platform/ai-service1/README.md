<p align="center">
  <h1 align="center">🎯 CampusVision AI — Backend</h1>
  <p align="center">
    AI-powered item inventory analysis platform built with Node.js, Express, MongoDB, and OpenRouter Vision API.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Services](#-services)
- [Middleware](#-middleware)
- [Database Models](#-database-models)
- [Background Jobs](#-background-jobs)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Overview

CampusVision AI Backend is a RESTful API server that powers an intelligent item inventory system. Users upload images of items, and the system automatically:

1. **Validates** image quality (blur, corruption, resolution)
2. **Analyzes** the image using AI vision models (OpenRouter → Gemini)
3. **Categorizes** items into **stationery**, **electronics**, **books**, or **accessories**
4. **Rejects** non-conforming items (random scenes, people, food, etc.)
5. **Stores** only valid inventory items in MongoDB with full detection metadata

This is a **single-step upload-and-analyze workflow** — there is no separate analysis step.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Vision Analysis** | OpenRouter API integration with Gemini 2.0 Flash for object detection and scene understanding |
| 🔍 **Image Validation** | Pre-analysis checks: blur detection (Laplacian variance), corruption, resolution, file size |
| 🏷️ **Smart Categorization** | Automatic item classification into 4 categories with NSFW filtering |
| 🔐 **JWT Authentication** | Secure token-based auth with role-based access control (user/admin) |
| 📊 **Analytics Dashboard** | MongoDB aggregation pipelines for stats, trends, and top detected objects |
| 🔄 **Image Comparison** | Jaccard similarity index to compare detections between two images |
| ☁️ **Cloudinary Integration** | Optional cloud image storage with automatic local fallback |
| 🧹 **Auto Cleanup** | Background job removes orphaned files and marks stale analyses as failed |
| 🛡️ **Security Hardened** | Helmet, CORS, rate limiting, input validation (Joi + express-validator) |
| 🔎 **Advanced Queries** | Full-text search, pagination, filtering, and sorting via `APIFeatures` utility |
| 📦 **Response Compression** | Gzip compression for all API responses |
| 📝 **Request Logging** | Morgan HTTP logger with environment-aware formats |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Database** | MongoDB + Mongoose 8.x |
| **AI Vision** | OpenRouter API (Gemini 2.0 Flash) |
| **Object Detection** | Roboflow API (optional fallback) |
| **Image Processing** | Sharp (blur detection, metadata extraction) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Cloud Storage** | Cloudinary (optional) |
| **File Upload** | Multer |
| **Validation** | Joi / express-validator |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan |

---

## 🏗️ Architecture

```
Client (React Native App)
        │
        ▼
┌──────────────────────────────────────────────┐
│               Express.js Server              │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Security │  │ Logging  │  │   Rate     │ │
│  │ (Helmet) │  │ (Morgan) │  │  Limiting  │ │
│  └──────────┘  └──────────┘  └────────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │           Route Layer                │    │
│  │  /auth  /images  /analytics /compare │    │
│  └──────────────────────────────────────┘    │
│                    │                         │
│  ┌──────────────────────────────────────┐    │
│  │         Controller Layer             │    │
│  │  Auth · Image · Analytics · Compare  │    │
│  └──────────────────────────────────────┘    │
│                    │                         │
│  ┌──────────────────────────────────────┐    │
│  │          Service Layer               │    │
│  │  AI Vision · Roboflow · Validation   │    │
│  │  Summary · Comparison · Analytics    │    │
│  └──────────────────────────────────────┘    │
│                    │                         │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐ │
│  │  MongoDB   │  │Cloudinary│  │OpenRouter │ │
│  │  (Mongoose)│  │ (Cloud)  │  │   API     │ │
│  └────────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── app.js                    # Express app setup (middleware, routes, error handling)
├── server.js                 # Server entry point (DB connection, port management)
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variable template
├── API_DOCS.md               # Detailed API documentation
│
├── config/
│   ├── index.js              # Centralized configuration (env vars → config object)
│   ├── db.js                 # MongoDB connection with Mongoose
│   └── cloudinary.js         # Cloudinary SDK setup + upload/delete helpers
│
├── controllers/
│   ├── authController.js     # Register, login, profile
│   ├── imageController.js    # Upload, analyze, list, get, delete images
│   ├── analyticsController.js# Dashboard stats, trends, top objects
│   └── comparisonController.js # Compare two image analyses
│
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   ├── roleCheck.js          # Role-based authorization (admin, user)
│   ├── upload.js             # Multer file upload configuration
│   ├── validate.js           # Request validation middleware
│   ├── rateLimiter.js        # Rate limiting (general + upload-specific)
│   └── errorHandler.js       # Global error handler (dev/prod modes)
│
├── models/
│   ├── User.js               # User schema (name, email, password, role)
│   └── ImageAnalysis.js      # Image analysis schema (detections, metadata, etc.)
│
├── routes/
│   ├── authRoutes.js         # POST /register, /login, GET /profile
│   ├── imageRoutes.js        # POST /upload, /analyze, GET /, /:id, DELETE /:id
│   ├── analyticsRoutes.js    # GET /dashboard, /trends, /objects
│   └── comparisonRoutes.js   # POST /:imageId1/:imageId2
│
├── services/
│   ├── aiVisionService.js    # OpenRouter/Gemini API integration
│   ├── roboflowService.js    # Roboflow object detection (fallback)
│   ├── imageValidationService.js # Blur detection, quality scoring, relevance checks
│   ├── summaryService.js     # AI summary generation, categorization, tag creation
│   ├── comparisonService.js  # Jaccard similarity + object diff comparison
│   ├── analyticsService.js   # MongoDB aggregation pipelines for analytics
│   └── authService.js        # Auth business logic
│
├── utils/
│   ├── AppError.js           # Custom error class with status codes
│   ├── catchAsync.js         # Async error wrapper for controllers
│   ├── apiFeatures.js        # Query builder (search, filter, sort, paginate)
│   └── constants.js          # Enums: statuses, categories, roles, MIME types
│
├── validations/
│   ├── authValidation.js     # Joi schemas for register/login
│   └── imageValidation.js    # Joi schemas for image operations
│
├── jobs/
│   └── cleanupJob.js         # Periodic orphan file + stale record cleanup
│
└── uploads/                  # Local image storage directory
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** ≥ 6.x (local or Atlas)
- **npm** ≥ 9.x
- **OpenRouter API Key** ([get one here](https://openrouter.ai/keys))

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your actual values (see section below)

# 4. Start development server
npm run dev
```

### Running

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:5000` by default. Verify with:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Campus Image Analysis API is running",
  "timestamp": "2026-05-11T09:30:00.000Z",
  "environment": "development"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory. See [`.env.example`](.env.example) for the full template.

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment (`development` / `production`) |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/campus-image-analysis` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration |
| `OPENROUTER_API_KEY` | **Yes** | — | API key from [OpenRouter](https://openrouter.ai) |
| `OPENROUTER_MODEL` | No | `google/gemini-2.0-flash-001` | Vision model to use |
| `ROBOFLOW_API_KEY` | No | — | Roboflow API key (optional fallback) |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `USE_CLOUDINARY` | No | `false` | Enable Cloudinary uploads |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `MAX_IMAGE_SIZE_MB` | No | `10` | Max upload size in MB |
| `BLUR_THRESHOLD` | No | `100` | Blur detection threshold |
| `CLEANUP_INTERVAL_HOURS` | No | `24` | Cleanup job interval |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | ❌ | Create a new user account |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/api/auth/profile` | 🔐 | Get current user profile |

### Images

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/images/upload` | 🔐 | Upload + auto-analyze an image |
| `POST` | `/api/images/analyze` | 🔐 | Re-analyze an existing image |
| `GET` | `/api/images` | 🔐 | List all images (paginated, filterable) |
| `GET` | `/api/images/:id` | 🔐 | Get single image analysis |
| `DELETE` | `/api/images/:id` | 🔐 | Delete an image and its analysis |

### Analytics (Admin Only)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/analytics/dashboard` | 🔐👑 | Dashboard overview statistics |
| `GET` | `/api/analytics/trends` | 🔐👑 | Upload/detection trends over time |
| `GET` | `/api/analytics/objects` | 🔐👑 | Most frequently detected objects |

### Comparison

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/compare/:imageId1/:imageId2` | 🔐 | Compare two analyzed images |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/health` | ❌ | Server health check |

> 🔐 = Requires JWT token &nbsp; | &nbsp; 👑 = Admin role required

For detailed request/response examples, see **[API_DOCS.md](API_DOCS.md)**.

---

## ⚡ Services

### AIVisionService (`services/aiVisionService.js`)
- Sends images to **OpenRouter API** (Gemini 2.0 Flash) for vision analysis
- Returns structured JSON: detections, category, summary, tags, NSFW check
- Handles markdown stripping, response normalization, and error mapping
- Enforces item validation — only **stationery, electronics, books, accessories** are accepted

### RoboflowService (`services/roboflowService.js`)
- Optional fallback using **Roboflow** object detection API
- Supports both standard inference and workflow-based analysis
- Normalizes predictions into a unified detection format

### ImageValidationService (`services/imageValidationService.js`)
- **Blur detection** using Laplacian variance via Sharp
- **Quality scoring** (resolution + sharpness + format = 0–100 score)
- **Dimension validation** (min 100×100, max 10000×10000)
- **Corruption detection** via metadata extraction
- **Relevance filtering** using IoU-based duplicate removal

### SummaryService (`services/summaryService.js`)
- Generates natural language summaries from detections
- Categorizes images based on keyword matching
- Creates searchable tags with confidence labels

### ComparisonService (`services/comparisonService.js`)
- Compares two image analyses using **Jaccard similarity index**
- Reports common, missing, and additional objects
- Generates confidence comparison and human-readable summary

### AnalyticsService (`services/analyticsService.js`)
- Dashboard stats via MongoDB `$facet` aggregation
- Time-series trends with configurable lookback period
- Top detected objects with appearance frequency

---

## 🛡️ Middleware

| Middleware | File | Purpose |
|-----------|------|---------|
| **Auth** | `middleware/auth.js` | JWT verification, user extraction, account status check |
| **Role Check** | `middleware/roleCheck.js` | Role-based access control (admin gates) |
| **Upload** | `middleware/upload.js` | Multer config: file type filtering, size limits, storage |
| **Validate** | `middleware/validate.js` | Joi schema validation for request bodies |
| **Rate Limiter** | `middleware/rateLimiter.js` | General (100 req/15min) + upload-specific (20 req/15min) |
| **Error Handler** | `middleware/errorHandler.js` | Global error handler with dev/prod response formats |
| **Helmet** | (built-in) | HTTP security headers |
| **CORS** | (built-in) | Cross-origin resource sharing |
| **Compression** | (built-in) | Gzip response compression |

---

## 📦 Database Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | User's display name (2–50 chars) |
| `email` | String | Unique email address |
| `password` | String | Bcrypt-hashed password (excluded from queries) |
| `role` | Enum | `user` or `admin` |
| `isActive` | Boolean | Account active status |

### ImageAnalysis

| Field | Type | Description |
|-------|------|-------------|
| `imageUrl` | String | Local path or Cloudinary URL |
| `filename` | String | Stored filename |
| `uploadedBy` | ObjectId → User | Reference to uploading user |
| `detections` | Array | Object detections (className, confidence, bbox) |
| `detectedObjectsCount` | Number | Auto-computed total detections |
| `uniqueClasses` | [String] | Auto-computed unique class names |
| `aiSummary` | String | AI-generated description |
| `imageCategory` | Enum | `stationery`, `electronics`, `books`, `accessories`, `unknown` |
| `tags` | [String] | Searchable tags |
| `status` | Enum | `pending`, `processing`, `completed`, `failed`, `rejected` |
| `processingTime` | Number | Analysis duration in milliseconds |
| `imageMetadata` | Object | Width, height, format, sizeBytes |

**Indexes:** Compound indexes on `(status, createdAt)`, `(uploadedBy, createdAt)`, `(imageCategory, status)`, and a weighted text index on `(aiSummary, tags, uniqueClasses)`.

---

## 🧹 Background Jobs

### Cleanup Job (`jobs/cleanupJob.js`)

Runs periodically (default: every 24 hours) to maintain storage hygiene:

- **Orphan File Removal** — Deletes uploaded files that have no corresponding MongoDB document (older than 48 hours)
- **Stale Analysis Cleanup** — Marks analyses stuck in `processing` status as `failed`

Configuration via environment variables:
- `CLEANUP_INTERVAL_HOURS` — How often the job runs (default: 24)
- `ORPHAN_FILE_AGE_HOURS` — Minimum age before a file is considered orphaned (default: 48)

---

## ❌ Error Handling

All errors follow a consistent JSON structure:

```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

| Status Code | Meaning |
|:-----------:|---------|
| `400` | Bad request / validation error |
| `401` | Authentication required or invalid token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, etc.) |
| `422` | Image validation failed (blur, NSFW, wrong category) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

In **development** mode, error responses include a `stack` trace for debugging.

---

## 🚢 Deployment

### Quick Deploy Checklist

1. Set `NODE_ENV=production` in your environment
2. Use a strong, unique `JWT_SECRET`
3. Use MongoDB Atlas or a managed database
4. Enable Cloudinary (`USE_CLOUDINARY=true`) for persistent image storage
5. Configure rate limiting for production traffic
6. Use a process manager (PM2, systemd) for reliability

### PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name campusvision-api

# Save process list and set startup hook
pm2 save
pm2 startup
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t campusvision-api .
docker run -p 5000:5000 --env-file .env campusvision-api
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <strong>Yash</strong>
</p>
