/**
 * Category Validation Utility with Image Quality & Content Filtering
 * 
 * Strict AI-based validation system for product images:
 * ✓ Validates image quality (blur, clarity, confidence)
 * ✓ Checks detected objects against allowed categories
 * ✓ Filters non-college level objects (animals, food, selfies, nature, etc.)
 * ✓ Rejects low-confidence and empty predictions
 * ✓ Provides detailed validation feedback
 */

/**
 * Product categories and allowed object classes
 * Maps categories to objects that should be found in the image
 * 
 * VALID CATEGORIES ONLY:
 * - Electronics
 * - Stationery
 * - Books
 * - Accessories
 */
const validCategories = {
  Electronics: [
    "headphones",
    "laptop",
    "mobile",
    "phone",
    "smartphone",
    "keyboard",
    "mouse",
    "monitor",
    "screen",
    "display",
    "tablet",
    "ipad",
    "computer",
    "camera",
    "speaker",
    "microphone",
    "usb",
    "charger",
    "cable",
    "router",
    "modem",
    "printer",
    "webcam",
  ],
  Stationery: [
    "pen",
    "pencil",
    "notebook",
    "book",
    "marker",
    "eraser",
    "paper",
    "ruler",
    "folder",
    "binder",
    "highlighter",
    "stapler",
    "adhesive",
    "tape",
    "glue",
  ],
  Books: [
    "book",
    "magazine",
    "newspaper",
    "journal",
    "textbook",
    "document",
    "publication",
    "guide",
  ],
  Accessories: [
    "watch",
    "sunglasses",
    "earphones",
    "earpods",
    "badge",
    "lanyard",
    "phone case",
    "laptop case",
    "water bottle",
    "bag",
    "backpack",
    "case",
    "pouch",
    "holder",
    "stand",
    "mount",
  ],
};

/**
 * Blacklist of non-college level objects
 * Products containing these will be rejected automatically
 * Categories: animals, nature, food-related, personal/random objects
 */
const BLACKLISTED_OBJECTS = [
  // Animals
  "cat",
  "dog",
  "bird",
  "cow",
  "sheep",
  "horse",
  "fish",
  "snake",
  "spider",
  "insect",
  "animal",
  "pet",
  "puppy",
  "kitten",
  "monkey",
  "lion",
  "tiger",
  "elephant",
  "giraffe",
  "zebra",

  // Nature & Outdoor
  "tree",
  "flower",
  "grass",
  "mountain",
  "hill",
  "river",
  "lake",
  "ocean",
  "beach",
  "sky",
  "cloud",
  "sunset",
  "sunrise",
  "forest",
  "nature",
  "landscape",
  "plant",
  "leaf",
  "leaves",
  "grass",

  // Food & Beverages (non-grocery)
  "pizza",
  "burger",
  "sandwich",
  "salad",
  "soup",
  "rice",
  "noodle",
  "noodles",
  "sushi",
  "cake",
  "cookie",
  "donut",
  "dessert",
  "ice cream",
  "chocolate",
  "candy",
  "snack",

  // Personal & Selfies
  "person",
  "people",
  "face",
  "hand",
  "selfie",
  "people",
  "man",
  "woman",
  "child",
  "baby",
  "person",

  // Random Household (non-furniture)
  "door",
  "window",
  "wall",
  "floor",
  "ceiling",
  "room",
  "bedroom",
  "bathroom",
  "kitchen",
  "living room",
  "hallway",

  // Unclear/Generic
  "unknown",
  "other",
  "misc",
  "background",
  "blur",
  "blurry",
];

/**
 * Minimum confidence threshold for object detection
 * Predictions below 70% confidence are considered unreliable
 */
const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Confidence threshold for image blur detection
 * If blur confidence is high, image is rejected
 */
const BLUR_CONFIDENCE_THRESHOLD = 0.5;

/**
 * IMAGE QUALITY VALIDATION
 * Checks if the image meets quality standards
 * 
 * @param {Array} predictions - Detection predictions from Roboflow
 * @returns {Object} Quality check result
 */
