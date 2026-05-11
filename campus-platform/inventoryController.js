/**
 * @fileoverview Product controller — handles all product CRUD and AI analysis endpoints.
 *
 * Routes handled:
 *   GET    /api/products          → getAllProducts
 *   GET    /api/products/:id      → getProductById
 *   POST   /api/products          → createProduct
 *   GET    /api/analysis/:id      → analyzeProduct
 *   POST   /api/analysis/batch    → batchAnalyze
 *   GET    /api/analysis/all      → analyzeAll
 */

const Product = require("./Product");
const { detectObjects, findSimilarImages, formatDetections } = require("./roboflowService");
const { generateInventorySummary, generateBatchSummary }     = require("./localSummaryService");

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

/** How long a cached analysis result is considered valid (1 hour) */
const CACHE_DURATION_MS = 60 * 60 * 1000;

// ─────────────────────────────────────────────
//  Helper Functions
// ─────────────────────────────────────────────

/**
 * Checks whether a product's cached analysis is still fresh.
 *
 * @param   {object}  analysisCache - The product's analysisCache field
 * @param   {boolean} forceRefresh  - If true, always treats cache as stale
 * @returns {boolean} True if the cache is valid and can be returned as-is
 */
const isCacheValid = (analysisCache, forceRefresh) => {
  if (forceRefresh || !analysisCache?.summary || !analysisCache?.cachedAt) return false;

  const cacheAgeMs = Date.now() - new Date(analysisCache.cachedAt).getTime();
  return cacheAgeMs < CACHE_DURATION_MS;
};

/**
 * Returns a sanitized product object safe for API responses.
 * Strips internal fields not needed by consumers.
 *
 * @param   {object} product - Mongoose Product document
 * @returns {object} Lean product payload
 */
const toProductPayload = (product) => ({
  _id:         product._id,
  name:        product.name,
  sku:         product.sku,
  category:    product.category,
  description: product.description,
  imageUrl:    product.imageUrl,
  metadata:    product.metadata,
});

/**
 * Runs Roboflow object detection and similar-image search for one product.
 *
 * @param   {object} product - Mongoose Product document
 * @returns {Promise<{ detections: object, similarProducts: string[], rawDetections: object }>}
 */
const runDetection = async (product) => {
  console.log(`🔍 Detecting objects for: ${product.name}`);
  const rawDetections = await detectObjects(product.imageUrl);
  const detections    = formatDetections(rawDetections.predictions);

  console.log(`🔗 Finding similar images for: ${product.name}`);
  const similarResult   = await findSimilarImages(product.imageUrl);
  const similarProducts = similarResult.similar.map((s) => s.name || s.image_id || "Unknown");

  return { detections, similarProducts, rawDetections };
};

/**
 * Runs Roboflow detection only (no similar-image search) for batch operations.
 *
 * @param   {object} product - Mongoose Product document
 * @returns {Promise<{ ...productObject, detections: object }>}
 */
const runBatchDetection = async (product) => {
  const rawDetections = await detectObjects(product.imageUrl);
  const detections    = formatDetections(rawDetections.predictions);
  return { ...product.toObject(), detections };
};

/**
 * Formats batch analysis results into the standard API response shape.
 *
 * @param   {Array}  analysisResults - Array of products with detections attached
 * @param   {object} batchSummary    - Result from generateBatchSummary()
 * @returns {object} Response-ready payload
 */
const toBatchResponse = (analysisResults, batchSummary) => ({
  success:      true,
  productCount: analysisResults.length,
  products:     analysisResults.map((p) => ({
    _id:        p._id,
    name:       p.name,
    sku:        p.sku,
    imageUrl:   p.imageUrl,
    detections: p.detections,
  })),
  batchSummary: batchSummary.batchSummary,
  generatedAt:  batchSummary.generatedAt,
});

// ─────────────────────────────────────────────
//  Controllers
// ─────────────────────────────────────────────

