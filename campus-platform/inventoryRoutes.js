/**
 * @fileoverview API route definitions for the inventory system.
 * All routes are prefixed with /api (mounted in app.js / server.js).
 *
 * Product CRUD:
 *   GET    /api/products            → List all products  (?category= &page= &limit=)
 *   GET    /api/products/:id        → Get a single product by ID
 *   POST   /api/products            → Create a new product
 *
 * AI Analysis:
 *   GET    /api/analysis/all        → Analyse all products       (?limit=10)
 *   POST   /api/analysis/batch      → Analyse a set of products  ({ productIds: [] })
 *   GET    /api/analysis/:id        → Full analysis for one product (?force=true bypasses cache)
 *
 * ⚠️  Order matters: /analysis/all and /analysis/batch MUST be registered
 *     before /analysis/:id, otherwise Express matches "all" and "batch"
 *     as dynamic :id values.
 */

const express = require("express");
const router  = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  analyzeProduct,
  batchAnalyze,
  analyzeAll,
} = require("./inventoryController");

// ─────────────────────────────────────────────
//  Product CRUD Routes
// ─────────────────────────────────────────────

router.get("/products",     getAllProducts);   // List all (paginated, filterable)
router.get("/products/:id", getProductById);  // Single product by ID
router.post("/products",    createProduct);   // Create new product

// ─────────────────────────────────────────────
//  AI Analysis Routes
// ─────────────────────────────────────────────

router.get("/analysis/all",     analyzeAll);     // Analyse all (use ?limit to cap)
router.post("/analysis/batch",  batchAnalyze);   // Analyse a selected set
router.get("/analysis/:id",     analyzeProduct); // Analyse one product by ID

// ─────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────

module.exports = router;
