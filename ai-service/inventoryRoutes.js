const express = require("express");
const router = express.Router();
const {
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
} = require("./inventoryController");

// ─── Product CRUD Routes ───────────────────────────────────────────────────
// GET  /api/products           → List all products (supports ?category=&page=&limit=)
// GET  /api/products/:id       → Get single product
// POST /api/products           → Create a new product

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);

// ─── Analysis Routes ──────────────────────────────────────────────────────
// GET  /api/analysis/all       → Analyze all products (up to ?limit=10)
// POST /api/analysis/batch     → Analyze specific products { productIds: [] }
// GET  /api/analysis/:id       → Full analysis for one product (?force=true to bypass cache)

router.get("/analysis/all", analyzeAll);
router.post("/analysis/batch", batchAnalyze);
router.get("/analysis/:id", analyzeProduct);

// ─── Category Validation Routes ────────────────────────────────────────────
// GET  /api/categories         → Get all available categories
// GET  /api/categories/:category → Get allowed objects for a specific category

router.get("/categories", getCategories);
router.get("/categories/:category", getCategoryDetails);

// ─── Validation Status Routes ──────────────────────────────────────────────
// GET  /api/products/validated/list     → Get all validated products
// GET  /api/products/unvalidated/list   → Get all unvalidated/rejected products

router.get("/products/validated/list", getValidatedProducts);
router.get("/products/unvalidated/list", getUnvalidatedProducts);

module.exports = router;