/**
 * GET /api/products
 * Returns a paginated list of products, optionally filtered by category.
 *
 * @query {string} [category]  - Filter by product category
 * @query {number} [page=1]    - Page number (1-indexed)
 * @query {number} [limit=20]  - Results per page
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = category ? { category } : {};
    const skip   = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("-imageBase64")   // Exclude heavy base64 field from responses
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page:    parseInt(page),
      limit:   parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/products/:id
 * Returns a single product by its MongoDB ObjectId.
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/products
 * Creates and persists a new product from the request body.
 */
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    // 400 for validation/schema errors
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analysis/:id
 * Full AI analysis pipeline for a single product:
 *   1. Return cached result if still fresh (unless ?force=true)
 *   2. Roboflow object detection
 *   3. Roboflow similar-image search
 *   4. AI summary generation
 *   5. Persist results to MongoDB cache
 *
 * @query {string} [force] - Set to "true" to bypass the cache
 */
const analyzeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const forceRefresh = req.query.force === "true";

    // ── Return cached result if still valid ──────────────
    if (isCacheValid(product.analysisCache, forceRefresh)) {
      console.log(`Returning cached analysis for: ${product._id}`);
      return res.json({
        success:         true,
        cached:          true,
        product:         toProductPayload(product),
        detections:      product.analysisCache.detections,
        similarProducts: product.analysisCache.similarProducts,
        summary:         product.analysisCache.summary,
        cachedAt:        product.analysisCache.cachedAt,
      });
    }

    // ── Run full detection pipeline ──────────────────────
    const { detections, similarProducts, rawDetections } = await runDetection(product);

    // ── Generate AI summary ──────────────────────────────
    console.log(`🤖 Generating AI summary for: ${product.name}`);
    const summaryResult = await generateInventorySummary(product, detections, similarProducts);

    // ── Persist results to cache ─────────────────────────
    product.analysisCache = {
      detections,
      summary:         summaryResult.summary,
      similarProducts,
      cachedAt:        new Date(),
    };
    product.lastAnalyzed = new Date();
    await product.save();

    res.json({
      success:         true,
      cached:          false,
      product:         toProductPayload(product),
      detections,
      roboflowRaw:     rawDetections,
      similarProducts,
      summary:         summaryResult.summary,
      analyzedAt:      new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analysis/batch
 * Runs object detection on a specific list of products in parallel,
 * then generates a combined AI batch summary.
 *
 * @body {string[]} productIds - Array of MongoDB ObjectIds to analyse
 */
const batchAnalyze = async (req, res) => {
  try {
    const { productIds } = req.body;

    // Validate input before hitting the database
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error:   "Request body must include a non-empty 'productIds' array",
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return res.status(404).json({ success: false, error: "No matching products found" });
    }

    // Run all detections concurrently for performance
    console.log(`🔍 Running batch detection for ${products.length} products...`);
    const analysisResults = await Promise.all(products.map(runBatchDetection));

    const batchSummary = await generateBatchSummary(analysisResults);

    res.json(toBatchResponse(analysisResults, batchSummary));
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analysis/all
 * Analyses all products in the database up to a configurable limit.
 * ⚠️  Use with caution on large datasets — each product triggers external API calls.
 *
 * @query {number} [limit=10] - Maximum number of products to analyse
 */
const analyzeAll = async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 10;
    const products = await Product.find({}).limit(limit);

    if (products.length === 0) {
      return res.json({ success: true, message: "No products found in the database." });
    }

    console.log(`🔍 Running detection for all ${products.length} products (limit: ${limit})...`);
    const analysisResults = await Promise.all(products.map(runBatchDetection));

    const batchSummary = await generateBatchSummary(analysisResults);

    res.json(toBatchResponse(analysisResults, batchSummary));
  } catch (error) {
    console.error("Analyse-all error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  analyzeProduct,
  batchAnalyze,
  analyzeAll,
};
