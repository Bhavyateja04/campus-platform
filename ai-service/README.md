# 📦 Inventory Analysis Backend

A Node.js/Express backend that analyzes product/inventory images from MongoDB, detects objects using **Roboflow API**, generates AI-powered reports, and provides comprehensive inventory summaries.

---

## 🏗️ Architecture

```
MongoDB (Products with Images)
    ↓
Express API Server
    ↓
Roboflow API  →  Object Detection & Analysis
    ↓
Local Summary Service → Generate Reports & Summaries
    ↓
API Response (Detections + Summary + Metadata)
```

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:
```env
MONGODB_URI=mongodb://localhost:27017/inventory_db
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_PROJECT_ID=your_project_id
ROBOFLOW_MODEL_VERSION=1
ROBOFLOW_WORKSPACE=your_workspace
ROBOFLOW_WORKFLOW=your_workflow_name
PORT=5000
```

### 3. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products (paginated) |
| `GET` | `/api/products?category=Electronics` | Filter by category |
| `GET` | `/api/products?page=1&limit=20` | Pagination support |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create a new product |

**Create Product Body:**
```json
{
  "name": "Wireless Headphones",
  "sku": "WH-001",
  "category": "Electronics",
  "description": "High-quality wireless headphones",
  "imageUrl": "https://example.com/image.jpg",
  "metadata": {
    "price": 99.99,
    "stock": 50,
    "warehouse": "Main"
  }
}
```

---

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analysis/:id` | Full analysis for one product |
| `GET` | `/api/analysis/:id?force=true` | Force fresh analysis (bypass cache) |
| `POST` | `/api/analysis/batch` | Analyze specific products |
| `GET` | `/api/analysis/all` | Analyze all products (default: 10) |

**Batch Analysis Body:**
```json
{
  "productIds": ["id1", "id2", "id3"]
}
```

---

## 📊 Analysis Response Example

```json
{
  "success": true,
  "cached": false,
  "product": {
    "_id": "...",
    "name": "Wireless Headphones",
    "sku": "WH-001",
    "category": "Electronics",
    "imageUrl": "https://..."
  },
  "detections": {
    "count": 3,
    "classes": [
      { "name": "headphones", "count": 1 },
      { "name": "cable", "count": 2 }
    ]
  },
  "summary": "## Product Analysis\nDetailed report with detections...",
  "analyzedAt": "2026-05-04T10:30:00.000Z"
}
```

---

## 🔧 Core Functions

### roboflowService.js

**`analyzeImage(imageUrl)`** ⭐ Main Entry Point
```javascript
const { analyzeImage } = require('./roboflowService');

const result = await analyzeImage('https://example.com/image.jpg');
// Returns: { success, predictions, formatted, inferenceId, time }
```

**`detectObjects(imageUrl)`**
```javascript
// Sends image to Roboflow API and returns raw detection results
const detections = await detectObjects(imageUrl);
```

**`formatDetections(predictions)`**
```javascript
// Converts raw predictions into readable format
const formatted = formatDetections(predictions);
// Returns: { count, classes, details }
```

---

### dbSummary.js

**`getInventorySummary(collection)`** - Groups & Counts Labels
```javascript
const { getInventorySummary, makeSentence } = require('./dbSummary');

