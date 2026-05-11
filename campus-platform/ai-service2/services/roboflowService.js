const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Roboflow Service
 * Handles communication with the Roboflow API for image analysis.
 */
class RoboflowService {
  constructor() {
    this.apiKey = config.roboflow.apiKey;
    this.workspace = config.roboflow.workspace;
    this.modelId = config.roboflow.modelId;
    this.modelVersion = config.roboflow.modelVersion;
    this.workflowId = config.roboflow.workflowId;
    this.baseUrl = config.roboflow.baseUrl;
    this.inferenceUrl = config.roboflow.inferenceUrl;
    this.timeout = config.roboflow.timeout;
  }

  /**
   * Analyze an image using Roboflow Object Detection API.
   * @param {string} imagePath - Absolute path to the local image file
   * @returns {Promise<object>} Roboflow prediction results
   */
  async analyzeImage(imagePath) {
    try {
      // Read image and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Build the inference URL
      const url = `${this.baseUrl}/${this.modelId}/${this.modelVersion}`;

      const response = await axios({
        method: 'POST',
        url,
        params: {
          api_key: this.apiKey,
        },
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: this.timeout,
      });

      return this._processResponse(response.data);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Analyze an image using Roboflow Workflow API.
   * @param {string} imagePath - Absolute path to the local image file
   * @returns {Promise<object>} Workflow prediction results
   */
  async analyzeWithWorkflow(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const url = `${this.inferenceUrl}/${this.workspace}/${this.workflowId}`;

      const response = await axios({
        method: 'POST',
        url,
        params: {
          api_key: this.apiKey,
        },
        data: {
          inputs: {
            image: {
              type: 'base64',
              value: base64Image,
            },
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.timeout,
      });

      return this._processWorkflowResponse(response.data);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Process standard Roboflow detection response.
   * @param {object} data - Raw API response
   * @returns {object} Structured predictions
   */
  _processResponse(data) {
    const predictions = (data.predictions || []).map((pred) => ({
      className: (pred.class || 'unknown').toLowerCase().trim(),
      confidence: Math.round((pred.confidence || 0) * 1000) / 1000,
      bbox: {
        x: Math.round(pred.x || 0),
        y: Math.round(pred.y || 0),
        width: Math.round(pred.width || 0),
        height: Math.round(pred.height || 0),
      },
    }));

    return {
      predictions,
      imageWidth: data.image?.width || null,
      imageHeight: data.image?.height || null,
      inferenceTime: data.time || null,
    };
  }

  /**
   * Process Roboflow Workflow response.
   * @param {object} data - Raw workflow API response
   * @returns {object} Structured predictions
   */
  _processWorkflowResponse(data) {
    // Workflow responses can vary — extract predictions from output
    const outputs = data.outputs || data.output || data;
    let rawPredictions = [];

    if (Array.isArray(outputs)) {
      // Workflow may return an array of step outputs
      for (const output of outputs) {
        if (output.predictions) {
          rawPredictions = rawPredictions.concat(output.predictions);
        }
      }
    } else if (outputs.predictions) {
      rawPredictions = outputs.predictions;
    }

    const predictions = rawPredictions.map((pred) => ({
      className: (pred.class || pred.className || 'unknown').toLowerCase().trim(),
      confidence: Math.round((pred.confidence || 0) * 1000) / 1000,
      bbox: {
        x: Math.round(pred.x || pred.bbox?.x || 0),
        y: Math.round(pred.y || pred.bbox?.y || 0),
        width: Math.round(pred.width || pred.bbox?.width || 0),
        height: Math.round(pred.height || pred.bbox?.height || 0),
      },
    }));

    return {
      predictions,
      imageWidth: null,
      imageHeight: null,
      inferenceTime: null,
    };
  }

  /**
   * Handle and transform Roboflow API errors.
   * @param {Error} error
   * @returns {Error} Transformed error with user-friendly message
   */
  _handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('Roboflow API authentication failed. Check your API key.');
        case 403:
          return new Error('Roboflow API access forbidden. Check your permissions.');
        case 404:
          return new Error('Roboflow model or workflow not found. Check your configuration.');
        case 429:
          return new Error('Roboflow API rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Roboflow API internal error. Please try again later.');
        default:
          return new Error(
            `Roboflow API error (${status}): ${data?.message || 'Unknown error'}`
          );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Roboflow API request timed out. Please try again.');
    }

    if (error.code === 'ECONNREFUSED') {
      return new Error('Unable to connect to Roboflow API. Check your network.');
    }

    return new Error(`Roboflow service error: ${error.message}`);
  }
}

module.exports = new RoboflowService();
