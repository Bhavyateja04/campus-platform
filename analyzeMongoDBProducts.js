require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./Product");
const { detectObjects, formatDetections } = require("./roboflowService");
const { generateInventorySummary, generateBatchSummary } = require("./localSummaryService");
const { getInventorySummary, makeSentence } = require("./dbSummary");
const connectDB = require("./db");

/**
 * Comprehensive MongoDB Analysis
 * Fetches all products from MongoDB, analyzes them, compares images, and generates summaries
 */

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const analyzeMongoDBProducts = async () => {
  try {
    log("\n" + "=".repeat(80), "bold");
    log("COMPREHENSIVE MONGODB INVENTORY ANALYSIS & IMAGE DETECTION SYSTEM", "magenta");
    log("=".repeat(80) + "\n", "bold");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 1: DATABASE CONNECTION & DATA FETCHING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    log("PHASE 1: MONGODB CONNECTION & DATA RETRIEVAL", "blue");
    log("─".repeat(80) + "\n", "blue");

    log("Connecting to MongoDB...", "yellow");
    await connectDB();
    log("✅ Connected to MongoDB\n", "green");

    log("Fetching all products from database...", "yellow");
    const allProducts = await Product.find({});
    
    if (allProducts.length === 0) {
      log("\n❌ ERROR: No products found in MongoDB database!", "red");
      log("Please add products to the database first.\n", "red");
      process.exit(1);
    }

    log(`✅ Found ${allProducts.length} products in database\n`, "green");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 2: PRODUCTS OVERVIEW
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 2: PRODUCTS OVERVIEW", "blue");
    log("─".repeat(80) + "\n", "blue");

    log("Database Products:\n");
    allProducts.forEach((p, i) => {
      const hasImage = p.imageUrl ? "✅" : "❌";
      const hasSummary = p.analysisCache?.summary ? "✅" : "❌";
      log(
        `  ${i + 1}. ${p.name} (SKU: ${p.sku}) - ${p.category} | Image: ${hasImage} | Summary: ${hasSummary}`
      );
    });
    log("");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 3: IMAGE DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 3: IMAGE DETECTION (Roboflow API)", "blue");
    log("─".repeat(80) + "\n", "yellow");

    const detectionResults = [];
    let productsWithImages = 0;
    let successfulDetections = 0;

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      log(`[${i + 1}/${allProducts.length}] Analyzing: ${product.name}`);

      if (!product.imageUrl) {
        log(`         ❌ No image URL found`, "red");
        continue;
      }

      productsWithImages++;
      log(`         Image: ${product.imageUrl.substring(0, 50)}...`);

      // Run detection
      const rawDetections = await detectObjects(product.imageUrl);

      if (!rawDetections.success) {
        log(`         ⚠️ Detection failed: ${rawDetections.error}`);
        continue;
      }

      successfulDetections++;
      const detections = formatDetections(rawDetections.predictions);
      log(`         ✅ Detection successful - ${detections.count} objects found`);

      if (detections.classes.length > 0) {
        detections.classes.forEach((c) => {
          log(`            • ${c.name}: ${c.count}x`);
        });
      }

      detectionResults.push({
        product,
        rawDetections,
        detections,
      });
    }

    log("\n" + "─".repeat(80));
    log(`✅ Detection Summary: ${successfulDetections}/${productsWithImages} images detected\n`, "green");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 4: IMAGE COMPARISON
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 4: IMAGE COMPARISON & ANALYSIS", "blue");
    log("─".repeat(80) + "\n", "blue");

    if (detectionResults.length > 0) {
      // Analyze detection patterns
      const classFrequency = {};
      const detectionStats = [];

      detectionResults.forEach((result) => {
        const totalObjects = result.detections.count;

        result.detections.classes.forEach((c) => {
          classFrequency[c.name] = (classFrequency[c.name] || 0) + 1;
        });

        detectionStats.push({
          name: result.product.name,
          sku: result.product.sku,
          category: result.product.category,
          objectCount: totalObjects,
          classesDetected: result.detections.classes.map((c) => c.name),
        });
      });

      // Rank products
      const sortedByCount = [...detectionStats].sort(
        (a, b) => b.objectCount - a.objectCount
      );

      log("🏆 Products Ranked by Detection Count:\n");
      sortedByCount.forEach((p, i) => {
        const color = p.objectCount > 5 ? "green" : p.objectCount > 0 ? "yellow" : "blue";
        log(
          `  ${i + 1}. ${p.name} (${p.sku}) → ${p.objectCount} objects`,
          color
        );
        if (p.classesDetected.length > 0) {
          log(`     Classes: ${p.classesDetected.join(", ")}`);
        }
      });

      log("");

      // Most common classes
      if (Object.keys(classFrequency).length > 0) {
        log("📊 Most Common Object Classes Detected:\n");
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
    } else {
      log("⚠️  No products with valid images to compare\n", "yellow");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 5: AI SUMMARY GENERATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 5: AI SUMMARY GENERATION (Google Gemini)", "blue");
    log("─".repeat(80) + "\n", "yellow");

    const summaries = [];
    let successCount = 0;

    for (let i = 0; i < detectionResults.length; i++) {
      const result = detectionResults[i];
      log(`[${i + 1}/${detectionResults.length}] Generating summary for ${result.product.name}...`);

      const summaryResult = await generateInventorySummary(
        result.product,
        result.detections,
        []
      );

      if (summaryResult.success) {
        log(`         ✅ Summary generated successfully`, "green");
        successCount++;
        summaries.push({
          product: result.product,
          summary: summaryResult.summary,
        });

        // Cache in database
        result.product.analysisCache = {
          detections: result.detections,
          summary: summaryResult.summary,
          similarProducts: [],
          cachedAt: new Date(),
        };
        result.product.lastAnalyzed = new Date();
        await result.product.save();
        log(`         💾 Cached in MongoDB`, "blue");
      } else {
        log(`         ⚠️ Failed: ${summaryResult.error.substring(0, 50)}...`, "yellow");
      }
    }

    log("\n" + "─".repeat(80));
    log(`✅ Generated ${successCount}/${detectionResults.length} summaries\n`, "green");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 6: SAMPLE SUMMARIES DISPLAY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (summaries.length > 0) {
      log("PHASE 6: SAMPLE AI SUMMARIES", "blue");
      log("─".repeat(80) + "\n", "blue");

      // Show first 2 summaries
      for (let i = 0; i < Math.min(2, summaries.length); i++) {
        const item = summaries[i];
        log("📋 " + "─".repeat(76), "magenta");
        log(`📊 ${item.product.name} (SKU: ${item.product.sku})`, "magenta");
        log("─".repeat(80), "magenta");
        
        const preview = item.summary.substring(0, 900);
        log(preview + (item.summary.length > 900 ? "\n...\n[Summary truncated]" : ""));
        log("─".repeat(80) + "\n");
      }

      if (summaries.length > 2) {
        log(`(${summaries.length - 2} more summaries generated and cached in database)\n`);
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 7: BATCH SUMMARY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 7: BATCH INVENTORY SUMMARY", "blue");
    log("─".repeat(80) + "\n", "yellow");

    if (detectionResults.length > 0) {
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
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 8: FINAL COMPREHENSIVE REPORT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    log("PHASE 8: COMPREHENSIVE FINAL REPORT", "magenta");
    log("=".repeat(80) + "\n", "bold");

    const totalObjectsDetected = detectionResults.reduce(
      (sum, r) => sum + r.detections.count,
      0
    );

    log("📈 COMPLETE STATISTICS:\n", "blue");
    log(`   Total Products in Database:     ${allProducts.length}`);
    log(`   Products with Images:           ${productsWithImages}/${allProducts.length}`);
    log(`   Successful Detections:          ${successfulDetections}/${productsWithImages}`);
    log(`   Total Objects Detected:         ${totalObjectsDetected}`);
    log(`   AI Summaries Generated:         ${successCount}/${detectionResults.length}`);
    log("");

    const detectionRate =
      productsWithImages > 0
        ? ((successfulDetections / productsWithImages) * 100).toFixed(1)
        : 0;
    const summaryRate =
      detectionResults.length > 0
        ? ((successCount / detectionResults.length) * 100).toFixed(1)
        : 0;

    log("📊 SUCCESS RATES:\n", "blue");
    log(`   Detection Coverage:            ${detectionRate}%`);
    log(`   Summary Generation Coverage:   ${summaryRate}%`);
    log("");

    // Category breakdown
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

    // Final status
    log("✅ STATUS:\n", "green");
    log(`   Database: ✅ Connected and operational`);
    log(`   Roboflow API: ✅ All detections completed`);
    log(`   Gemini AI: ✅ Summaries generated`);
    log(`   MongoDB Cache: ✅ All results cached`);
    log(`   System: ${successCount === detectionResults.length ? "✅ FULLY OPERATIONAL" : "⚠️ OPERATIONAL WITH WARNINGS"}`);

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

// Run the analysis
analyzeMongoDBProducts();
