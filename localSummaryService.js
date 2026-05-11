/**
 * @fileoverview Local summary generation service.
 * Produces inventory analysis reports using only MongoDB product data
 * and Roboflow detection results — no external AI APIs required.
 *
 * Exports:
 *   generateInventorySummary(product, detections, similarProducts) → { success, summary, ... }
 *   generateBatchSummary(products)                                 → { success, batchSummary, ... }
 */

// ─────────────────────────────────────────────
//  Helper: Label Builders
//  Small pure functions that map data values
//  to human-readable labels. Extracted here so
//  the template strings stay clean and readable.
// ─────────────────────────────────────────────

/**
 * Returns a price-tier label based on numeric price.
 * @param {number} price
 * @returns {string}
 */
const priceTier = (price) => {
  if (price > 100) return "Premium";
  if (price > 50)  return "Mid-range";
  return "Budget";
};

/**
 * Returns a stock-health label and emoji based on unit count.
 * @param {number} stock
 * @returns {string}
 */
const stockHealthLabel = (stock) => {
  if (stock > 100) return "✅ Good stock levels — Low restocking risk";
  if (stock > 20)  return "✅ Adequate stock — Monitor for trends";
  if (stock > 5)   return "⚠️  Moderate stock — Plan restocking soon";
  return                  "🔴 Low stock — Urgent restocking needed";
};

/**
 * Returns a performance-tier label (Excellent / Good / Moderate / Critical).
 * @param {number} stock
 * @returns {string}
 */
const stockPerformanceLabel = (stock) => {
  if (stock > 50) return "✅ Excellent";
  if (stock > 20) return "✅ Good";
  if (stock > 5)  return "⚠️  Moderate";
  return                 "🔴 Critical";
};

/**
 * Returns an overall inventory health label for a batch.
 * Compares total stock against a per-product threshold.
 * @param {number} totalStock
 * @param {number} totalProducts
 * @returns {string}
 */
const batchHealthLabel = (totalStock, totalProducts) => {
  if (totalStock > totalProducts * 20) return "✅ EXCELLENT — Strong inventory levels";
  if (totalStock > totalProducts * 10) return "✅ GOOD — Healthy stock distribution";
  return                                      "⚠️  CAUTION — Monitor stock levels closely";
};

/**
 * Returns a category-level average-stock health label.
 * @param {number} avgStock
 * @returns {string}
 */
const categoryHealthLabel = (avgStock) => {
  if (avgStock > 20) return "✅ Good";
  if (avgStock > 10) return "✅ Acceptable";
  return                    "⚠️  Low";
};

// ─────────────────────────────────────────────
//  Helper: Report Section Builders
//  Each function returns a self-contained
//  Markdown string for one report section.
// ─────────────────────────────────────────────

/**
 * Builds the "Visual Analysis" section of a single-product report.
 * @param {object} detections - Formatted Roboflow detections
 * @returns {string} Markdown section
 */
const buildVisualAnalysisSection = (detections) => {
  const detectedClasses = detections.classes.length > 0
    ? detections.classes.map((c) => `${c.name} (${c.count}x)`).join(", ")
    : "None";

  const assessment = detections.count > 0
    ? `**Key Observations:**
- The product image contains identifiable objects
- AI model confidence may vary based on image quality
- Detection results useful for inventory verification`
    : `**Assessment:**
- Image processing completed successfully
- No specific objects were identified by the detection model
- Possible causes: generic product photos, placeholder images, or model limitations`;

  return `### 2. Visual Analysis
**AI Detection Results from Roboflow:**
- **Total Objects Detected:** ${detections.count}
- **Detected Classes:**       ${detectedClasses}
- **Detection Status:**       ${detections.count > 0 ? "✅ Objects identified" : "⚠️  No objects detected"}

${assessment}`;
};

/**
 * Builds the "Recommendations" section of a single-product report.
 * @param {number} stock
 * @param {number} detectionCount
 * @param {number} price
 * @returns {string} Markdown section
 */
const buildRecommendationsSection = (stock, detectionCount, price) => {
  const stockAction = stock < 10
    ? "1. **Urgent Restocking** — Stock is critically low; initiate procurement immediately"
    : "1. **Stock Monitoring** — Continue monitoring sales velocity";

  const detectionAction = detectionCount === 0
    ? "3. **Detection Enhancement** — Consider uploading clearer product images"
    : "3. **Detection Validation** — AI detection working well; maintain image quality";

  const securityNote = price > 500
    ? "\n- **Security:** Premium item — implement additional security measures"
    : "";

  return `### 5. Recommendations

**Immediate Actions:**
${stockAction}
2. **Image Verification** — Review product image quality for better AI detection
${detectionAction}

**Strategic Improvements:**
- **Categorization:** Ensure correct category assignment for inventory management
- **Metadata:** Keep pricing and warehouse information up to date
- **Image Quality:** Maintain high-quality product images for better detection accuracy${securityNote}

**Performance Metrics:**
- Detection Score: ${detectionCount > 0 ? "✅ Good" : "⚠️  Needs improvement"}
- Stock Health:    ${stockPerformanceLabel(stock)}
- Category:        ✅ Properly assigned`;
};

