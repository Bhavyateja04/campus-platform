/**
 * @fileoverview Express application entry point.
 * Initialises middleware, mounts all route groups, and starts the HTTP server.
 *
 * Route groups:
 *   /                              → Health check
 *   /detect                        → Bulk Roboflow detection (all products)
 *   /detect/single                 → Single-image Roboflow detection
 *   /api/products                  → Product CRUD  (via inventoryRoutes)
 *   /api/analysis/*                → AI analysis   (via inventoryRoutes)
 *   /api/compare-images            → Compare two arbitrary image URLs
 *   /api/matches/:lostId/:foundId  → Lost-and-found match summary
 *   /api/lost-found/*              → Lost-and-found analysis & match management
 */

require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const axios    = require("axios");
const cors     = require("cors");

const connectDB          = require("./db");
const Product            = require("./Product");
const { errorHandler, notFound } = require("./errorMiddleware");
const {
  generateMatchSummary,
  generateCampusLostFoundAnalysis,
  compareImagesWithDetections,
} = require("./geminiService");
const inventoryRoutes = require("./inventoryRoutes");

// ─────────────────────────────────────────────
//  Environment Configuration
// ─────────────────────────────────────────────

const PORT                  = process.env.PORT                  || 5000;
const ROBOFLOW_API_KEY      = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_PROJECT_ID   = process.env.ROBOFLOW_PROJECT_ID;   // Exposed in single-detect response
const ROBOFLOW_MODEL_VERSION = process.env.ROBOFLOW_MODEL_VERSION || 1;
const ROBOFLOW_WORKSPACE    = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW_NAME = process.env.ROBOFLOW_WORKFLOW_NAME;

/** Fully-qualified Roboflow Serverless Workflows endpoint */
const ROBOFLOW_SERVERLESS_URL =
  `https://serverless.roboflow.com/${ROBOFLOW_WORKSPACE}/workflows/${ROBOFLOW_WORKFLOW_NAME}`;

// ─────────────────────────────────────────────
//  App Initialisation
// ─────────────────────────────────────────────

const app = express();

connectDB(); // Establish MongoDB connection on startup

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─────────────────────────────────────────────
//  Route Group: Inventory & Analysis (router)
// ─────────────────────────────────────────────

app.use("/api", inventoryRoutes);

// ─────────────────────────────────────────────
//  Helper: Roboflow Detection
// ─────────────────────────────────────────────

/**
 * Sends an image URL to the Roboflow Serverless Workflows API.
 * Centralised here so all detection routes share one implementation.
 *
 * @param   {string} imageUrl - Publicly accessible URL of the image
 * @returns {Promise<{ success: boolean, predictions: Array, raw?: object, error?: string }>}
 */
const detectImageObjects = async (imageUrl) => {
  try {
    const response = await axios.post(
      ROBOFLOW_SERVERLESS_URL,
      {
        api_key: ROBOFLOW_API_KEY,
        inputs:  { image: { type: "url", value: imageUrl } },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30_000, // 30 s — prevents hanging on slow upstream responses
      }
    );

    return {
      success:     true,
      predictions: response.data.predictions || [],
      raw:         response.data,
    };
  } catch (error) {
    console.error("Roboflow detection error:", error.message);
    return {
      success:     false,
      error:       error.message,
      predictions: [],
    };
  }
};

// ─────────────────────────────────────────────
//  Helper: Campus Lost-and-Found DB Access
// ─────────────────────────────────────────────

/**
 * Returns the campushub_lost_found Mongoose db handle.
 * Centralised to avoid repeating getClient().db() across multiple routes.
 *
 * @returns {import('mongoose').mongo.Db}
 */
const getCampusDB = () =>
  mongoose.connection.getClient().db("campushub_lost_found");

/**
 * Fetches a document by string ID from the given collection.
 *
 * @param   {import('mongoose').mongo.Db} db
 * @param   {string} collectionName
 * @param   {string} id - String representation of a MongoDB ObjectId
 * @returns {Promise<object|null>}
 */
const findById = (db, collectionName, id) =>
  db.collection(collectionName).findOne({
    _id: new mongoose.Types.ObjectId(id),
  });

// ─────────────────────────────────────────────
//  Route: Health Check
// ─────────────────────────────────────────────