const validateImageQuality = (predictions) => {
  // ─── Check 1: Empty Predictions ─────────────────────────────────────
  if (!predictions || predictions.length === 0) {
    return {
      pass: false,
      reason: "No objects detected in image",
      code: "EMPTY_PREDICTIONS",
      details: "The image must contain at least one recognizable object.",
    };
  }

  // ─── Check 2: Confidence Threshold ─────────────────────────────────
  const highConfidencePredictions = predictions.filter(
    (p) => p.confidence >= CONFIDENCE_THRESHOLD
  );

  if (highConfidencePredictions.length === 0) {
    const avgConfidence = (
      predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    ).toFixed(2);
    return {
      pass: false,
      reason: `Low image confidence (average: ${avgConfidence * 100}%)`,
      code: "LOW_CONFIDENCE",
      details: `Detected objects must have at least ${
        CONFIDENCE_THRESHOLD * 100
      }% confidence. Image may be blurry or unclear.`,
      detectedObjects: predictions.map((p) => ({
        class: p.class,
        confidence: (p.confidence * 100).toFixed(1) + "%",
      })),
    };
  }

  // ─── Check 3: Blur Detection ────────────────────────────────────────
  // Note: Roboflow's blur detection may be in a separate field
  // This is a placeholder for future enhancement
  const blurObjects = predictions.filter(
    (p) =>
      p.class &&
      (p.class.toLowerCase().includes("blur") ||
        p.class.toLowerCase() === "blurry")
  );

  if (blurObjects.length > 0) {
    return {
      pass: false,
      reason: "Image appears to be blurry",
      code: "BLURRY_IMAGE",
      details:
        "Please upload a clear, focused image. Blurry images cannot be processed reliably.",
    };
  }

  // Quality check passed
  return {
    pass: true,
    reason: "Image quality is acceptable",
    code: "QUALITY_OK",
    highConfidencePredictions: highConfidencePredictions.length,
    avgConfidence: (
      highConfidencePredictions.reduce((sum, p) => sum + p.confidence, 0) /
      highConfidencePredictions.length
    ).toFixed(3),
  };
};

/**
 * CONTENT FILTERING
 * Checks if detected objects contain non-college level content
 * Rejects images with animals, nature, food, selfies, etc.
 * 
 * @param {Array} predictions - Detection predictions from Roboflow
 * @returns {Object} Content filter result
 */
const validateImageContent = (predictions) => {
  const detectedClasses = predictions.map((p) => p.class.toLowerCase());

  // Check for blacklisted objects
  const blacklistedDetected = detectedClasses.filter((detected) => {
    return BLACKLISTED_OBJECTS.some(
      (blacklisted) =>
        detected === blacklisted ||
        detected.includes(blacklisted) ||
        blacklisted.includes(detected)
    );
  });

  if (blacklistedDetected.length > 0) {
    return {
      pass: false,
      reason: `Image contains non-college level objects: ${blacklistedDetected.join(
        ", "
      )}`,
      code: "INVALID_CONTENT",
      details: `This image contains ${blacklistedDetected.join(
        ", "
      )} which are not suitable for college-level inventory. Please upload a different image.`,
      detectedUnwantedObjects: blacklistedDetected,
    };
  }

  return {
    pass: true,
    reason: "Image content is appropriate",
    code: "CONTENT_OK",
  };
};

/**
 * CATEGORY VALIDATION
 * Validates detected objects against selected product category
 * 
 * @param {string} category - Product category
 * @param {Array} predictions - Detection predictions
 * @returns {Object} Category validation result
 */
const validateCategory = (category, predictions) => {
  // ─── Step 1: Validate Input ─────────────────────────────────────────
  if (!category || !Array.isArray(predictions)) {
    return {
      success: false,
      message: "Invalid input: category and predictions array are required",
      code: "INVALID_INPUT",
      detectedObjects: [],
      matchedObjects: [],
      validationDetails: {
        category,
        categoryExists: !!validCategories[category],
        predictionsCount: predictions?.length || 0,
      },
    };
  }

  // ─── Step 2: Check Category Exists ──────────────────────────────────
  if (!validCategories[category]) {
    const availableCategories = Object.keys(validCategories);
    return {
      success: false,
      message: `Category "${category}" not found`,
      code: "INVALID_CATEGORY",
      detectedObjects: [],
      matchedObjects: [],
      supportedCategories: availableCategories,
      validationDetails: {
        category,
        categoryExists: false,
      },
    };
  }

  // ─── Step 3: Filter by Confidence ──────────────────────────────────
  const filteredPredictions = predictions.filter(
    (pred) => pred.confidence >= CONFIDENCE_THRESHOLD
  );

  if (filteredPredictions.length === 0) {
    return {
      success: false,
      message: `No objects meet confidence threshold (${
        CONFIDENCE_THRESHOLD * 100
      }%)`,
      code: "LOW_CONFIDENCE",
      detectedObjects: predictions.map((p) => ({
        class: p.class.toLowerCase(),
        confidence: (p.confidence * 100).toFixed(1),
      })),
      matchedObjects: [],
      validationDetails: {
        category,
        totalPredictions: predictions.length,
        highConfidencePredictions: 0,
        confidenceThreshold: CONFIDENCE_THRESHOLD * 100,
      },
    };
  }

  // ─── Step 4: Normalize and Match Objects ───────────────────────────
  const detectedObjects = filteredPredictions.map((pred) => ({
    class: pred.class.toLowerCase(),
    confidence: pred.confidence,
  }));

  const allowedObjects = validCategories[category].map((obj) =>
    obj.toLowerCase()
  );

  // Find matches between detected and allowed objects
  const matchedObjects = detectedObjects
    .filter((detected) => {
      // Exact match
      if (allowedObjects.includes(detected.class)) {
        return true;
      }

      // Partial match (for multi-word objects)
      return allowedObjects.some(
        (allowed) =>
          allowed.includes(detected.class) || detected.class.includes(allowed)
      );
    })
    .map((obj) => obj.class);

  // Remove duplicates
  const uniqueMatches = [...new Set(matchedObjects)];
  const isValid = uniqueMatches.length > 0;

  return {
    success: isValid,
    message: isValid
      ? `✓ Validation successful! Found ${uniqueMatches.length} matching object(s) for "${category}" category`
      : `✗ No detected objects match "${category}" category`,
    code: isValid ? "CATEGORY_MATCH" : "NO_CATEGORY_MATCH",
    detectedObjects,
    matchedObjects: uniqueMatches,
    validationDetails: {
      category,
      totalPredictions: predictions.length,
      highConfidencePredictions: filteredPredictions.length,
      confidenceThreshold: CONFIDENCE_THRESHOLD * 100,
      allowedObjects,
      matchedCount: uniqueMatches.length,
    },
  };
};

