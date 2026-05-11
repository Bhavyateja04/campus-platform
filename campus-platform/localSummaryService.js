/**
 * Local Summary Generation Service
 * Generates inventory summaries using only product data and Roboflow detections
 * No external AI APIs required
 */

/**
 * Generate a detailed inventory analysis summary locally
 * @param {Object} product - Product data from MongoDB
 * @param {Object} detections - Formatted detections from Roboflow
 * @param {Array} similarProducts - Similar product names/IDs
 * @returns {Object} Analysis summary
 */
const generateInventorySummary = async (product, detections, similarProducts = []) => {
  try {
    const metadata = product.metadata || {};
    const price = metadata.price || "N/A";
    const stock = metadata.stock || "N/A";
    const warehouse = metadata.warehouse || "Unknown";

    // Generate local summary based on data
    const summary = `## Inventory Analysis Report: ${product.name} (SKU: ${product.sku})

### 1. Product Overview
- **Name:** ${product.name}
- **SKU:** ${product.sku || "N/A"}
- **Category:** ${product.category || "N/A"}
- **Description:** ${product.description || "N/A"}
- **Price:** $${price}
- **Current Stock:** ${stock} units
- **Warehouse Location:** ${warehouse}

### 2. Visual Analysis
**AI Detection Results from Roboflow:**
- **Total Objects Detected:** ${detections.count}
- **Detected Classes:** ${
      detections.classes.length > 0
        ? detections.classes.map((c) => `${c.name} (${c.count}x)`).join(", ")
        : "None"
    }
- **Detection Status:** ${detections.count > 0 ? "✅ Objects identified in image" : "⚠️ No objects detected"}

${
  detections.count > 0
    ? `**Key Observations:**
- The product image contains identifiable objects
- AI model confidence may vary based on image quality
- Detection results useful for inventory verification`
    : `**Assessment:**
- Image processing completed successfully
- No specific objects were identified by the detection model
- This could indicate: generic product photos, placeholder images, or items difficult for the model to categorize`
}

### 3. Inventory Insights
**Stock Analysis:**
- **Current Level:** ${stock} units
- **Price Point:** $${price} (${
      price > 100 ? "Premium" : price > 50 ? "Mid-range" : "Budget"
    } category)
- **Storage:** ${warehouse}

**Assessment:**
${
  stock > 100
    ? "✅ Good stock levels - Low restocking risk"
    : stock > 20
      ? "✅ Adequate stock - Monitor for trends"
      : stock > 5
        ? "⚠️ Moderate stock - Plan restocking soon"
        : "🔴 Low stock - Urgent restocking needed"
}

### 4. Similar Product Matches
${
  similarProducts.length > 0
    ? similarProducts.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "No similar products linked in current inventory"
}

### 5. Recommendations

**Immediate Actions:**
${
  stock < 10
    ? "1. **Urgent Restocking** - Stock level is low, initiate procurement immediately"
    : "1. **Stock Monitoring** - Continue monitoring sales velocity"
}
2. **Image Verification** - Review product image quality for better AI detection
${
  detections.count === 0
    ? "3. **Detection Enhancement** - Consider uploading clearer product images"
    : "3. **Detection Validation** - AI detection working well, maintain image quality"
}

**Strategic Improvements:**
- **Categorization:** Ensure correct category assignment for inventory management
- **Metadata:** Keep pricing and warehouse information updated
- **Image Quality:** Maintain high-quality product images for better detection accuracy
${
  price > 500
    ? "- **Security:** Premium item - implement additional security measures"
    : ""
}

**Performance Metrics:**
- Detection Score: ${detections.count > 0 ? "✅ Good" : "⚠️ Needs improvement"}
- Stock Health: ${
      stock > 50
        ? "✅ Excellent"
        : stock > 20
          ? "✅ Good"
          : stock > 5
            ? "⚠️ Moderate"
            : "🔴 Critical"
    }
- Category Alignment: ✅ Proper

---
*Report Generated: ${new Date().toLocaleString()}*
*Data Source: MongoDB Inventory + Roboflow Image Detection*
*No external AI services used - Analysis based on product data and detection results*`;

    return {
      success: true,
      summary: summary,
      generatedAt: new Date().toISOString(),
      method: "Local Generation",
    };
  } catch (error) {
    console.error("Local summary generation error:", error.message);
    return {
      success: false,
      error: error.message,
      summary: null,
    };
  }
};

/**
 * Generate a batch summary for multiple products locally
 * @param {Array} products - Array of products with their detections
 * @returns {Object} Batch summary
 */
