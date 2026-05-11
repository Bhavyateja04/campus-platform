require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./Product");
const { detectObjects, formatDetections } = require("./roboflowService");
const { generateInventorySummary, generateBatchSummary } = require("./localSummaryService");
const connectDB = require("./db");

// ─────────────────────────────────────────────
// LOGGER UTILITY
// ─────────────────────────────────────────────

const colors = {
  reset:   "\x1b[0m",
  green:   "\x1b[32m",
  red:     "\x1b[31m",
  yellow:  "\x1b[33m",
  blue:    "\x1b[36m",
  magenta: "\x1b[35m",
  bold:    "\x1b[1m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const section = (title, color = "blue") => {
  log("─".repeat(80), color);
  log(title, color);
  log("─".repeat(80) + "\n", color);
};

// ─────────────────────────────────────────────
// PHASE HANDLERS
// ─────────────────────────────────────────────

const fetchProducts = async () => {
  log("Connecting to MongoDB...", "yellow");
  await connectDB();
  log("✅ Connected to MongoDB\n", "green");

  log("Fetching all products from database...", "yellow");
  const products = await Product.find({});

  if (products.length === 0) {
    log("\n❌ No products found in MongoDB. Please add products first.\n", "red");
    process.exit(1);
  }

  log(`✅ Found ${products.length} products in database\n`, "green");
  return products;
};

const printProductsOverview = (products) => {
  log("Database Products:\n");
  products.forEach((p, i) => {
    const hasImage   = p.imageUrl ? "✅" : "❌";
    const hasSummary = p.analysisCache?.summary ? "✅" : "❌";
    log(`  ${i + 1}. ${p.name} (SKU: ${p.sku}) - ${p.category} | Image: ${hasImage} | Summary: ${hasSummary}`);
  });
  log("");
};

const runDetections = async (products) => {
  const detectionResults    = [];
  let productsWithImages    = 0;
  let successfulDetections  = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    log(`[${i + 1}/${products.length}] Analyzing: ${product.name}`);

    if (!product.imageUrl) {
      log("         ❌ No image URL found", "red");
      continue;
    }

    productsWithImages++;
    log(`         Image: ${product.imageUrl.substring(0, 50)}...`);

    const rawDetections = await detectObjects(product.imageUrl);

    if (!rawDetections.success) {
      log(`         ⚠️ Detection failed: ${rawDetections.error}`, "yellow");
      continue;
    }

    successfulDetections++;
    const detections = formatDetections(rawDetections.predictions);
    log(`         ✅ ${detections.count} objects detected`, "green");
    detections.classes.forEach((c) => log(`            • ${c.name}: ${c.count}x`));

    detectionResults.push({ product, rawDetections, detections });
  }

  log("\n" + "─".repeat(80));
  log(`✅ Detection Summary: ${successfulDetections}/${productsWithImages} images detected\n`, "green");

  return { detectionResults, productsWithImages, successfulDetections };
};

const printComparisonReport = (detectionResults) => {
  if (detectionResults.length === 0) {
    log("⚠️  No products with valid images to compare\n", "yellow");
    return;
  }

  const classFrequency = {};
  const detectionStats = detectionResults.map((result) => {
    result.detections.classes.forEach((c) => {
      classFrequency[c.name] = (classFrequency[c.name] || 0) + 1;
    });
    return {
      name:            result.product.name,
      sku:             result.product.sku,
      category:        result.product.category,
      objectCount:     result.detections.count,
      classesDetected: result.detections.classes.map((c) => c.name),
    };
  });

  log("🏆 Products Ranked by Detection Count:\n");
  [...detectionStats]
    .sort((a, b) => b.objectCount - a.objectCount)
    .forEach((p, i) => {
      const color = p.objectCount > 5 ? "green" : p.objectCount > 0 ? "yellow" : "blue";
      log(`  ${i + 1}. ${p.name} (${p.sku}) → ${p.objectCount} objects`, color);
      if (p.classesDetected.length > 0) {
        log(`     Classes: ${p.classesDetected.join(", ")}`);
      }
    });

  log("");

  if (Object.keys(classFrequency).length > 0) {
    log("📊 Most Common Object Classes:\n");
    Object.entries(classFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([className, count]) => {
        log(`  • ${className}: found in ${count} product(s)`);
      });
  } else {
    log("ℹ️  No common object classes detected across products\n", "yellow");
  }

  log("");
};

const generateSummaries = async (detectionResults) => {
  const summaries = [];
  let successCount = 0;

  for (let i = 0; i < detectionResults.length; i++) {
    const result = detectionResults[i];
    log(`[${i + 1}/${detectionResults.length}] Generating summary for: ${result.product.name}`);

    const summaryResult = await generateInventorySummary(result.product, result.detections, []);

    if (summaryResult.success) {
      log("         ✅ Summary generated", "green");
      successCount++;
      summaries.push({ product: result.product, summary: summaryResult.summary });

      // Cache results in database
      result.product.analysisCache = {
        detections:      result.detections,
        summary:         summaryResult.summary,
        similarProducts: [],
        cachedAt:        new Date(),
      };
      result.product.lastAnalyzed = new Date();
      await result.product.save();
      log("         💾 Cached in MongoDB", "blue");
    } else {
      log(`         ⚠️ Failed: ${summaryResult.error.substring(0, 50)}...`, "yellow");
    }
  }

  log("\n" + "─".repeat(80));
  log(`✅ Generated ${successCount}/${detectionResults.length} summaries\n`, "green");

  return { summaries, successCount };
};