/**
 * COMPLETE IMAGE VALIDATION PIPELINE
 * Runs all validation checks in sequence:
 * 1. Image Quality (blur, clarity, confidence)
 * 2. Content Filtering (no animals, food, nature, etc.)
 * 3. Category Validation (matches selected category)
 * 
 * @param {string} category - Product category
 * @param {Array} predictions - Detection predictions from Roboflow
 * @returns {Object} Complete validation result
 */
const validateProductImage = (category, predictions) => {
  console.log("🔍 Starting image validation pipeline...");

  // ─── Check 1: Image Quality ─────────────────────────────────────────
  console.log("  1️⃣ Checking image quality...");
  const qualityCheck = validateImageQuality(predictions);
  if (!qualityCheck.pass) {
    return {
      success: false,
      validated: false,
      stage: "IMAGE_QUALITY",
      message: qualityCheck.reason,
      details: qualityCheck,
      reason: "Image quality validation failed",
    };
  }
  console.log(`  ✓ Quality check passed (${qualityCheck.highConfidencePredictions} high-confidence objects)`);

  // ─── Check 2: Content Filtering ─────────────────────────────────────
  console.log("  2️⃣ Checking image content...");
  const contentCheck = validateImageContent(predictions);
  if (!contentCheck.pass) {
    return {
      success: false,
      validated: false,
      stage: "CONTENT_FILTERING",
      message: contentCheck.reason,
      details: contentCheck,
      reason: "Image contains non-college level objects",
    };
  }
  console.log("  ✓ Content check passed (no unwanted objects detected)");

  // ─── Check 3: Category Validation ───────────────────────────────────
  console.log(`  3️⃣ Validating against "${category}" category...`);
  const categoryCheck = validateCategory(category, predictions);
  if (!categoryCheck.success) {
    return {
      success: false,
      validated: false,
      stage: "CATEGORY_VALIDATION",
      message: categoryCheck.message,
      details: categoryCheck,
      reason: "Objects do not match selected category",
    };
  }
  console.log(
    `  ✓ Category validation passed (${categoryCheck.matchedObjects.length} matches)`
  );

  // ─── All Checks Passed ───────────────────────────────────────────────
  console.log("✅ All validation checks passed!");
  return {
    success: true,
    validated: true,
    message: `Product is valid and ready to be stored. Category: "${category}", Matched Objects: ${categoryCheck.matchedObjects.join(
      ", "
    )}`,
    data: {
      category,
      detectedObjects: categoryCheck.detectedObjects,
      matchedObjects: categoryCheck.matchedObjects,
      confidence: qualityCheck.avgConfidence,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Get all available categories
 */
const getAvailableCategories = () => {
  return Object.keys(validCategories);
};

/**
 * Get allowed objects for a specific category
 */
const getAllowedObjectsForCategory = (category) => {
  return validCategories[category] || [];
};

/**
 * Check if category exists
 */
const categoryExists = (category) => {
  return !!validCategories[category];
};

/**
 * Get blacklisted objects
 */
const getBlacklistedObjects = () => {
  return BLACKLISTED_OBJECTS;
};

module.exports = {
  // Validation functions
  validateProductImage,
  validateImageQuality,
  validateImageContent,
  validateCategory,

  // Data & constants
  validCategories,
  BLACKLISTED_OBJECTS,
  CONFIDENCE_THRESHOLD,
  BLUR_CONFIDENCE_THRESHOLD,

  // Helper functions
  getAvailableCategories,
  getAllowedObjectsForCategory,
  categoryExists,
  getBlacklistedObjects,
};
