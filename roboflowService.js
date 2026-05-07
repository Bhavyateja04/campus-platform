const axios = require("axios");
const FormData = require("form-data");

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW = process.env.ROBOFLOW_WORKFLOW;
const ROBOFLOW_PROJECT_ID = process.env.ROBOFLOW_PROJECT_ID;
const ROBOFLOW_MODEL_VERSION = process.env.ROBOFLOW_MODEL_VERSION || 1;

/**
 * Detect objects in an image using Roboflow Inference API
 * @param {string} imageUrl - Public URL of the image
 * @returns {Object} Detection results
 */
const detectObjects = async (imageUrl) => {
  try {
    const response = await axios({
      method: "POST",
      url: `https://api.roboflow.com/api/workflows/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW}/run`,
      params: {
        api_key: ROBOFLOW_API_KEY,
      },
      data: {
        inputs: {
          image: imageUrl,
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      predictions: response.data.predictions || [],
      imageWidth: response.data.image?.width || null,
      imageHeight: response.data.image?.height || null,
      inferenceId: response.data.inference_id || null,
      time: response.data.time || null,
    };
  } catch (error) {
    console.error("Roboflow detection error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      predictions: [],
    };
  }
};

/**
 * Find similar images using Roboflow Search API
 * @param {string} imageUrl - Query image URL
 * @returns {Object} Similar images results
 */
const findSimilarImages = async (imageUrl) => {
  try {
    // Note: Similar image search may not be available via workflows API
    // This is a placeholder that returns empty results
    return {
      success: true,
      similar: [],
    };
  } catch (error) {
    console.error("Roboflow similarity error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      similar: [],
    };
  }
};

/**
 * Format detections into a readable structure for Gemini
 * @param {Array} predictions - Raw predictions from Roboflow
 * @returns {Object} Formatted detections summary
 */
const formatDetections = (predictions) => {
  if (!predictions || predictions.length === 0) {
    return { count: 0, classes: [], details: [] };
  }

  const classCounts = {};
  predictions.forEach((p) => {
    classCounts[p.class] = (classCounts[p.class] || 0) + 1;
  });

  return {
    count: predictions.length,
    classes: Object.entries(classCounts).map(([name, count]) => ({ name, count })),
    details: predictions.map((p) => ({
      class: p.class,
      confidence: (p.confidence * 100).toFixed(1) + "%",
      location: {
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
      },
    })),
  };
};

/**
 * Analyze an image - main entry point
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Object} Analysis results with predictions and formatted data
 */
const analyzeImage = async (imageUrl) => {
  const detectionResult = await detectObjects(imageUrl);
  
  if (!detectionResult.success) {
    return detectionResult;
  }

  return {
    ...detectionResult,
    formatted: formatDetections(detectionResult.predictions),
  };
};

module.exports = {
  analyzeImage,
  detectObjects,
  findSimilarImages,
  formatDetections,
};
