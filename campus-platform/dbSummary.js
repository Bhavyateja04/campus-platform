require("dotenv").config();

const mongoose = require("mongoose");
const Product  = require("./Product");
const connectDB = require("./db");

// ─────────────────────────────────────────────
//  ANSI Color Utilities
// ─────────────────────────────────────────────

/** Terminal color codes for styled console output */
const colors = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  red:     "\x1b[31m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  blue:    "\x1b[36m",
  magenta: "\x1b[35m",
  cyan:    "\x1b[36m",
};

/**
 * Prints a colored message to the console.
 * @param {string} message - Text to display
 * @param {string} [color="reset"] - Key from the colors object
 */
const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// ─────────────────────────────────────────────
//  Helper Functions
// ─────────────────────────────────────────────

/**
 * Aggregates inventory by label field and returns counts in descending order.
 * @param {mongoose.Collection} collection - Mongoose collection to query
 * @returns {Promise<Array<{ _id: string, count: number }>>}
 */
const getInventorySummary = async (collection) => {
  return collection
    .aggregate([
      { $group: { _id: "$label", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
};

/**
 * Converts an inventory summary array into a human-readable sentence.
 * @param {Array<{ _id: string, count: number }>} summary
 * @returns {string}
 */
const makeSentence = (summary) => {
  if (!summary || summary.length === 0) {
    return "No inventory data available.";
  }
  const top = summary[0];
  return `Most items are labeled "${top._id}" (${top.count} item${top.count !== 1 ? "s" : ""}).`;
};

// ─────────────────────────────────────────────
//  Stat Calculation
// ─────────────────────────────────────────────

/**
 * Processes raw product documents into summary statistics and a flat
 * detection-stats array suitable for table rendering.
 *
 * @param {Array} products - Array of Mongoose Product documents
 * @returns {{ stats: object, detectionStats: Array }}
 */
const buildProductStats = (products) => {
  const stats = {
    total:              products.length,
    withImages:         0,
    withDetections:     0,
    withSummaries:      0,
    totalObjectsDetected: 0,
    categoryCounts:     {},
  };

  const detectionStats = products.map((product) => {
    // Image check
    if (product.imageUrl) stats.withImages++;

    // Analysis cache checks
    const cache = product.analysisCache;
    if (cache?.detections) {
      stats.withDetections++;
      stats.totalObjectsDetected += cache.detections.count || 0;
    }
    if (cache?.summary) stats.withSummaries++;

    // Category tally
    const category = product.category || "Uncategorized";
    stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;

    // Flat record for the display table
    return {
      name:            product.name,
      sku:             product.sku,
      category,
      hasImage:        Boolean(product.imageUrl),
      objectsDetected: cache?.detections?.count || 0,
      hasSummary:      Boolean(cache?.summary),
      lastAnalyzed:    product.lastAnalyzed
        ? new Date(product.lastAnalyzed).toLocaleDateString()
        : "Never",
      cachedAt:        cache?.cachedAt
        ? new Date(cache.cachedAt).toLocaleDateString()
        : "N/A",
    };
  });

  return { stats, detectionStats };
};

// ─────────────────────────────────────────────
//  Display Sections
// ─────────────────────────────────────────────

/** Prints section header with a consistent separator style */
const printHeader = (title) => {
  log("\n" + "=".repeat(70), "bold");
  log(title, "magenta");
  log("=".repeat(70) + "\n", "bold");
};

/** Displays overall numeric statistics */
const printOverallStats = (stats) => {
  log("📈 OVERALL STATISTICS:\n", "blue");
  log(`   Total Products in Database:    ${stats.total}`);
  log(`   Products with Images:          ${stats.withImages}`);
  log(`   Products with Detections:      ${stats.withDetections}`);
  log(`   Products with AI Summaries:    ${stats.withSummaries}`);
  log(`   Total Objects Detected:        ${stats.totalObjectsDetected}\n`);
};

/** Displays detection and summary coverage rates */
const printSuccessRates = (stats) => {
  const pct = (n) =>
    stats.total > 0 ? ((n / stats.total) * 100).toFixed(1) : "0.0";

  log("📊 SUCCESS RATES:\n", "blue");
  log(`   Detection Coverage:           ${pct(stats.withDetections)}% (${stats.withDetections}/${stats.total})`);
  log(`   Summary Generation Coverage:  ${pct(stats.withSummaries)}% (${stats.withSummaries}/${stats.total})\n`);
};

/** Displays product count per category */
const printCategoryBreakdown = (stats) => {
  log("📂 PRODUCTS BY CATEGORY:\n", "blue");
  Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const pct = ((count / stats.total) * 100).toFixed(1);
      log(`   ${category}: ${count} products (${pct}%)`);
    });
  log("");
};

/** Lists the top 5 products by object-detection count */
const printTopDetectedProducts = (detectionStats) => {
  log("🏆 TOP DETECTED PRODUCTS (by object count):\n", "green");

  const top5 = [...detectionStats]
    .sort((a, b) => b.objectsDetected - a.objectsDetected)
    .slice(0, 5);

  if (top5.length > 0 && top5[0].objectsDetected > 0) {
    top5.forEach((p, i) => {
      log(`   ${i + 1}. ${p.name} (${p.sku}) → ${p.objectsDetected} objects detected`, "yellow");
    });
  } else {
    log("   ℹ️  No objects detected yet", "yellow");
  }
  log("");
};

/** Lists products missing images */
const printMissingImages = (detectionStats) => {
  log("⚠️  PRODUCTS WITHOUT IMAGES:\n", "yellow");
  const noImage = detectionStats.filter((p) => !p.hasImage);

  if (noImage.length > 0) {
    noImage.forEach((p) => log(`   • ${p.name} (${p.sku})`));
  } else {
    log("   ✅ All products have images", "green");
  }
  log("");
};

/** Lists products missing AI summaries */
const printMissingSummaries = (detectionStats) => {
  log("📝 PRODUCTS WITHOUT SUMMARIES:\n", "yellow");
  const noSummary = detectionStats.filter((p) => !p.hasSummary);

  if (noSummary.length > 0) {
    log(`   Total: ${noSummary.length} products need analysis\n`);
    noSummary.forEach((p) =>
      log(`   • ${p.name} (${p.sku}) - Objects: ${p.objectsDetected}`)
    );
  } else {
    log("   ✅ All products have summaries", "green");
  }
  log("");
};

/** Renders the full product analysis as a formatted ASCII table */
const printDetailedTable = (detectionStats) => {
  printHeader("DETAILED PRODUCT ANALYSIS TABLE");

  if (detectionStats.length === 0) {
    log("   No products found in database", "red");
    return;
  }

  // Column headers and fixed widths
  const columns = ["Product Name", "SKU", "Image", "Objects", "Summary", "Last Analyzed"];
  const widths  = [20, 12, 8, 10, 10, 15];

  // Header row
  const headerRow = columns.map((col, i) => col.padEnd(widths[i])).join(" | ");
  log(headerRow, "bold");
  log("─".repeat(85));

  // Data rows
  detectionStats.forEach((p) => {
    const row = [
      p.name.substring(0, 19).padEnd(widths[0]),
      (p.sku || "N/A").padEnd(widths[1]),
      (p.hasImage ? "✅" : "❌").padEnd(widths[2]),
      String(p.objectsDetected).padEnd(widths[3]),
      (p.hasSummary ? "✅" : "❌").padEnd(widths[4]),
      (p.lastAnalyzed || "N/A").padEnd(widths[5]),
    ].join(" | ");

    log(row, p.objectsDetected > 0 ? "green" : "yellow");
  });

  log("");
};

/** Displays MongoDB storage statistics */
const printDatabaseInfo = async () => {
  log("💾 DATABASE INFORMATION:\n", "blue");
  const dbStats     = await mongoose.connection.db.stats();
  const dataSizeMB  = (dbStats.dataSize    / (1024 * 1024)).toFixed(2);
  const storageMB   = (dbStats.storageSize / (1024 * 1024)).toFixed(2);

  log(`   Database Name:   ${dbStats.db}`);
  log(`   Data Size:       ${dataSizeMB} MB`);
  log(`   Storage Size:    ${storageMB} MB`);
  log(`   Collections:     ${dbStats.collections}\n`);
};

/** Displays aggregated label detection results */
const printLabelSummary = async () => {
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
};

/** Displays final status summary and actionable next steps */
const printSummaryReport = (stats) => {
  printHeader("SUMMARY REPORT");

  log("✅ STATUS:", "green");
  log(`   • Database Connected and Operational`);
  log(`   • Total Products:             ${stats.total}`);
  log(`   • Images Available:           ${stats.withImages}/${stats.total}`);
  log(`   • Images with Detections:     ${stats.withDetections}/${stats.total}`);
  log(`   • AI Summaries Generated:     ${stats.withSummaries}/${stats.total}`);
  log(`   • Total Objects Detected:     ${stats.totalObjectsDetected}\n`);

  log("🎯 NEXT STEPS:", "cyan");
  if (stats.withDetections < stats.total) {
    log(`   1. Run image detection on ${stats.total - stats.withDetections} remaining products`);
    log(`      Command: node testImageComparison.js`);
  } else {
    log("   ✅ All products have been detected!");
  }

  if (stats.withSummaries < stats.total) {
    log(`   2. Generate AI summaries for ${stats.total - stats.withSummaries} products`);
    log(`      (Will be generated automatically with detections)`);
  } else {
    log("   ✅ All products have AI summaries!");
  }

  log("\n");
  log("📥 DATA EXPORT:\n", "blue");
  log("   Complete data available in: MongoDB → inventory_db → products\n");
};

// ─────────────────────────────────────────────
//  Main Entry Point
// ─────────────────────────────────────────────

/**
 * Orchestrates the full MongoDB summary report.
 * Connects to the database, collects statistics, and prints all sections.
 */
const getMongoDBSummary = async () => {
  try {
    printHeader("MONGODB DATA & IMAGE DETECTION SUMMARY");

    // Step 1: Connect
    log("Connecting to MongoDB...", "yellow");
    await connectDB();
    log("");

    // Step 2: Fetch all products
    log("📊 COLLECTING DATA FROM DATABASE...\n", "cyan");
    const allProducts = await Product.find({});

    // Step 3: Build statistics
    const { stats, detectionStats } = buildProductStats(allProducts);

    // Step 4: Print each report section
    printOverallStats(stats);
    printSuccessRates(stats);
    printCategoryBreakdown(stats);
    printTopDetectedProducts(detectionStats);
    printMissingImages(detectionStats);
    printMissingSummaries(detectionStats);
    printDetailedTable(detectionStats);
    await printDatabaseInfo();
    await printLabelSummary();
    printSummaryReport(stats);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, "red");
    log(`Stack: ${error.stack}`, "red");
  } finally {
    // Always close the DB connection cleanly
    await mongoose.connection.close();
    log("Database connection closed.\n", "blue");
    process.exit(0);
  }
};

// ─────────────────────────────────────────────
//  Execute & Export
// ─────────────────────────────────────────────

getMongoDBSummary();

module.exports = { getInventorySummary, makeSentence, getMongoDBSummary };
