/**
 * @fileoverview Duplicate image detection and category grouping utility.
 * Connects to MongoDB, scans all products, and reports:
 *   - Images shared across multiple products (duplicates)
 *   - Products grouped by category
 *
 * Usage: node checkDuplicates.js
 */

require("dotenv").config(); // Load environment variables from .env

const mongoose = require("mongoose");
const Product  = require("./Product");

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

/** MongoDB connection URI — always use env vars, never hardcode credentials */
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_db";

const SEPARATOR = "═".repeat(85);

// ─────────────────────────────────────────────
//  Helper: Group products by a key field
// ─────────────────────────────────────────────

/**
 * Groups an array of products into a Map keyed by a field value.
 * Each map value is an array of simplified product records.
 *
 * @param {Array}  products - Array of Mongoose Product documents
 * @param {string} keyField - The product field to group by (e.g. "imageUrl", "category")
 * @returns {Map<string, Array>}
 */
const groupProductsBy = (products, keyField) => {
  const map = new Map();

  products.forEach((product) => {
    const key = product[keyField] || "Unknown";

    if (!map.has(key)) map.set(key, []);

    map.get(key).push({
      name:       product.name,
      sku:        product.sku,
      category:   product.category,
      price:      product.metadata?.price      ?? "N/A",
      stock:      product.metadata?.stock      ?? "N/A",
      detections: product.analysisCache?.detections?.count || 0,
    });
  });

  return map;
};

// ─────────────────────────────────────────────
//  Display: Duplicate Images
// ─────────────────────────────────────────────

/**
 * Scans the image-grouped map and prints any images shared by more than one product.
 *
 * @param {Map<string, Array>} imageMap - Products grouped by imageUrl
 * @returns {number} Count of duplicate image sets found
 */
const reportDuplicateImages = (imageMap) => {
  console.log("📷 CHECKING FOR DUPLICATE IMAGES...\n");

  let duplicateCount = 0;

  for (const [imageUrl, items] of imageMap) {
    // Only flag images shared by more than one product
    if (items.length <= 1) continue;

    duplicateCount++;

    // Truncate long URLs for readability
    const displayUrl = imageUrl.length > 50
      ? `${imageUrl.substring(0, 50)}...`
      : imageUrl;

    console.log("🔴 DUPLICATE IMAGE FOUND!");
    console.log(`   Image:     ${displayUrl}`);
    console.log(`   Shared by: ${items.length} products\n`);

    items.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} (SKU: ${item.sku})`);
      console.log(`      Category: ${item.category} | Price: $${item.price} | Stock: ${item.stock}`);
    });

    console.log("");
  }

  if (duplicateCount === 0) {
    console.log("✅ No duplicate images found\n");
  }

  return duplicateCount;
};

// ─────────────────────────────────────────────
//  Display: Category Groups
// ─────────────────────────────────────────────

/**
 * Prints all products grouped by category in a structured list.
 *
 * @param {Map<string, Array>} categoryMap - Products grouped by category
 * @returns {number} Total number of categories found
 */
const reportCategoryGroups = (categoryMap) => {
  console.log("🎯 PRODUCTS BY CATEGORY (Grouped Similar Items)\n");

  let categoryCount = 0;

  for (const [category, items] of categoryMap) {
    categoryCount++;

    console.log(`🟢 ${category.toUpperCase()}`);
    console.log(`   Items in category: ${items.length}\n`);

    items.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} (SKU: ${item.sku})`);
      console.log(`      Price: $${item.price} | Stock: ${item.stock} | Detections: ${item.detections}`);
    });

    console.log("");
  }

  return categoryCount;
};

// ─────────────────────────────────────────────
//  Display: Summary
// ─────────────────────────────────────────────

/**
 * Prints a final summary of duplicate and category counts.
 *
 * @param {number} duplicateCount  - Number of duplicate image sets found
 * @param {number} categoryCount   - Number of unique categories found
 * @param {number} totalProducts   - Total number of products analysed
 */
const printSummary = (duplicateCount, categoryCount, totalProducts) => {
  const duplicateLabel = duplicateCount > 0
    ? `🔴 ${duplicateCount} set(s) found`
    : "✅ None";

  console.log("📊 MATCHING SUMMARY:\n");
  console.log(`   Duplicate Images:          ${duplicateLabel}`);
  console.log(`   Categories with Matches:   🟢 ${categoryCount}`);
  console.log(`   Total Products Analysed:   ${totalProducts}`);
  console.log("");
};

// ─────────────────────────────────────────────
//  Main Entry Point
// ─────────────────────────────────────────────

/**
 * Orchestrates the full duplicate-detection and category-grouping report.
 * Connects to MongoDB, fetches products, runs analysis, then disconnects.
 */
const run = async () => {
  try {
    // Step 1: Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║     🔍 MATCHING ITEMS & DUPLICATE IMAGE DETECTION      ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Step 2: Fetch only the fields we need (lean query)
    const products = await Product
      .find()
      .select("name sku category imageUrl metadata analysisCache");

    // Step 3: Group products by imageUrl → detect duplicates
    const imageMap = groupProductsBy(products, "imageUrl");
    const duplicateCount = reportDuplicateImages(imageMap);

    console.log(SEPARATOR + "\n");

    // Step 4: Group products by category → show similar items
    const categoryMap = groupProductsBy(products, "category");
    const categoryCount = reportCategoryGroups(categoryMap);

    console.log(SEPARATOR + "\n");

    // Step 5: Print summary report
    printSummary(duplicateCount, categoryCount, products.length);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    // Always close the connection cleanly, even on error
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Execute
run();
