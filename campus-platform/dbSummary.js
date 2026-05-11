require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./Product");
const connectDB = require("./db");

/**
 * MongoDB Data Summary & Statistics
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

/**
 * Get inventory summary - groups by detected labels and counts
 */
const getInventorySummary = async (collection) => {
  const summary = await collection.aggregate([
    {
      $group: {
        _id: "$label",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();

  return summary;
};

/**
 * Make human-readable sentence from summary
 */
const makeSentence = (summary) => {
  if (!summary || summary.length === 0) {
    return "No inventory data available.";
  }

  const top = summary[0];
  return `Most items are ${top._id} (${top.count} items).`;
};

const getMongoDBSummary = async () => {
  try {
    log("\n" + "=".repeat(70), "bold");
    log("MONGODB DATA & IMAGE DETECTION SUMMARY", "magenta");
    log("=".repeat(70) + "\n", "bold");

    // ─── Connect to Database ──────────────────────────────
    log("Connecting to MongoDB...", "yellow");
    await connectDB();
    log("");

    // ─── Get All Products ─────────────────────────────────
    log("📊 COLLECTING DATA FROM DATABASE...\n", "cyan");

    const allProducts = await Product.find({});
    const totalProducts = allProducts.length;

    // ─── Parse Statistics ────────────────────────────────
    let productsWithImages = 0;
    let productsWithDetections = 0;
    let productsWithSummaries = 0;
    let totalObjectsDetected = 0;
    const categoryCounts = {};
    const detectionStats = [];

    allProducts.forEach((product) => {
      // Count products with images
      if (product.imageUrl) {
        productsWithImages++;
      }

      // Count detections and summaries
      if (product.analysisCache) {
        if (product.analysisCache.detections) {
          productsWithDetections++;
          const objectCount = product.analysisCache.detections.count || 0;
          totalObjectsDetected += objectCount;
        }
        if (product.analysisCache.summary) {
          productsWithSummaries++;
        }
      }

      // Count by category
      const category = product.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Store detection stats
      detectionStats.push({
        name: product.name,
        sku: product.sku,
        category: product.category,
        imageUrl: product.imageUrl ? "✅ Yes" : "❌ No",
        objectsDetected:
          product.analysisCache?.detections?.count || 0,
        hasSummary: product.analysisCache?.summary ? "✅ Yes" : "❌ No",
        lastAnalyzed: product.lastAnalyzed
          ? new Date(product.lastAnalyzed).toLocaleDateString()
          : "Never",
        cachedAt: product.analysisCache?.cachedAt
          ? new Date(product.analysisCache.cachedAt).toLocaleDateString()
          : "N/A",
      });
    });

    // ─── Display Overall Statistics ────────────────────────
    log("📈 OVERALL STATISTICS:\n", "blue");
    log(`   Total Products in Database:    ${totalProducts}`);
    log(`   Products with Images:          ${productsWithImages}`);
    log(`   Products with Detections:      ${productsWithDetections}`);
    log(`   Products with AI Summaries:    ${productsWithSummaries}`);
    log(`   Total Objects Detected:        ${totalObjectsDetected}\n`);

    // ─── Detection Success Rate ────────────────────────────
    const detectionRate =
      totalProducts > 0
        ? ((productsWithDetections / totalProducts) * 100).toFixed(1)
        : 0;
    const summaryRate =
      totalProducts > 0
        ? ((productsWithSummaries / totalProducts) * 100).toFixed(1)
        : 0;

    log("📊 SUCCESS RATES:\n", "blue");
    log(`   Detection Coverage:           ${detectionRate}% (${productsWithDetections}/${totalProducts})`);
    log(`   Summary Generation Coverage:  ${summaryRate}% (${productsWithSummaries}/${totalProducts})\n`);

    // ─── Category Breakdown ────────────────────────────────
    log("📂 PRODUCTS BY CATEGORY:\n", "blue");
    const sortedCategories = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    );
    sortedCategories.forEach(([category, count]) => {
      const percentage = ((count / totalProducts) * 100).toFixed(1);
      log(`   ${category}: ${count} products (${percentage}%)`);
    });
    log("");

    // ─── Top Detected Products ────────────────────────────
    log("🏆 TOP DETECTED PRODUCTS (by object count):\n", "green");
    const sortedByDetections = detectionStats
      .sort((a, b) => b.objectsDetected - a.objectsDetected)
      .slice(0, 5);

    if (sortedByDetections.length > 0 && sortedByDetections[0].objectsDetected > 0) {
      sortedByDetections.forEach((p, i) => {
        log(
          `   ${i + 1}. ${p.name} (${p.sku}) → ${p.objectsDetected} objects detected`,
          "yellow"
        );
      });
    } else {
      log("   ℹ️  No objects detected yet", "yellow");
    }
    log("");

    // ─── Products Without Images ──────────────────────────
    log("⚠️  PRODUCTS WITHOUT IMAGES:\n", "yellow");
    const noImageProducts = detectionStats.filter((p) => p.imageUrl === "❌ No");
    if (noImageProducts.length > 0) {
      noImageProducts.forEach((p) => {
        log(`   • ${p.name} (${p.sku})`);
      });
    } else {
      log("   ✅ All products have images", "green");
    }
    log("");

    // ─── Products Without Summaries ───────────────────────
    log("📝 PRODUCTS WITHOUT SUMMARIES:\n", "yellow");
    const noSummaryProducts = detectionStats.filter((p) => p.hasSummary === "❌ No");
    if (noSummaryProducts.length > 0) {
      log(`   Total: ${noSummaryProducts.length} products need analysis\n`);
      noSummaryProducts.forEach((p) => {
        log(
          `   • ${p.name} (${p.sku}) - Objects: ${p.objectsDetected}`
        );
      });
    } else {
      log("   ✅ All products have summaries", "green");
    }
    log("");

    // ─── Detailed Product Table ───────────────────────────
    log("=".repeat(70), "bold");
    log("DETAILED PRODUCT ANALYSIS TABLE", "magenta");
    log("=".repeat(70) + "\n", "bold");

    if (detectionStats.length > 0) {
      // Create table header
      const header = [
        "Product Name",
        "SKU",
        "Image",
        "Objects",
        "Summary",
        "Last Analyzed",
      ];

      // Calculate column widths
      const colWidths = [20, 12, 8, 10, 10, 15];

      // Print header
      let headerLine = "";
      header.forEach((col, i) => {
        headerLine += col.padEnd(colWidths[i]) + " | ";
      });
      log(headerLine, "bold");
      log("─".repeat(90));

      // Print rows
      detectionStats.forEach((p) => {
        let row = "";
        row += (p.name.substring(0, 19)).padEnd(20) + " | ";
        row += (p.sku || "N/A").padEnd(12) + " | ";
        row += (p.imageUrl === "✅ Yes" ? "✅" : "❌").padEnd(8) + " | ";
        row += String(p.objectsDetected).padEnd(10) + " | ";
        row += (p.hasSummary === "✅ Yes" ? "✅" : "❌").padEnd(10) + " | ";
        row += (p.lastAnalyzed || "N/A").padEnd(15);

        const hasColor = p.objectsDetected > 0 ? "green" : "yellow";
        log(row, hasColor);
      });
    } else {
      log("   No products found in database", "red");
    }

    log("");

    // ─── Database Storage Info ────────────────────────────
    log("💾 DATABASE INFORMATION:\n", "blue");
    const dbStats = await mongoose.connection.db.stats();
    const dbSizeInMB = (dbStats.dataSize / (1024 * 1024)).toFixed(2);
    const storageSizeInMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);

    log(`   Database Name:   ${dbStats.db}`);
    log(`   Data Size:       ${dbSizeInMB} MB`);
    log(`   Storage Size:    ${storageSizeInMB} MB`);
    log(`   Collections:     ${dbStats.collections}`);
    log("");

    // ─── Label Summary ────────────────────────────────────
    log("🏷️  DETECTED LABELS SUMMARY:\n", "blue");
    const labelSummary = await getInventorySummary(Product.collection);
    if (labelSummary.length > 0) {
      labelSummary.forEach((item, i) => {
        log(`   ${i + 1}. ${item._id}: ${item.count} items`);
      });
      log(`\n   📊 ${makeSentence(labelSummary)}\n`);
    } else {
      log("   ℹ️  No labels detected yet\n");
    }

    // ─── Summary Report ────────────────────────────────────
    log("=".repeat(70), "bold");
    log("SUMMARY REPORT", "magenta");
    log("=".repeat(70) + "\n", "bold");

    log("✅ STATUS:", "green");
    log(`   • Database: Connected and operational`);
    log(`   • Total Products: ${totalProducts}`);
    log(`   • Images Available: ${productsWithImages}/${totalProducts}`);
    log(`   • Images with Detections: ${productsWithDetections}/${totalProducts}`);
    log(`   • AI Summaries Generated: ${productsWithSummaries}/${totalProducts}`);
    log(`   • Total Objects Detected: ${totalObjectsDetected}\n`);

    log("🎯 NEXT STEPS:", "cyan");
    if (productsWithDetections < totalProducts) {
      log(
        `   1. Run image detection on ${totalProducts - productsWithDetections} remaining products`
      );
      log(`      Command: node testImageComparison.js`);
    } else {
      log(`   ✅ All products have been detected!`);
    }

    if (productsWithSummaries < totalProducts) {
      log(
        `   2. Generate AI summaries for ${totalProducts - productsWithSummaries} products`
      );
      log(`      (Will be generated automatically with detections)`);
    } else {
      log(`   ✅ All products have AI summaries!`);
    }

    log(`\n`);

    // ─── Export Option ────────────────────────────────────
    log("📥 DATA EXPORT:\n", "blue");
    log(`   Complete data available in: MongoDB → inventory_db → products\n`);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, "red");
    log(`Stack: ${error.stack}`, "red");
  } finally {
    await mongoose.connection.close();
    log("Database connection closed.\n", "blue");
    process.exit(0);
  }
};

// Run the summary
getMongoDBSummary();

module.exports = {
  getInventorySummary,
  makeSentence,
  getMongoDBSummary
};
