const Product = require("./Product");
const {
  detectObjects,
  findSimilarImages,
  formatDetections,
} = require("./roboflowService");
const {
  generateInventorySummary,
  generateBatchSummary,
} = require("./localSummaryService");
const {
  validateProductImage,
  validateCategory,
  getAvailableCategories,
  CONFIDENCE_THRESHOLD,
} = require("./utils/categoryValidation");

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * GET /api/products
 * Fetch all products from MongoDB
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = category ? { category } : {};

    const products = await Product.find(filter)
      .select("-imageBase64") // Exclude heavy base64 fields
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/products/:id
 * Fetch single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/products
 * Add a new product with STRICT AI-based image validation
 * 
 * Validation Pipeline:
 * ├─ 1️⃣ IMAGE QUALITY CHECK
 * │   ├─ Detect if image is blurry
 * │   ├─ Verify detection confidence (≥70%)
 * │   └─ Ensure objects are detected
 * ├─ 2️⃣ CONTENT FILTERING
 * │   ├─ Reject animals, nature, food items
 * │   ├─ Reject selfies and personal photos
 * │   └─ Block non-college level objects
 * └─ 3️⃣ CATEGORY VALIDATION
 *     ├─ Match detected objects to category
 *     └─ Ensure at least 1 object matches
 * 
 * Request body:
 * {
 *   "name": "Product Name",
 *   "sku": "SKU-001",
 *   "category": "Electronics",
 *   "description": "Optional description",
 *   "imageUrl": "https://example.com/image.jpg"
 * }
 * 
 * Success Response (201):
 * {
 *   "success": true,
 *   "message": "Product validated and stored successfully",
 *   "product": { ... }
 * }
 * 
 * Failure Response (400/500):
 * {
 *   "success": false,
 *   "message": "Reason for rejection",
 *   "stage": "QUALITY|CONTENT|CATEGORY",
 *   "details": { ... }
 * }
 */
