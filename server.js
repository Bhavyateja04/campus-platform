require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const connectDB = require("./db");
const Product = require("./Product");
const { errorHandler, notFound } = require("./errorMiddleware");
const {
  generateMatchSummary,
  generateCampusLostFoundAnalysis,
  compareImagesWithDetections,
} = require("./geminiService");
const inventoryRoutes = require("./inventoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Inventory Analysis Routes ────────────────────────────────────────────
app.use("/api", inventoryRoutes);

// ─── Roboflow Config ──────────────────────────────────────────────────────
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_PROJECT_ID = process.env.ROBOFLOW_PROJECT_ID;
const ROBOFLOW_MODEL_VERSION = process.env.ROBOFLOW_MODEL_VERSION || 1;
const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW_NAME = process.env.ROBOFLOW_WORKFLOW_NAME;

// ─── Roboflow Detection Helper ─────────────────────────────────────────────
/**
 * Detect objects in an image using Roboflow Serverless Workflows API
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Object} Detection results
 */
const detectImageObjects = async (imageUrl) => {
  try {
    const response = await axios.post(
      `https://serverless.roboflow.com/${ROBOFLOW_WORKSPACE}/workflows/${ROBOFLOW_WORKFLOW_NAME}`,
      {
        api_key: ROBOFLOW_API_KEY,
        inputs: {
          image: {
            type: "url",
            value: imageUrl,
          },
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    return {
      success: true,
      predictions: response.data.predictions || [],
      raw: response.data,
    };
  } catch (error) {
    console.error("Roboflow detection error:", error.message);
    return {
      success: false,
      error: error.message,
      predictions: [],
    };
  }
};

// ─── Health Check ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Inventory Analysis API is running",
    version: "1.0.0",
    endpoints: {
      detection: {
        "GET /detect": "Run detection on all images",
        "POST /detect/single": "Run detection on a single image URL",
      },
      products: {
        "GET /api/products": "List all products",
        "POST /api/products": "Create a product",
      },
    },
  });
});