const summary = await getInventorySummary(Product.collection);
// Returns: [{ _id: "chair", count: 15 }, { _id: "desk", count: 8 }]
```

**`makeSentence(summary)`** - Human-Readable Output
```javascript
const text = makeSentence(summary);
// Returns: "Most items are chair (15 items)."
```

---

### localSummaryService.js

**`generateInventorySummary(product, detections, similarProducts)`**
```javascript
// Generates detailed product analysis report
const summary = await generateInventorySummary(product, detections);
```

**`generateBatchSummary(products)`**
```javascript
// Batch process multiple products
const results = await generateBatchSummary(products);
```

---

## 🔄 Batch Processing Scripts

### analyzeMongoDBProducts.js
Comprehensive MongoDB analysis with multi-phase processing:

```bash
node analyzeMongoDBProducts.js
```

**Outputs:**
- ✅ MongoDB connection status
- 📊 Product overview (count, images, detections)
- 📈 Detection statistics
- 📂 Category breakdown
- 🏆 Top detected products
- ⚠️ Products without images/summaries
- 📋 Detailed product table
- 🏷️ Label summary (grouped by detected labels)
- 💾 Database storage info

---

### dbSummary.js
Quick database summary and label statistics:

```bash
node dbSummary.js
```

**Outputs:**
- 📊 Overall statistics
- 📈 Success rates
- 📂 Products by category
- 🏆 Top detected products
- 📝 Products without analysis
- 💾 Database size info
- 🏷️ Label summary with sentence

---

## 💾 MongoDB Product Schema

```javascript
{
  name: String,              // Product name (required)
  sku: String,               // Unique SKU (required)
  category: String,          // Product category
  description: String,       // Product description
  imageUrl: String,          // Image URL (required)
  imageBase64: String,       // Optional: base64 image data
  label: String,             // Detected label (set by analysis)
  metadata: Mixed,           // Flexible: price, stock, warehouse, etc.
  lastAnalyzed: Date,        // Last analysis timestamp
  analysisCache: {
    detections: Mixed,       // Roboflow detection results
    summary: String,         // Generated analysis report
    similarProducts: [String], // Similar product IDs
    cachedAt: Date           // Cache timestamp (1 hour TTL)
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📁 Project Structure

```
Backend/
├── server.js                      # Express app entry point
├── analyzeMongoDBProducts.js       # Batch analysis script ⭐
├── dbSummary.js                   # Database summary script ⭐
├── db.js                          # MongoDB connection
├── Product.js                     # Mongoose schema
├── inventoryController.js         # API route handlers
├── inventoryRoutes.js             # Express routes
├── roboflowService.js             # Roboflow integration ⭐
├── localSummaryService.js         # Summary generation
├── findMatching.js                # Similar image finder
├── errorMiddleware.js             # Error handling
├── package.json                   # Dependencies
├── .env.example                   # Environment template
└── README.md                      # This file
```

---

## 🔑 Getting API Keys

### Roboflow
1. Sign up at [roboflow.com](https://roboflow.com)
2. Create or import a project
3. Train a detection model
4. Go to **Settings → API Keys**
5. Copy your **API Key**, **Project ID**, and **Model Version**

### MongoDB
1. Set up MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string (format: `mongodb://localhost:27017/inventory_db`)

---

## 🔄 Workflow Example

### 1. Add a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Keyboard",
    "sku": "KB-001",
    "category": "Electronics",
    "imageUrl": "https://example.com/keyboard.jpg",
    "metadata": { "price": 89.99, "stock": 25 }
  }'
```

### 2. Analyze the Product
```bash
curl http://localhost:5000/api/analysis/:productId
```

### 3. Get Inventory Summary
```bash
node dbSummary.js
```

**Output:**
```
🏷️  DETECTED LABELS SUMMARY:

   1. chair: 15 items
   2. desk: 8 items
   3. lamp: 5 items
   
   📊 Most items are chair (15 items).
```

---

## ⚙️ Configuration

### Cache Duration
- Default: 1 hour (3,600,000 ms)
- Located in: `inventoryController.js`
- Force bypass: Add `?force=true` to analysis endpoint

### Pagination
- Default limit: 20 products
- Default page: 1
- Query: `?page=2&limit=50`

### Analysis Limits
- Batch analysis: Auto-limits to available products
- Full analysis: Default limit 10 products
- Override: `?limit=50`

---

## 🐛 Error Handling

The system includes middleware for:
- ✅ MongoDB connection errors
- ✅ Invalid product IDs
- ✅ Missing required fields
- ✅ Roboflow API failures
- ✅ Rate limiting

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 📈 Features

| Feature | Description |
|---------|-------------|
| **Object Detection** | Uses Roboflow AI to detect objects in images |
| **Results Caching** | 1-hour cache to reduce API calls |
| **Batch Processing** | Analyze multiple products at once |
| **Label Summarization** | Group products by detected labels |
| **Pagination** | Handle large product datasets |
| **Category Filtering** | Filter products by category |
| **Force Analysis** | Bypass cache for fresh results |
| **Local Summaries** | Generate reports without external AI |

---

## 🚀 Next Steps

1. **Initial Setup:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm start
   ```

2. **Add Products:**
   - Via API POST endpoint
   - MongoDB directly
   - Bulk import script

3. **Analyze:**
   ```bash
   node analyzeMongoDBProducts.js
   ```

4. **View Results:**
   ```bash
   node dbSummary.js
   ```

---

## 📝 Notes

- All responses cached for 1 hour to optimize API usage
- Roboflow costs depend on your plan (free tier available)
- MongoDB required for data persistence
- Supports any publicly accessible image URLs
