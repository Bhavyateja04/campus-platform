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
 * Add a new product
 */
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
  analyzeProduct,
  batchAnalyze,
  analyzeAll,
};