// ─── Detection Endpoint ────────────────────────────────────────────────────
app.get("/detect", async (req, res) => {
  try {
    const images = await Product.find();
    
    if (images.length === 0) {
      return res.json({ success: true, message: "No images found", results: [] });
    }

    const results = [];

    for (let img of images) {
      try {
        const response = await axios({
          method: "POST",
          url: `https://serverless.roboflow.com/${process.env.ROBOFLOW_WORKSPACE}/workflows/${process.env.ROBOFLOW_WORKFLOW_NAME}`,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            api_key: ROBOFLOW_API_KEY,
            inputs: {
              "image": {"type": "url", "value": img.imageUrl}
            }
          },
        });

        results.push({
          _id: img._id,
          name: img.name,
          imageUrl: img.imageUrl,
          predictions: response.data.predictions || [],
          modelVersion: ROBOFLOW_MODEL_VERSION,
          status: "success",
        });
      } catch (error) {
        results.push({
          _id: img._id,
          name: img.name,
          imageUrl: img.imageUrl,
          error: error.message,
          status: "failed",
        });
      }
    }

    res.json({ success: true, total: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

// ─── Single Image Detection ────────────────────────────────────────────────
app.post("/detect/single", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: "imageUrl is required" });
    }

    const response = await axios({
      method: "POST",
      url: `https://serverless.roboflow.com/${process.env.ROBOFLOW_WORKSPACE}/workflows/${process.env.ROBOFLOW_WORKFLOW_NAME}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        api_key: ROBOFLOW_API_KEY,
        inputs: {
          "image": {"type": "url", "value": imageUrl}
        }
      },
    });

    res.json({
      success: true,
      imageUrl,
      projectId: ROBOFLOW_PROJECT_ID,
      modelVersion: ROBOFLOW_MODEL_VERSION,
      predictions: response.data.predictions || [],
      detectedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Product Routes ───────────────────────────────────────────────────────
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

// ─── Gemini AI Routes ──────────────────────────────────────────────────────

/**
 * GET /api/matches/:lostId/:foundId/summary
 * Generate AI summary for a matched lost and found item pair
 */
app.get("/api/matches/:lostId/:foundId/summary", async (req, res) => {
  try {
    const { lostId, foundId } = req.params;
    const { confidence = 0.8 } = req.query;

    // Get items from MongoDB
    const client = mongoose.connection.getClient();
    const db = client.db("campushub_lost_found");
    const lostItem = await db.collection("lostitems").findOne({
      _id: new mongoose.Types.ObjectId(lostId),
    });
    const foundItem = await db.collection("founditems").findOne({
      _id: new mongoose.Types.ObjectId(foundId),
    });

    if (!lostItem || !foundItem) {
      return res.status(404).json({ success: false, error: "Items not found" });
    }

    // Generate summary using Gemini
    const result = await generateMatchSummary(lostItem, foundItem, parseFloat(confidence));

    res.json({
      success: result.success,
      lostItemId: lostId,
      foundItemId: foundId,
      matchConfidence: parseFloat(confidence),
      summary: result.summary,
      error: result.error || null,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/lost-found/analysis
 * Generate comprehensive campus lost and found analysis
 */
app.get("/api/lost-found/analysis", async (req, res) => {
  try {
    // Connect to the correct database
    const client = mongoose.connection.getClient();
    const campusDB = client.db("campushub_lost_found");

    // Get statistics
    const lostCount = await campusDB.collection("lostitems").countDocuments({});
    const foundCount = await campusDB.collection("founditems").countDocuments({});
    const matchCount = await campusDB.collection("aimatchlogs").countDocuments({});

    // Get sample items for analysis
    const sampleItems = await campusDB
      .collection("lostitems")
      .find({})
      .limit(5)
      .toArray();

    // Generate analysis using Gemini
    const result = await generateCampusLostFoundAnalysis(
      lostCount,
      foundCount,
      matchCount,
      sampleItems
    );

    res.json({
      success: result.success,
      analysis: result.analysis,
      statistics: result.stats,
      error: result.error || null,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/lost-found/matches
 * Get all AI matches with pagination
 */
app.get("/api/lost-found/matches", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const client = mongoose.connection.getClient();
    const db = client.db("campushub_lost_found");
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = status ? { status } : {};
    const matches = await db
      .collection("aimatchlogs")
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("aimatchlogs").countDocuments(filter);

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      matches,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/lost-found/matches/:matchId/status
 * Update match status (pending_review, accepted, rejected)
 */
app.patch("/api/lost-found/matches/:matchId/status", async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending_review", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be: pending_review, accepted, or rejected",
      });
    }

    const client = mongoose.connection.getClient();
    const db = client.db("campushub_lost_found");
    const result = await db.collection("aimatchlogs").updateOne(
      { _id: new mongoose.Types.ObjectId(matchId) },
      {
        $set: {
          status,
          notes: notes || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Match not found" });
    }

    res.json({
      success: true,
      message: `Match status updated to ${status}`,
      matchId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/compare-images
 * Compare two images: detect objects and use Gemini for analysis
 */
app.post("/api/compare-images", async (req, res) => {
  try {
    const { image1Url, image2Url, image1Name = "Image 1", image2Name = "Image 2" } = req.body;

    if (!image1Url || !image2Url) {
      return res.status(400).json({
        success: false,
        error: "Both image1Url and image2Url are required",
      });
    }

    console.log(`\n🔍 Comparing images: ${image1Name} vs ${image2Name}`);

    // Run Roboflow detection on both images
    console.log("   📸 Running Roboflow detection on Image 1...");
    const detections1 = await detectImageObjects(image1Url);

    console.log("   📸 Running Roboflow detection on Image 2...");
    const detections2 = await detectImageObjects(image2Url);

    if (!detections1.success || !detections2.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to detect objects in one or both images",
        details: {
          image1Error: detections1.error || null,
          image2Error: detections2.error || null,
        },
      });
    }

    // Use Gemini to compare the detections
    console.log("   🤖 Using Gemini AI to compare detections...");
    const comparison = await compareImagesWithDetections(
      {
        url: image1Url,
        detections: detections1,
        metadata: { name: image1Name, description: "First image" },
      },
      {
        url: image2Url,
        detections: detections2,
        metadata: { name: image2Name, description: "Second image" },
      }
    );

    res.json({
      success: comparison.success,
      image1: {
        name: image1Name,
        url: image1Url,
        detections: detections1.predictions,
      },
      image2: {
        name: image2Name,
        url: image2Url,
        detections: detections2.predictions,
      },
      analysis: comparison.analysis,
      matchConfidence: comparison.matchConfidence,
      visualSimilarity: comparison.visualSimilarity,
      generatedAt: comparison.generatedAt,
    });
  } catch (error) {
    console.error("Image comparison endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/lost-found/compare/:lostId/:foundId
 * Compare a lost item with a found item from MongoDB
 */
app.post("/api/lost-found/compare/:lostId/:foundId", async (req, res) => {
  try {
    const { lostId, foundId } = req.params;

    // Fetch items from MongoDB
    const client = mongoose.connection.getClient();
    const db = client.db("campushub_lost_found");

    console.log(`\n📋 Fetching items from MongoDB...`);
    const lostItem = await db.collection("lostitems").findOne({
      _id: new mongoose.Types.ObjectId(lostId),
    });

    const foundItem = await db.collection("founditems").findOne({
      _id: new mongoose.Types.ObjectId(foundId),
    });

    if (!lostItem || !foundItem) {
      return res.status(404).json({
        success: false,
        error: "One or both items not found",
        missing: {
          lostItem: !lostItem,
          foundItem: !foundItem,
        },
      });
    }

    if (!lostItem.imageUrl || !foundItem.imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Both items must have image URLs for comparison",
      });
    }

    console.log(`   ✓ Found: Lost Item "${lostItem.objectType}"`);
    console.log(`   ✓ Found: Found Item "${foundItem.objectType}"`);

    // Detect objects in both images
    console.log("   📸 Running Roboflow detection on lost item image...");
    const lostDetections = await detectImageObjects(lostItem.imageUrl);

    console.log("   📸 Running Roboflow detection on found item image...");
    const foundDetections = await detectImageObjects(foundItem.imageUrl);

    if (!lostDetections.success || !foundDetections.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to detect objects in one or both images",
        details: {
          lostError: lostDetections.error || null,
          foundError: foundDetections.error || null,
        },
      });
    }

    // Use Gemini to compare
    console.log("   🤖 Using Gemini AI to compare items...");
    const comparison = await compareImagesWithDetections(
      {
        url: lostItem.imageUrl,
        detections: lostDetections,
        metadata: {
          name: `Lost: ${lostItem.objectType}`,
          description: lostItem.description,
          type: "lost",
          location: lostItem.location,
          date: lostItem.date,
        },
      },
      {
        url: foundItem.imageUrl,
        detections: foundDetections,
        metadata: {
          name: `Found: ${foundItem.objectType}`,
          description: foundItem.description,
          type: "found",
          location: foundItem.location,
          date: foundItem.date,
        },
      }
    );

    // Store result in MongoDB
    const matchRecord = {
      lostItemId: new mongoose.Types.ObjectId(lostId),
      foundItemId: new mongoose.Types.ObjectId(foundId),
      lostItemName: lostItem.objectType,
      foundItemName: foundItem.objectType,
      confidence: comparison.matchConfidence,
      similarity: comparison.visualSimilarity,
      analysis: comparison.analysis,
      status: comparison.matchConfidence > 70 ? "pending_review" : "low_confidence",
      lostDetections: lostDetections.predictions,
      foundDetections: foundDetections.predictions,
      timestamp: new Date(),
    };

    await db.collection("aimatchlogs").insertOne(matchRecord);
    console.log(`   ✅ Comparison saved to aimatchlogs`);

    res.json({
      success: true,
      lostItem: {
        id: lostId,
        objectType: lostItem.objectType,
        description: lostItem.description,
        location: lostItem.location,
        date: lostItem.date,
        detections: lostDetections.predictions,
      },
      foundItem: {
        id: foundId,
        objectType: foundItem.objectType,
        description: foundItem.description,
        location: foundItem.location,
        date: foundItem.date,
        detections: foundDetections.predictions,
      },
      analysis: comparison.analysis,
      matchConfidence: comparison.matchConfidence,
      visualSimilarity: comparison.visualSimilarity,
      matchSaved: true,
      matchId: matchRecord._id,
      generatedAt: comparison.generatedAt,
    });
  } catch (error) {
    console.error("Lost-found comparison error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Error Handling ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n📋 Available Endpoints:\n`);
  console.log(`  Image Detection:`);
  console.log(`    GET  http://localhost:${PORT}/detect`);
  console.log(`    POST http://localhost:${PORT}/detect/single\n`);
  console.log(`  Product Management:`);
  console.log(`    GET  http://localhost:${PORT}/api/products`);
  console.log(`    POST http://localhost:${PORT}/api/products\n`);
  console.log(`  Lost & Found Matching:`);
  console.log(`    GET  http://localhost:${PORT}/api/lost-found/matches`);
  console.log(`    GET  http://localhost:${PORT}/api/lost-found/analysis`);
  console.log(`    GET  http://localhost:${PORT}/api/matches/:lostId/:foundId/summary`);
  console.log(`    PATCH http://localhost:${PORT}/api/lost-found/matches/:matchId/status\n`);
});

module.exports = app;