const createProduct = async (req, res) => {
  try {
    const { name, sku, category, description, imageUrl, imageBase64, metadata } =
      req.body;

    // ─────────────────────────────────────────────────────────────────────
    // INPUT VALIDATION
    // ─────────────────────────────────────────────────────────────────────
    if (!name || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, category, imageUrl",
        supportedCategories: getAvailableCategories(),
      });
    }

    console.log(
      `\n${"=".repeat(70)}\n📦 NEW PRODUCT CREATION REQUEST\n${"=".repeat(70)}`
    );
    console.log(`  Product: "${name}"`);
    console.log(`  Category: "${category}"`);
    console.log(`  Image: ${imageUrl.substring(0, 60)}...`);

    // ─────────────────────────────────────────────────────────────────────
    // ROBOFLOW DETECTION
    // ─────────────────────────────────────────────────────────────────────
    console.log(`\n🔍 STEP 1: Detecting objects in image...`);
    const detectionResult = await detectObjects(imageUrl);

    if (!detectionResult.success) {
      console.error(`❌ Detection failed: ${detectionResult.error}`);
      return res.status(500).json({
        success: false,
        message: "Image detection failed. Ensure the image URL is valid and accessible.",
        error: detectionResult.error,
        stage: "ROBOFLOW_DETECTION",
      });
    }

    const predictions = detectionResult.predictions || [];
    console.log(
      `✓ Detected ${predictions.length} object(s): ${
        predictions.length > 0
          ? predictions
              .map(
                (p) =>
                  `${p.class} (${(p.confidence * 100).toFixed(1)}% confidence)`
              )
              .join(", ")
          : "none"
      }`
    );

    // ─────────────────────────────────────────────────────────────────────
    // COMPLETE IMAGE VALIDATION PIPELINE
    // ─────────────────────────────────────────────────────────────────────
    console.log(`\n✅ STEP 2: Running complete validation pipeline...`);
    const fullValidation = validateProductImage(category, predictions);

    // Handle validation failure
    if (!fullValidation.success) {
      console.error(
        `\n❌ VALIDATION FAILED at stage: ${fullValidation.stage}`
      );
      console.error(`   Reason: ${fullValidation.reason}`);
      console.error(
        `   Message: ${fullValidation.message}`
      );

      return res.status(400).json({
        success: false,
        message: fullValidation.message,
        reason: fullValidation.reason,
        stage: fullValidation.stage,
        validationDetails: fullValidation.details,
        supportedCategories: getAvailableCategories(),
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // VALIDATION PASSED: CREATE & SAVE PRODUCT
    // ─────────────────────────────────────────────────────────────────────
    console.log(`\n✅ VALIDATION PASSED! Creating product document...`);
    const product = new Product({
      name: name.trim(),
      sku: sku ? sku.trim() : undefined,
      category: category.trim(),
      description: description ? description.trim() : undefined,
      imageUrl,
      imageBase64: imageBase64 || undefined,
      metadata: metadata || {},
      isValidated: true,
      validationDetails: {
        validated: true,
        detectedObjects: fullValidation.data.detectedObjects,
        matchedObjects: fullValidation.data.matchedObjects,
        validationMessage: fullValidation.message,
        validationTimestamp: new Date(),
        categoryAllowedObjects: getAvailableCategories(),
      },
    });

    // Save to MongoDB
    await product.save();
    console.log(`✅ Product saved successfully to MongoDB!`);
    console.log(`   Product ID: ${product._id}`);
    console.log(`   Matched Objects: ${fullValidation.data.matchedObjects.join(", ")}`);
    console.log(
      `\n${"=".repeat(70)}\n✅ PRODUCT CREATION SUCCESSFUL\n${"=".repeat(
        70
      )}\n`
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: "✓ Product validated and stored successfully",
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        metadata: product.metadata,
        isValidated: product.isValidated,
        createdAt: product.createdAt,
      },
      validation: {
        stage: "COMPLETE",
        message: fullValidation.message,
        detectedObjects: fullValidation.data.detectedObjects,
        matchedObjects: fullValidation.data.matchedObjects,
        confidence: fullValidation.data.confidence,
      },
    });
  } catch (error) {
    console.error(`\n❌ FATAL ERROR: ${error.message}`);
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during product creation",
      error: error.message,
      stage: "SERVER_ERROR",
    });
  }
};

/**
 * GET /api/categories
 * Get all available product categories for validation
 * Useful for frontend dropdown/selection UI
 */
const getCategories = async (req, res) => {
  try {
    const categories = getAvailableCategories();
    res.json({
      success: true,
      message: "Available product categories",
      categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * GET /api/categories/:category
 * Get allowed objects for a specific category
 */
const getCategoryDetails = async (req, res) => {
  try {
    const { category } = req.params;
    const {
      validateCategory: validateCat,
      getAllowedObjectsForCategory,
    } = require("./utils/categoryValidation");

    const allowedObjects = getAllowedObjectsForCategory(category);

    if (!allowedObjects || allowedObjects.length === 0) {
      const availableCategories = getAvailableCategories();
      return res.status(404).json({
        success: false,
        message: `Category "${category}" not found`,
        availableCategories,
      });
    }

    res.json({
      success: true,
      category,
      allowedObjects,
      count: allowedObjects.length,
      confidenceThreshold: CONFIDENCE_THRESHOLD,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category details",
      error: error.message,
    });
  }
};

/**
 * GET /api/products/validated/list
 * Get all validated products
 */
const getValidatedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({ isValidated: true })
      .select("-imageBase64")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ isValidated: true });

    res.json({
      success: true,
      message: "Validated products",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch validated products",
      error: error.message,
    });
  }
};

/**
 * GET /api/products/unvalidated/list
 * Get all unvalidated products (rejected during creation)
 */
const getUnvalidatedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({ isValidated: false })
      .select("-imageBase64")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ isValidated: false });

    res.json({
      success: true,
      message: "Unvalidated products",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch unvalidated products",
      error: error.message,
    });
  }
};