/**
 * Builds the category-breakdown section of the batch report.
 * @param {object} categories - Map of category name → { count, stock, price }
 * @returns {string} Markdown section
 */
const buildCategorySection = (categories) => {
  const rows = Object.entries(categories).map(([category, data]) => {
    const avgPrice = (data.price / data.count).toFixed(2);
    const avgStock = Math.round(data.stock / data.count);
    return `**${category}** (${data.count} product${data.count !== 1 ? "s" : ""})
  - Total Stock:            ${data.stock} units
  - Average Price:          $${avgPrice}
  - Average Stock per Item: ${avgStock} units
  - Health:                 ${categoryHealthLabel(avgStock)}`;
  });

  return `### 2. Category Breakdown\n\n${rows.join("\n\n")}`;
};

/**
 * Builds the critical-alerts section of the batch report.
 * @param {Array} lowStockItems
 * @param {Array} highValueItems
 * @returns {string} Markdown section
 */
const buildAlertsSection = (lowStockItems, highValueItems) => {
  const lowStockBlock = lowStockItems.length > 0
    ? `**🔴 Low Stock Items (< 10 units):**
${lowStockItems.map((p) => `  - ${p.name} (SKU: ${p.sku}) — ${p.metadata?.stock || 0} units`).join("\n")}

**Action Required:** Initiate restocking for these critical items`
    : "**✅ No Low Stock Items** — All products have adequate inventory";

  const highValueBlock = highValueItems.length > 0
    ? `\n\n**💎 High-Value Items (> $500):**
${highValueItems.map((p) => `  - ${p.name} (SKU: ${p.sku}) — $${p.metadata?.price || 0}`).join("\n")}

**Note:** Implement additional security and tracking for premium items`
    : "";

  return `### 3. Critical Alerts\n\n${lowStockBlock}${highValueBlock}`;
};

/**
 * Builds the action-items section of the batch report.
 * @param {Array}  lowStockItems
 * @param {Array}  highValueItems
 * @returns {string} Markdown section
 */
const buildActionItemsSection = (lowStockItems, highValueItems) => {
  const priority1 = lowStockItems.length > 0
    ? `1. Restock ${lowStockItems.length} low-inventory item${lowStockItems.length !== 1 ? "s" : ""}
2. Review demand forecasts for these products
3. Contact suppliers for expedited delivery`
    : `1. Continue monitoring current stock levels
2. Analyse sales trends from the past week
3. Plan upcoming procurement cycles`;

  const highValueRow = highValueItems.length > 0
    ? `\n4. Verify security measures for ${highValueItems.length} high-value item${highValueItems.length !== 1 ? "s" : ""}`
    : "";

  return `### 5. Recommended Action Items

**Priority 1 — Immediate (This Week):**
${priority1}

**Priority 2 — Short-term (Next 2 Weeks):**
1. Audit physical inventory against database records
2. Update product images if detection quality is low
3. Review warehouse organisation and access${highValueRow}

**Priority 3 — Long-term (Monthly):**
1. Analyse sales velocity by category
2. Optimise pricing strategy based on stock levels
3. Plan seasonal inventory adjustments
4. Review supplier performance and lead times`;
};

// ─────────────────────────────────────────────
//  Main: Single-Product Summary
// ─────────────────────────────────────────────

/**
 * Generates a detailed Markdown analysis report for a single product.
 *
 * @param {object}   product                  - Mongoose Product document
 * @param {object}   detections               - Formatted Roboflow detections
 * @param {string[]} [similarProducts=[]]     - Similar product names or IDs
 * @returns {Promise<{ success: boolean, summary: string|null, generatedAt: string, method: string }>}
 */
const generateInventorySummary = async (product, detections, similarProducts = []) => {
  try {
    const { price = "N/A", stock = "N/A", warehouse = "Unknown" } = product.metadata || {};

    const similarList = similarProducts.length > 0
      ? similarProducts.map((p, i) => `${i + 1}. ${p}`).join("\n")
      : "No similar products linked in current inventory";

    const summary = `## Inventory Analysis Report: ${product.name} (SKU: ${product.sku})

### 1. Product Overview
- **Name:**               ${product.name}
- **SKU:**                ${product.sku        || "N/A"}
- **Category:**           ${product.category   || "N/A"}
- **Description:**        ${product.description || "N/A"}
- **Price:**              $${price}
- **Current Stock:**      ${stock} units
- **Warehouse Location:** ${warehouse}

${buildVisualAnalysisSection(detections)}

### 3. Inventory Insights
**Stock Analysis:**
- **Current Level:** ${stock} units
- **Price Point:**   $${price} (${priceTier(price)} category)
- **Storage:**       ${warehouse}

**Assessment:** ${stockHealthLabel(stock)}

### 4. Similar Product Matches
${similarList}

${buildRecommendationsSection(stock, detections.count, price)}

---
*Report Generated: ${new Date().toLocaleString()}*
*Data Source: MongoDB Inventory + Roboflow Image Detection*
*Analysis Method: Local data-driven generation — no external AI APIs used*`;

    return {
      success:     true,
      summary,
      generatedAt: new Date().toISOString(),
      method:      "Local Generation",
    };
  } catch (error) {
    console.error("Single-product summary error:", error.message);
    return { success: false, error: error.message, summary: null };
  }
};