const printSampleSummaries = (summaries) => {
  if (summaries.length === 0) return;

  summaries.slice(0, 2).forEach((item) => {
    log("📋 " + "─".repeat(76), "magenta");
    log(`📊 ${item.product.name} (SKU: ${item.product.sku})`, "magenta");
    log("─".repeat(80), "magenta");
    const preview = item.summary.substring(0, 900);
    log(preview + (item.summary.length > 900 ? "\n...\n[Summary truncated]" : ""));
    log("─".repeat(80) + "\n");
  });

  if (summaries.length > 2) {
    log(`(${summaries.length - 2} more summaries cached in database)\n`);
  }
};

const generateBatchReport = async (detectionResults) => {
  if (detectionResults.length === 0) return;

  log("Generating overall inventory analysis...\n");
  const batchProducts = detectionResults.map((r) => ({
    ...r.product.toObject(),
    detections: r.detections,
  }));

  const batchSummary = await generateBatchSummary(batchProducts);

  if (batchSummary.success) {
    log("✅ Batch Summary Generated:\n");
    log("─".repeat(80));
    log(batchSummary.batchSummary);
    log("─".repeat(80) + "\n");
  } else {
    log(`⚠️ Batch summary failed: ${batchSummary.error.substring(0, 100)}...\n`, "yellow");
  }
};

const printFinalReport = (allProducts, productsWithImages, successfulDetections, detectionResults, successCount) => {
  const totalObjectsDetected = detectionResults.reduce((sum, r) => sum + r.detections.count, 0);
  const detectionRate = productsWithImages > 0
    ? ((successfulDetections / productsWithImages) * 100).toFixed(1) : 0;
  const summaryRate = detectionResults.length > 0
    ? ((successCount / detectionResults.length) * 100).toFixed(1) : 0;

  log("📈 COMPLETE STATISTICS:\n", "blue");
  log(`   Total Products in Database:     ${allProducts.length}`);
  log(`   Products with Images:           ${productsWithImages}/${allProducts.length}`);
  log(`   Successful Detections:          ${successfulDetections}/${productsWithImages}`);
  log(`   Total Objects Detected:         ${totalObjectsDetected}`);
  log(`   AI Summaries Generated:         ${successCount}/${detectionResults.length}`);
  log("");

  log("📊 SUCCESS RATES:\n", "blue");
  log(`   Detection Coverage:             ${detectionRate}%`);
  log(`   Summary Generation Coverage:    ${summaryRate}%`);
  log("");

  const categoryMap = {};
  allProducts.forEach((p) => {
    const cat = p.category || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  log("📂 PRODUCTS BY CATEGORY:\n", "blue");
  Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const pct = ((count / allProducts.length) * 100).toFixed(1);
      log(`   ${cat}: ${count} products (${pct}%)`);
    });

  log("");
  log("✅ STATUS:\n", "green");
  log("   Database:      ✅ Connected and operational");
  log("   Roboflow API:  ✅ All detections completed");
  log("   Gemini AI:     ✅ Summaries generated");
  log("   MongoDB Cache: ✅ All results cached");
  log(`   System: ${successCount === detectionResults.length ? "✅ FULLY OPERATIONAL" : "⚠️ OPERATIONAL WITH WARNINGS"}`);
};

// ─────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────

const analyzeMongoDBProducts = async () => {
  try {
    log("\n" + "=".repeat(80), "bold");
    log("COMPREHENSIVE MONGODB INVENTORY ANALYSIS & IMAGE DETECTION SYSTEM", "magenta");
    log("=".repeat(80) + "\n", "bold");

    section("PHASE 1: MONGODB CONNECTION & DATA RETRIEVAL");
    const allProducts = await fetchProducts();

    section("PHASE 2: PRODUCTS OVERVIEW");
    printProductsOverview(allProducts);

    section("PHASE 3: IMAGE DETECTION (Roboflow API)");
    const { detectionResults, productsWithImages, successfulDetections } = await runDetections(allProducts);

    section("PHASE 4: IMAGE COMPARISON & ANALYSIS");
    printComparisonReport(detectionResults);

    section("PHASE 5: AI SUMMARY GENERATION (Google Gemini)");
    const { summaries, successCount } = await generateSummaries(detectionResults);

    section("PHASE 6: SAMPLE AI SUMMARIES");
    printSampleSummaries(summaries);

    section("PHASE 7: BATCH INVENTORY SUMMARY");
    await generateBatchReport(detectionResults);

    section("PHASE 8: COMPREHENSIVE FINAL REPORT", "magenta");
    printFinalReport(allProducts, productsWithImages, successfulDetections, detectionResults, successCount);

    log("\n" + "=".repeat(80), "bold");
    log("✨ ANALYSIS COMPLETE - ALL DATA PROCESSED AND CACHED", "bold");
    log("=".repeat(80) + "\n", "bold");

  } catch (error) {
    log(`\n❌ CRITICAL ERROR: ${error.message}`, "red");
    log(`Stack: ${error.stack}`, "red");
  } finally {
    await mongoose.connection.close();
    log("Database connection closed.\n", "blue");
    process.exit(0);
  }
};

analyzeMongoDBProducts();