/**
 * GET /api/analysis/:id
 * Full analysis: Fetch product → Roboflow detection → Gemini summary
 */
const analyzeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    // Check cache (skip if force=true query param)
    const forceRefresh = req.query.force === "true";
    const cacheAge = product.analysisCache?.cachedAt
      ? Date.now() - new Date(product.analysisCache.cachedAt).getTime()
      : Infinity;

    if (!forceRefresh && cacheAge < CACHE_DURATION_MS && product.analysisCache?.summary) {
      console.log(`Returning cached analysis for product: ${product._id}`);
      return res.json({
        success: true,
        cached: true,
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          metadata: product.metadata,
        },
        detections: product.analysisCache.detections,
        similarProducts: product.analysisCache.similarProducts,
        summary: product.analysisCache.summary,
        cachedAt: product.analysisCache.cachedAt,
      });
    }

    // Step 1: Roboflow – Detect objects in image
    console.log(`🔍 Running Roboflow detection for: ${product.name}`);
    const rawDetections = await detectObjects(product.imageUrl);
    const detections = formatDetections(rawDetections.predictions);

    // Step 2: Roboflow – Find similar images
    console.log(`🔗 Finding similar images for: ${product.name}`);
    const similarResult = await findSimilarImages(product.imageUrl);
    const similarProducts = similarResult.similar.map(
      (s) => s.name || s.image_id || "Unknown"
    );

    // Step 3: Gemini – Generate summary
    console.log(`🤖 Generating Gemini summary for: ${product.name}`);
    const summaryResult = await generateInventorySummary(
      product,
      detections,
      similarProducts
    );

    // Step 4: Cache results in MongoDB
    product.analysisCache = {
      detections,
      summary: summaryResult.summary,
      similarProducts,
      cachedAt: new Date(),
    };
    product.lastAnalyzed = new Date();
    await product.save();

    res.json({
      success: true,
      cached: false,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        metadata: product.metadata,
      },
      detections,
      roboflowRaw: rawDetections,
      similarProducts,
      summary: summaryResult.summary,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analysis/batch
 * Analyze multiple products and return a combined report
 * Body: { productIds: ["id1", "id2", ...] }
 */
const batchAnalyze = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, error: "Provide an array of productIds" });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({ success: false, error: "No products found" });
    }

    // Run detections for all products in parallel
    console.log(`🔍 Running batch analysis for ${products.length} products...`);
    const analysisResults = await Promise.all(
      products.map(async (product) => {
        const rawDetections = await detectObjects(product.imageUrl);
        const detections = formatDetections(rawDetections.predictions);
        return { ...product.toObject(), detections };
      })
    );

    // Generate batch summary with Gemini
    const batchSummary = await generateBatchSummary(analysisResults);

    res.json({
      success: true,
      productCount: products.length,
      products: analysisResults.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        imageUrl: p.imageUrl,
        detections: p.detections,
      })),
      batchSummary: batchSummary.batchSummary,
      generatedAt: batchSummary.generatedAt,
    });
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analysis/all
 * Analyze ALL products in the DB (use carefully on large DBs)
 */
const analyzeAll = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({}).limit(limit);

    if (products.length === 0) {
      return res.json({ success: true, message: "No products found in the database." });
    }

    const analysisResults = await Promise.all(
      products.map(async (product) => {
        const rawDetections = await detectObjects(product.imageUrl);
        const detections = formatDetections(rawDetections.predictions);
        return { ...product.toObject(), detections };
      })
    );

    const batchSummary = await generateBatchSummary(analysisResults);

    res.json({
      success: true,
      productCount: products.length,
      products: analysisResults.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        imageUrl: p.imageUrl,
        detections: p.detections,
      })),
      batchSummary: batchSummary.batchSummary,
      generatedAt: batchSummary.generatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  getCategories,
  getCategoryDetails,
  getValidatedProducts,
  getUnvalidatedProducts,
  analyzeProduct,
  batchAnalyze,
  analyzeAll,
};