// ─────────────────────────────────────────────
//  Main: Batch Summary
// ─────────────────────────────────────────────

/**
 * Generates a comprehensive Markdown batch report across multiple products.
 *
 * @param {Array<object>} products - Product documents each with a `detections` field attached
 * @returns {Promise<{ success: boolean, batchSummary: string|null, productCount: number, generatedAt: string, method: string }>}
 */
const generateBatchSummary = async (products) => {
  try {
    const totalProducts   = products.length;
    const totalStock      = products.reduce((sum, p) => sum + (p.metadata?.stock || 0), 0);
    const totalValue      = products.reduce((sum, p) => sum + (p.metadata?.price || 0) * (p.metadata?.stock || 0), 0);
    const avgPrice        = products.reduce((sum, p) => sum + (p.metadata?.price || 0), 0) / totalProducts;
    const totalDetections = products.reduce((sum, p) => sum + p.detections.count, 0);
    const detectedCount   = products.filter((p) => p.detections.count > 0).length;
    const detectionRate   = ((detectedCount / totalProducts) * 100).toFixed(1);

    // Group by category
    const categories = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = { count: 0, stock: 0, price: 0 };
      categories[cat].count++;
      categories[cat].stock += p.metadata?.stock || 0;
      categories[cat].price += p.metadata?.price || 0;
    });

    const lowStockItems  = products.filter((p) => (p.metadata?.stock || 0) < 10);
    const highValueItems = products.filter((p) => (p.metadata?.price || 0) > 500);

    const batchSummary = `## Inventory Management Report — Comprehensive Analysis

### 1. Overall Inventory Health

**Key Metrics:**
- **Total Products:**              ${totalProducts}
- **Total Units in Stock:**        ${totalStock} units
- **Average Price per Product:**   $${avgPrice.toFixed(2)}
- **Total Objects Detected:**      ${totalDetections}

**Health Status:** ${batchHealthLabel(totalStock, totalProducts)}

${buildCategorySection(categories)}

${buildAlertsSection(lowStockItems, highValueItems)}

### 4. Detection Analysis

**AI Detection Results:**
- **Total Objects Detected:**      ${totalDetections}
- **Products with Detections:**    ${detectedCount}/${totalProducts}
- **Detection Rate:**              ${detectionRate}%

**Assessment:** ${totalDetections > 0
  ? "✅ Image detection system is working well"
  : "⚠️  Consider improving image quality for better detection"}

${buildActionItemsSection(lowStockItems, highValueItems)}

### 6. Financial Overview

**Inventory Value:**
- **Total Inventory Value:**       $${totalValue.toFixed(2)}
- **Average Value per SKU:**       $${(totalValue / totalProducts).toFixed(2)}
- **Total SKUs Managed:**          ${totalProducts}

**Risk Assessment:** ${lowStockItems.length > 0
  ? "🟡 MEDIUM RISK — Some items near critical levels"
  : "🟢 LOW RISK — Healthy stock distribution"}

### 7. Performance Summary

| Metric              | Status                                                                  | Value                                                                |
|---------------------|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| Inventory Health    | ${totalStock > totalProducts * 10 ? "✅ Good"    : "⚠️  Monitor"}        | ${totalStock} units                                                  |
| Detection System    | ✅ Working                                                               | ${totalDetections} objects found                                     |
| Low Stock Items     | ${lowStockItems.length  === 0 ? "✅ None"   : "⚠️  " + lowStockItems.length}  | ${lowStockItems.length  === 0 ? "All clear" : lowStockItems.length  + " items"} |
| High-Value Items    | 💎 Monitored                                                             | ${highValueItems.length} item${highValueItems.length !== 1 ? "s" : ""}   |

---
*Comprehensive Inventory Analysis Report*
*Generated:       ${new Date().toLocaleString()}*
*Data Source:     MongoDB Inventory Database + Roboflow Image Detection*
*Analysis Method: Local data-driven generation — no external AI APIs used*`;

    return {
      success:      true,
      batchSummary,
      productCount: totalProducts,
      generatedAt:  new Date().toISOString(),
      method:       "Local Generation",
    };
  } catch (error) {
    console.error("Batch summary generation error:", error.message);
    return { success: false, error: error.message, batchSummary: null };
  }
};

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────

module.exports = { generateInventorySummary, generateBatchSummary };
