# Campus Image Analysis API — Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Auth Endpoints

### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "name": "Yash Kumar",
  "email": "yash@example.com",
  "password": "Pass123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful.",
  "data": {
    "user": {
      "_id": "664a1b2c3d4e5f6a7b8c9d0e",
      "name": "Yash Kumar",
      "email": "yash@example.com",
      "role": "user",
      "createdAt": "2026-05-11T04:21:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /api/auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "yash@example.com",
  "password": "Pass123"
}
```

### GET /api/auth/profile
Get current user profile. **Requires Auth.**

---

## 2. Image Endpoints

### POST /api/images/upload
Upload an image for analysis. **Requires Auth.**

**Request:** `multipart/form-data`
- `image` (file, required): Image file (JPEG/PNG/WebP/BMP, max 10MB)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/images/upload \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/campus-photo.jpg"
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Image uploaded successfully. Ready for analysis.",
  "data": {
    "analysis": {
      "_id": "664a1b2c3d4e5f6a7b8c9d0f",
      "imageUrl": "/uploads/campus-1715400060000-123456789.jpg",
      "filename": "campus-1715400060000-123456789.jpg",
      "status": "pending",
      "imageMetadata": {
        "width": 1920,
        "height": 1080,
        "format": "jpeg",
        "sizeBytes": 2048576
      }
    }
  }
}
```

### POST /api/images/analyze
Trigger AI analysis on an uploaded image. **Requires Auth.**

**Request Body:**
```json
{
  "imageId": "664a1b2c3d4e5f6a7b8c9d0f"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Image analyzed successfully.",
  "data": {
    "analysis": {
      "_id": "664a1b2c3d4e5f6a7b8c9d0f",
      "detections": [
        {
          "className": "laptop",
          "confidence": 0.92,
          "bbox": { "x": 120, "y": 80, "width": 200, "height": 150 }
        },
        {
          "className": "chair",
          "confidence": 0.87,
          "bbox": { "x": 400, "y": 300, "width": 100, "height": 200 }
        }
      ],
      "detectedObjectsCount": 2,
      "uniqueClasses": ["laptop", "chair"],
      "aiSummary": "The image contains 1 laptop and 1 chair inside a classroom. Detection confidence is very high.",
      "imageCategory": "classroom",
      "tags": ["classroom", "laptop", "chair", "empty-space"],
      "status": "completed",
      "processingTime": 2340
    }
  }
}
```

### GET /api/images
List all images with pagination, filtering, sorting. **Requires Auth.**

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Results per page (max 100) |
| status | string | - | Filter by status |
| imageCategory | string | - | Filter by category |
| sort | string | -createdAt | Sort field(s) |
| search | string | - | Full-text search |

**cURL Example:**
```bash
curl "http://localhost:5000/api/images?page=1&limit=10&status=completed&sort=-createdAt" \
  -H "Authorization: Bearer <token>"
```

### GET /api/images/:id
Get single image analysis. **Requires Auth.**

### DELETE /api/images/:id
Delete an image and its analysis. **Requires Auth.**

---

## 3. Analytics Endpoints (Admin Only)

### GET /api/analytics/dashboard
Get dashboard overview statistics.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalUploads": 156,
      "activeAnalyses": 142,
      "statusBreakdown": [
        { "_id": "completed", "count": 142 },
        { "_id": "pending", "count": 8 },
        { "_id": "failed", "count": 4 },
        { "_id": "rejected", "count": 2 }
      ],
      "categoryBreakdown": [
        { "_id": "classroom", "count": 65 },
        { "_id": "outdoor", "count": 38 },
        { "_id": "laboratory", "count": 22 }
      ],
      "detectionStats": {
        "totalDetections": 1847,
        "avgDetectionsPerImage": 13.01,
        "avgProcessingTime": 2150,
        "maxDetections": 42
      },
      "confidenceStats": {
        "avgConfidence": 0.823,
        "minConfidence": 0.601,
        "maxConfidence": 0.998
      }
    }
  }
}
```

### GET /api/analytics/trends?days=30
Get upload/detection trends over time.

### GET /api/analytics/objects?limit=20
Get most frequently detected objects.

---

## 4. Comparison Endpoint

### POST /api/compare/:imageId1/:imageId2
Compare two analyzed images. **Requires Auth.**

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "comparison": {
      "image1": { "id": "...", "filename": "...", "category": "classroom", "totalObjects": 8 },
      "image2": { "id": "...", "filename": "...", "category": "laboratory", "totalObjects": 12 },
      "similarityPercentage": 33.33,
      "commonObjects": [
        { "className": "chair", "countInImage1": 4, "countInImage2": 6 }
      ],
      "missingObjects": [
        { "className": "whiteboard", "count": 1 }
      ],
      "additionalObjects": [
        { "className": "microscope", "count": 3 }
      ],
      "confidenceComparison": {
        "image1Average": 0.856,
        "image2Average": 0.791,
        "higherConfidence": "image1"
      },
      "summary": "The images have a 33.33% similarity..."
    }
  }
}
```

---

## 5. Health Check

### GET /api/health
```json
{
  "status": "success",
  "message": "Campus Image Analysis API is running",
  "timestamp": "2026-05-11T04:30:00.000Z",
  "environment": "development"
}
```

---

## Error Responses

All errors follow this structure:
```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Authentication required or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Image validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Environment Variables

See `.env.example` for the complete list of configurable variables.

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```
