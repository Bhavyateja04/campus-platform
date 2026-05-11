/**
 * @fileoverview Roboflow integration service.
 * Handles object detection, similar-image search, and detection formatting
 * via the Roboflow Inference and Search APIs.
 *
 * Exports:
 *   detectObjects(imageUrl)      → { success, predictions, imageWidth, imageHeight, ... }
 *   findSimilarImages(imageUrl)  → { success, similar[] }
 *   formatDetections(predictions)→ { count, classes[], details[] }
 *   analyzeImage(imageUrl)       → { ...detectionResult, formatted }
 */

const axios = require("axios");

// ─────────────────────────────────────────────
//  Environment Configuration
// ─────────────────────────────────────────────

/**
 * Roboflow credentials and project identifiers.
 * All values must be set in .env — the service will not call the API
 * if ROBOFLOW_API_KEY is missing (see guard in detectObjects).
 */
const ROBOFLOW_API_KEY       = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_WORKSPACE     = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW      = process.env.ROBOFLOW_WORKFLOW;
const ROBOFLOW_PROJECT_ID    = process.env.ROBOFLOW_PROJECT_ID;    // Reserved for future use
const ROBOFLOW_MODEL_VERSION = process.env.ROBOFLOW_MODEL_VERSION || 1;

/** Base URL for the Roboflow Workflows Inference API */
const ROBOFLOW_INFERENCE_URL =
  `https://api.roboflow.com/api/workflows/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW}/run`;

// ─────────────────────────────────────────────
//  Helper: Normalise Axios Errors
// ─────────────────────────────────────────────

/**
 * Extracts a human-readable error message from an Axios error.
 * Prefers the API's own message over the generic network error.
 *
 * @param   {Error}  error - Caught error from an axios call
 * @returns {string} Readable error message
 */
const extractErrorMessage = (error) =>
  error.response?.data?.message || error.message;

// ─────────────────────────────────────────────
//  detectObjects
// ─────────────────────────────────────────────

/**
 * Sends an image URL to the Roboflow Inference API and returns raw predictions.
 *
 * @param   {string} imageUrl - Publicly accessible URL of the product image
 * @returns {Promise<{
 *   success:     boolean,
 *   predictions: Array,
 *   imageWidth:  number|null,
 *   imageHeight: number|null,
 *   inferenceId: string|null,
 *   time:        number|null,
 *   error?:      string
 * }>}
 */
const detectObjects = async (imageUrl) => {
  // Guard: fail fast if credentials are not configured
  if (!ROBOFLOW_API_KEY || !ROBOFLOW_WORKSPACE || !ROBOFLOW_WORKFLOW) {
    console.error("Roboflow detection skipped: missing environment variables.");
    return {
      success:     false,
      error:       "Roboflow credentials are not configured.",
      predictions: [],
    };
  }

  try {
    const response = await axios({
      method:  "POST",
      url:     ROBOFLOW_INFERENCE_URL,
      params:  { api_key: ROBOFLOW_API_KEY },
      headers: { "Content-Type": "application/json" },
      data:    { inputs: { image: imageUrl } },
    });

    const { data } = response;

    return {
      success:     true,
      predictions: data.predictions  || [],
      imageWidth:  data.image?.width  ?? null,
      imageHeight: data.image?.height ?? null,
      inferenceId: data.inference_id  ?? null,
      time:        data.time          ?? null,
    };
  } catch (error) {
    console.error("Roboflow detection error:", error.response?.data || error.message);
    return {
      success:     false,
      error:       extractErrorMessage(error),
      predictions: [],
    };
  }
};

// ─────────────────────────────────────────────
//  findSimilarImages
// ─────────────────────────────────────────────

/**
 * Searches for visually similar images in the Roboflow dataset.
 *
 * ⚠️  NOTE: The Roboflow similar-image search endpoint is not yet available
 *     via the Workflows API. This function is a placeholder that returns an
 *     empty result set. Replace the body with a real API call once supported.
 *
 * @param   {string} imageUrl - Query image URL
 * @returns {Promise<{ success: boolean, similar: Array, error?: string }>}
 */
const findSimilarImages = async (imageUrl) => {
  try {
    // TODO: Replace with real Roboflow similarity API call when available
    return {
      success: true,
      similar: [],
    };
  } catch (error) {
    console.error("Roboflow similarity error:", error.response?.data || error.message);
    return {
      success: false,
      error:   extractErrorMessage(error),
      similar: [],
    };
  }
};

// ─────────────────────────────────────────────
//  formatDetections
// ─────────────────────────────────────────────

/**
 * Transforms raw Roboflow predictions into a structured summary.
 * Groups predictions by class, counts occurrences, and normalises
 * confidence values to a percentage string.
 *
 * @param   {Array} predictions - Raw predictions array from Roboflow response
 * @returns {{
 *   count:   number,
 *   classes: Array<{ name: string, count: number }>,
 *   details: Array<{ class: string, confidence: string, location: object }>
 * }}
 */
const formatDetections = (predictions) => {
  if (!predictions || predictions.length === 0) {
    return { count: 0, classes: [], details: [] };
  }

  // Tally occurrences of each detected class
  const classCounts = {};
  predictions.forEach((p) => {
    classCounts[p.class] = (classCounts[p.class] || 0) + 1;
  });

  return {
    count:   predictions.length,
    classes: Object.entries(classCounts).map(([name, count]) => ({ name, count })),
    details: predictions.map((p) => ({
      class:      p.class,
      confidence: `${(p.confidence * 100).toFixed(1)}%`,
      location: {
        x:      p.x,
        y:      p.y,
        width:  p.width,
        height: p.height,
      },
    })),
  };
};

// ─────────────────────────────────────────────
//  analyzeImage  (main entry point)
// ─────────────────────────────────────────────

/**
 * Runs object detection on an image and appends formatted results.
 * Use this when you need both raw predictions and the structured summary
 * in a single call.
 *
 * @param   {string} imageUrl - Publicly accessible URL of the product image
 * @returns {Promise<object>} Detection result merged with a `formatted` field,
 *                            or the raw error result if detection failed
 */
const analyzeImage = async (imageUrl) => {
  const detectionResult = await detectObjects(imageUrl);

  // Propagate failure without attempting to format empty predictions
  if (!detectionResult.success) {
    return detectionResult;
  }

  return {
    ...detectionResult,
    formatted: formatDetections(detectionResult.predictions),
  };
};

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────

module.exports = {
  analyzeImage,
  detectObjects,
  findSimilarImages,
  formatDetections,
};
