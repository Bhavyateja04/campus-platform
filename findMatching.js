const mongoose = require('mongoose');
const Product = require('./Product');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║              🔍 MATCHING ITEMS & DUPLICATE IMAGE DETECTION                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    const products = await Product.find().select('name sku category imageUrl metadata analysisCache');

    // Find duplicate images
    console.log('📷 CHECKING FOR DUPLICATE IMAGES...\n');
    const imageMap = {};
    
    products.forEach(product => {
      if (!imageMap[product.imageUrl]) {
        imageMap[product.imageUrl] = [];
      }
      imageMap[product.imageUrl].push({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.metadata?.price || 'N/A',
        stock: product.metadata?.stock || 'N/A'
      });
    });

    let duplicateCount = 0;
    for (const [imageUrl, items] of Object.entries(imageMap)) {
      if (items.length > 1) {
        duplicateCount++;
        console.log('🔴 DUPLICATE IMAGE FOUND!');
        console.log('Image: ' + imageUrl.substring(0, 50) + '...');
        console.log('Used by ' + items.length + ' products:\n');
        items.forEach((item, idx) => {
          console.log('  ' + (idx + 1) + '. ' + item.name + ' (SKU: ' + item.sku + ')');
          console.log('     Category: ' + item.category + ' | Price: $' + item.price + ' | Stock: ' + item.stock);
        });
        console.log('');
      }
    }

    if (duplicateCount === 0) {
      console.log('✅ No duplicate images found\n');
    }

    // Find matching categories
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
    console.log('🎯 PRODUCTS BY CATEGORY (Grouped Similar Items)...\n');

    const categoryMap = {};
    products.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = [];
      }
      categoryMap[product.category].push({
        name: product.name,
        sku: product.sku,
        price: product.metadata?.price || 'N/A',
        stock: product.metadata?.stock || 'N/A',
        detections: product.analysisCache?.detections?.count || 0
      });
    });

    let categoryCount = 0;
    for (const [category, items] of Object.entries(categoryMap)) {
      categoryCount++;
      console.log('🟢 ' + category.toUpperCase());
      console.log('Items in this category: ' + items.length + '\n');
      items.forEach((item, idx) => {
        console.log('  ' + (idx + 1) + '. ' + item.name + ' (SKU: ' + item.sku + ')');
        console.log('     Price: $' + item.price + ' | Stock: ' + item.stock + ' | Detections: ' + item.detections);
      });
      console.log('');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
    console.log('📊 MATCHING SUMMARY:\n');
    console.log('  Duplicate Images:           ' + (duplicateCount > 0 ? '🔴 ' + duplicateCount + ' set(s) found' : '✅ None'));
    console.log('  Categories with Matches:    🟢 ' + categoryCount);
    console.log('  Total Products Analyzed:    ' + products.length);
    console.log('');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