const generateBatchSummary = async (products) => {
  try {
    // Analyze product statistics
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.metadata?.stock || 0), 0);
    const avgPrice =
      products.reduce((sum, p) => sum + (p.metadata?.price || 0), 0) / totalProducts;
    const totalDetections = products.reduce((sum, p) => sum + p.detections.count, 0);

    // Category breakdown
    const categories = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = { count: 0, stock: 0, price: 0 };
      categories[cat].count++;
      categories[cat].stock += p.metadata?.stock || 0;
      categories[cat].price += p.metadata?.price || 0;
    });

    // Detect low stock items
    const lowStockItems = products.filter((p) => (p.metadata?.stock || 0) < 10);
    const highValueItems = products.filter((p) => (p.metadata?.price || 0) > 500);

    const batchSummary = `## Inventory Management Report - Comprehensive Analysis

### 1. Overall Inventory Health

**Key Metrics:**
- **Total Products:** ${totalProducts}
- **Total Units in Stock:** ${totalStock} units
- **Average Price per Product:** $${avgPrice.toFixed(2)}
- **Total Detection Count:** ${totalDetections} objects identified

**Health Status:** ${
      totalStock > totalProducts * 20
        ? "✅ EXCELLENT - Strong inventory levels"
        : totalStock > totalProducts * 10
          ? "✅ GOOD - Healthy stock distribution"
          : "⚠️ CAUTION - Monitor stock levels closely"
    }

### 2. Category Breakdown

${Object.entries(categories)
  .map(([category, data]) => {
    const avgCatPrice = (data.price / data.count).toFixed(2);
    const avgCatStock = Math.round(data.stock / data.count);
    return `**${category}** (${data.count} products)
  - Total Stock: ${data.stock} units
  - Average Price: $${avgCatPrice}
  - Average Stock per Item: ${avgCatStock} units
  - Health: ${
    avgCatStock > 20 ? "✅ Good" : avgCatStock > 10 ? "✅ Acceptable" : "⚠️ Low"
  }`;
  })
  .join("\n\n")}

### 3. Critical Alerts

${
  lowStockItems.length > 0
    ? `**🔴 Low Stock Items (< 10 units):**
${lowStockItems.map((p) => `  - ${p.name} (SKU: ${p.sku}) - ${p.metadata?.stock || 0} units`).join("\n")}

**Action Required:** Initiate restocking for these critical items`
    : `**✅ No Low Stock Items** - All products have adequate inventory`
}

${
  highValueItems.length > 0
    ? `\n**💎 High-Value Items (> $500):**
${highValueItems.map((p) => `  - ${p.name} (SKU: ${p.sku}) - $${p.metadata?.price || 0}`).join("\n")}

**Note:** Implement additional security and tracking for premium items`
    : ""
}

### 4. Detection Analysis

**AI Detection Results:**
- **Total Objects Detected:** ${totalDetections}
- **Products with Detections:** ${products.filter((p) => p.detections.count > 0).length}/${totalProducts}
- **Detection Rate:** ${((products.filter((p) => p.detections.count > 0).length / totalProducts) * 100).toFixed(1)}%

**Assessment:**
${
  totalDetections > 0
    ? "✅ Image detection system is working well"
    : "⚠️ Consider improving image quality for better detection"
}

### 5. Recommended Action Items

**Priority 1 - Immediate (This Week):**
${
  lowStockItems.length > 0
    ? `1. Restock ${lowStockItems.length} low-inventory items
2. Review demand forecasts for these products
3. Contact suppliers for expedited delivery`
    : `1. Continue monitoring current stock levels
2. Analyze sales trends from past week
3. Plan upcoming procurement cycles`
}

**Priority 2 - Short-term (Next 2 Weeks):**
1. Audit physical inventory against database records
2. Update product images if detection quality is low
3. Review warehouse organization and access
${
  highValueItems.length > 0
    ? `4. Verify security measures for ${highValueItems.length} high-value items`
    : ""
}

**Priority 3 - Long-term (Monthly):**
1. Analyze sales velocity by category
2. Optimize pricing strategy based on stock levels
3. Plan seasonal inventory adjustments
4. Review supplier performance and lead times

### 6. Financial Overview

**Inventory Value:**
- **Total Inventory Value:** $${(
      products.reduce((sum, p) => sum + (p.metadata?.price || 0) * (p.metadata?.stock || 0), 0)
    ).toFixed(2)}
- **Average Investment per SKU:** $${(
      products.reduce((sum, p) => sum + (p.metadata?.price || 0) * (p.metadata?.stock || 0), 0) / totalProducts
    ).toFixed(2)}
- **Total SKUs Managed:** ${totalProducts}

**Risk Assessment:**
${
  lowStockItems.length > 0
    ? "🟡 MEDIUM RISK - Some items near critical levels"
    : "🟢 LOW RISK - Healthy stock distribution"
}

### 7. Performance Summary

| Metric | Status | Value |
|--------|--------|-------|
| Inventory Health | ${totalStock > totalProducts * 10 ? "✅ Good" : "⚠️ Monitor"} | ${totalStock} units |
| Detection System | ✅ Working | ${totalDetections} objects found |
| Low Stock Items | ${lowStockItems.length === 0 ? "✅ None" : "⚠️ " + lowStockItems.length} | ${
      lowStockItems.length === 0 ? "All clear" : lowStockItems.length + " items"
    } |
| High Value Items | 💎 Being Monitored | ${highValueItems.length} items |

---
*Comprehensive Inventory Analysis Report*
*Generated: ${new Date().toLocaleString()}*
*Data Source: MongoDB Inventory Database + Roboflow Image Detection*
*Analysis Method: Local Data-Driven Generation (No External AI APIs)*`;

    return {
      success: true,
      batchSummary: batchSummary,
      productCount: products.length,
      generatedAt: new Date().toISOString(),
      method: "Local Generation",
    };
  } catch (error) {
    console.error("Local batch summary generation error:", error.message);
    return {
      success: false,
      error: error.message,
      batchSummary: null,
    };
  }
};

module.exports = {
  generateInventorySummary,
  generateBatchSummary,
};