/**
 * GET /
 * Returns API status and a summary of available endpoints.
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Inventory Analysis API is running",
    version: "1.0.0",
    endpoints: {
      detection: {
        "GET  /detect":        "Run detection on all product images",
        "POST /detect/single": "Run detection on a single image URL",
      },
      products: {
        "GET  /api/products": "List all products",
        "POST /api/products": "Create a product",
      },
      lostAndFound: {
        "GET  /api/lost-found/matches":                    "List all AI matches (paginated)",
        "GET  /api/lost-found/analysis":                   "Campus-wide lost-and-found analysis",
        "GET  /api/matches/:lostId/:foundId/summary":      "AI summary for a matched pair",
        "PATCH /api/lost-found/matches/:matchId/status":   "Update match status",
        "POST /api/lost-found/compare/:lostId/:foundId":   "Compare lost vs found item",
        "POST /api/compare-images":                        "Compare two arbitrary image URLs",
      },
    },
  });
});

// ─────────────────────────────────────────────
//  Route Group: Roboflow Detection
// ─────────────────────────────────────────────

/**
 * GET /detect
 * Runs Roboflow object detection on every product image in the database.
 * Results are returned for all products; failed detections are included
 * with status "failed" so callers can see partial results.
 */
app.get("/detect", async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.json({ success: true, message: "No products found", results: [] });
    }

    // Run detections sequentially to avoid hammering the Roboflow API
    const results = [];
    for (const product of products) {
      const detection = await detectImageObjects(product.imageUrl);

      if (detection.success) {
        results.push({
          _id:          product._id,
          name:         product.name,
          imageUrl:     product.imageUrl,
          predictions:  detection.predictions,
          modelVersion: ROBOFLOW_MODEL_VERSION,
          status:       "success",
        });
      } else {
        results.push({
          _id:      product._id,
          name:     product.name,
          imageUrl: product.imageUrl,
          error:    detection.error,
          status:   "failed",
        });
      }
    }

    res.json({ success: true, total: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /detect/single
 * Runs Roboflow object detection on a single image URL provided in the request body.
 *
 * @body {string} imageUrl - Publicly accessible URL of the image to analyse
 */
app.post("/detect/single", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: "imageUrl is required" });
    }

    const detection = await detectImageObjects(imageUrl);

    if (!detection.success) {
      return res.status(500).json({ success: false, error: detection.error });
    }

    res.json({
      success:      true,
      imageUrl,
      projectId:    ROBOFLOW_PROJECT_ID,
      modelVersion: ROBOFLOW_MODEL_VERSION,
      predictions:  detection.predictions,
      detectedAt:   new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
//  Route Group: Product CRUD (inline fallback)
//  NOTE: These duplicate routes in inventoryRoutes.
//  Consider removing them once the router is confirmed stable.
// ─────────────────────────────────────────────

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
//  Route Group: Gemini AI — Lost-and-Found
// ─────────────────────────────────────────────

/**
 * GET /api/matches/:lostId/:foundId/summary
 * Generates an AI-written match summary for a paired lost and found item.
 *
 * @param {string} lostId      - MongoDB ObjectId of the lost item
 * @param {string} foundId     - MongoDB ObjectId of the found item
 * @query {number} [confidence=0.8] - Match confidence score (0–1)
 */
app.get("/api/matches/:lostId/:foundId/summary", async (req, res) => {
  try {
    const { lostId, foundId } = req.params;
    const confidence = parseFloat(req.query.confidence) || 0.8;

    const db        = getCampusDB();
    const lostItem  = await findById(db, "lostitems",  lostId);
    const foundItem = await findById(db, "founditems", foundId);

    if (!lostItem || !foundItem) {
      return res.status(404).json({ success: false, error: "One or both items not found" });
    }

    const result = await generateMatchSummary(lostItem, foundItem, confidence);

    res.json({
      success:         result.success,
      lostItemId:      lostId,
      foundItemId:     foundId,
      matchConfidence: confidence,
      summary:         result.summary,
      error:           result.error  || null,
      generatedAt:     result.generatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/lost-found/analysis
 * Generates a campus-wide summary of lost-and-found activity using Gemini AI.
 */
app.get("/api/lost-found/analysis", async (req, res) => {
  try {
    const db = getCampusDB();

    // Fetch counts and a sample in parallel for efficiency
    const [lostCount, foundCount, matchCount, sampleItems] = await Promise.all([
      db.collection("lostitems").countDocuments({}),
      db.collection("founditems").countDocuments({}),
      db.collection("aimatchlogs").countDocuments({}),
      db.collection("lostitems").find({}).limit(5).toArray(),
    ]);

    const result = await generateCampusLostFoundAnalysis(
      lostCount, foundCount, matchCount, sampleItems
    );

    res.json({
      success:     result.success,
      analysis:    result.analysis,
      statistics:  result.stats,
      error:       result.error || null,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/lost-found/matches
 * Returns paginated AI match logs, optionally filtered by status.
 *
 * @query {number} [page=1]
 * @query {number} [limit=10]
 * @query {string} [status]   - "pending_review" | "accepted" | "rejected"
 */
app.get("/api/lost-found/matches", async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const { status } = req.query;

    const db     = getCampusDB();
    const filter = status ? { status } : {};
    const skip   = (page - 1) * limit;

    // Run count and fetch in parallel
    const [matches, total] = await Promise.all([
      db.collection("aimatchlogs").find(filter).skip(skip).limit(limit).toArray(),
      db.collection("aimatchlogs").countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/lost-found/matches/:matchId/status
 * Updates the review status of an AI match log entry.
 *
 * @param {string} matchId   - MongoDB ObjectId of the match log
 * @body  {string} status    - One of: "pending_review" | "accepted" | "rejected"
 * @body  {string} [notes]   - Optional reviewer notes
 */
app.patch("/api/lost-found/matches/:matchId/status", async (req, res) => {
  try {
    const { matchId }     = req.params;
    const { status, notes = "" } = req.body;

    const VALID_STATUSES = ["pending_review", "accepted", "rejected"];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error:   `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const db     = getCampusDB();
    const result = await db.collection("aimatchlogs").updateOne(
      { _id: new mongoose.Types.ObjectId(matchId) },
      { $set: { status, notes, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Match not found" });
    }

    res.json({
      success: true,
      message: `Match status updated to "${status}"`,
      matchId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/compare-images
 * Detects objects in two arbitrary image URLs, then uses Gemini AI to compare them.
 *
 * @body {string} image1Url  - First image URL
 * @body {string} image2Url  - Second image URL
 * @body {string} [image1Name="Image 1"]
 * @body {string} [image2Name="Image 2"]
 */
app.post("/api/compare-images", async (req, res) => {
  try {
    const {
      image1Url,
      image2Url,
      image1Name = "Image 1",
      image2Name = "Image 2",
    } = req.body;

    if (!image1Url || !image2Url) {
      return res.status(400).json({
        success: false,
        error:   "Both image1Url and image2Url are required",
      });
    }

    console.log(`\n🔍 Comparing: "${image1Name}" vs "${image2Name}"`);

    // Run both detections concurrently
    console.log("   📸 Running Roboflow detection on both images...");
    const [detections1, detections2] = await Promise.all([
      detectImageObjects(image1Url),
      detectImageObjects(image2Url),
    ]);

    if (!detections1.success || !detections2.success) {
      return res.status(500).json({
        success: false,
        error:   "Object detection failed for one or both images",
        details: {
          image1Error: detections1.error || null,
          image2Error: detections2.error || null,
        },
      });
    }

    console.log("   🤖 Running Gemini AI comparison...");
    const comparison = await compareImagesWithDetections(
      { url: image1Url, detections: detections1, metadata: { name: image1Name, description: "First image"  } },
      { url: image2Url, detections: detections2, metadata: { name: image2Name, description: "Second image" } }
    );

    res.json({
      success:          comparison.success,
      image1:           { name: image1Name, url: image1Url, detections: detections1.predictions },
      image2:           { name: image2Name, url: image2Url, detections: detections2.predictions },
      analysis:         comparison.analysis,
      matchConfidence:  comparison.matchConfidence,
      visualSimilarity: comparison.visualSimilarity,
      generatedAt:      comparison.generatedAt,
    });
  } catch (error) {
    console.error("Image comparison error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/lost-found/compare/:lostId/:foundId
 * Fetches a lost item and a found item from MongoDB, runs Roboflow detection
 * on both images, uses Gemini AI to compare them, and persists the result
 * to the aimatchlogs collection.
 *
 * @param {string} lostId   - MongoDB ObjectId of the lost item
 * @param {string} foundId  - MongoDB ObjectId of the found item
 */
app.post("/api/lost-found/compare/:lostId/:foundId", async (req, res) => {
  try {
    const { lostId, foundId } = req.params;
    const db = getCampusDB();

    // Step 1: Fetch both items
    console.log("\n📋 Fetching items from MongoDB...");
    const [lostItem, foundItem] = await Promise.all([
      findById(db, "lostitems",  lostId),
      findById(db, "founditems", foundId),
    ]);

    if (!lostItem || !foundItem) {
      return res.status(404).json({
        success: false,
        error:   "One or both items not found",
        missing: { lostItem: !lostItem, foundItem: !foundItem },
      });
    }

    if (!lostItem.imageUrl || !foundItem.imageUrl) {
      return res.status(400).json({
        success: false,
        error:   "Both items must have image URLs for comparison",
      });
    }

    console.log(`   ✓ Lost item:  "${lostItem.objectType}"`);
    console.log(`   ✓ Found item: "${foundItem.objectType}"`);

    // Step 2: Run detections concurrently
    console.log("   📸 Running Roboflow detection on both images...");
    const [lostDetections, foundDetections] = await Promise.all([
      detectImageObjects(lostItem.imageUrl),
      detectImageObjects(foundItem.imageUrl),
    ]);

    if (!lostDetections.success || !foundDetections.success) {
      return res.status(500).json({
        success: false,
        error:   "Object detection failed for one or both images",
        details: {
          lostError:  lostDetections.error  || null,
          foundError: foundDetections.error || null,
        },
      });
    }

    // Step 3: Gemini AI comparison
    console.log("   🤖 Running Gemini AI comparison...");
    const comparison = await compareImagesWithDetections(
      {
        url:        lostItem.imageUrl,
        detections: lostDetections,
        metadata: {
          name:        `Lost: ${lostItem.objectType}`,
          description: lostItem.description,
          type:        "lost",
          location:    lostItem.location,
          date:        lostItem.date,
        },
      },
      {
        url:        foundItem.imageUrl,
        detections: foundDetections,
        metadata: {
          name:        `Found: ${foundItem.objectType}`,
          description: foundItem.description,
          type:        "found",
          location:    foundItem.location,
          date:        foundItem.date,
        },
      }
    );

    // Step 4: Persist match result to aimatchlogs
    const matchRecord = {
      lostItemId:      new mongoose.Types.ObjectId(lostId),
      foundItemId:     new mongoose.Types.ObjectId(foundId),
      lostItemName:    lostItem.objectType,
      foundItemName:   foundItem.objectType,
      confidence:      comparison.matchConfidence,
      similarity:      comparison.visualSimilarity,
      analysis:        comparison.analysis,
      // Auto-flag high-confidence matches for human review
      status:          comparison.matchConfidence > 70 ? "pending_review" : "low_confidence",
      lostDetections:  lostDetections.predictions,
      foundDetections: foundDetections.predictions,
      timestamp:       new Date(),
    };

    await db.collection("aimatchlogs").insertOne(matchRecord);
    console.log("   ✅ Match result saved to aimatchlogs");

    res.json({
      success:  true,
      lostItem: {
        id:          lostId,
        objectType:  lostItem.objectType,
        description: lostItem.description,
        location:    lostItem.location,
        date:        lostItem.date,
        detections:  lostDetections.predictions,
      },
      foundItem: {
        id:          foundId,
        objectType:  foundItem.objectType,
        description: foundItem.description,
        location:    foundItem.location,
        date:        foundItem.date,
        detections:  foundDetections.predictions,
      },
      analysis:         comparison.analysis,
      matchConfidence:  comparison.matchConfidence,
      visualSimilarity: comparison.visualSimilarity,
      matchSaved:       true,
      matchId:          matchRecord._id,
      generatedAt:      comparison.generatedAt,
    });
  } catch (error) {
    console.error("Lost-found comparison error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
//  Error Handling  (must be last)
// ─────────────────────────────────────────────

app.use(notFound);      // 404 for any unmatched route
app.use(errorHandler);  // Global error handler for next(err) calls

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  console.log(`\n🚀 Server running on ${base}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}\n`);
  console.log("📋 Available Endpoints:\n");
  console.log("  Detection:");
  console.log(`    GET  ${base}/detect`);
  console.log(`    POST ${base}/detect/single\n`);
  console.log("  Products:");
  console.log(`    GET  ${base}/api/products`);
  console.log(`    POST ${base}/api/products\n`);
  console.log("  Lost & Found:");
  console.log(`    GET   ${base}/api/lost-found/matches`);
  console.log(`    GET   ${base}/api/lost-found/analysis`);
  console.log(`    GET   ${base}/api/matches/:lostId/:foundId/summary`);
  console.log(`    PATCH ${base}/api/lost-found/matches/:matchId/status`);
  console.log(`    POST  ${base}/api/lost-found/compare/:lostId/:foundId`);
  console.log(`    POST  ${base}/api/compare-images\n`);
});

module.exports = app;
