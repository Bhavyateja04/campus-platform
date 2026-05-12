const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * OpenRouter AI Vision Service
 * Uses OpenRouter API to send images to vision models (Gemini, GPT-4o, etc.)
 * for object detection, scene classification, and campus relevance analysis.
 */
class AIVisionService {
  constructor() {
    this.apiKey = config.openrouter.apiKey;
    this.model = config.openrouter.model;
    this.baseUrl = config.openrouter.baseUrl;
    this.timeout = config.openrouter.timeout;
  }

  /**
   * Analyze an image using OpenRouter vision model.
   * Returns structured detections, summary, category, and tags.
   * @param {string} imagePath - Absolute path to the local image file
   * @returns {Promise<object>} Structured analysis result
   */
  async analyzeImage(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const ext = path.extname(imagePath).toLowerCase().replace('.', '');
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const prompt = `You are an AI vision system for an inventory/item analysis platform. Analyze this image and identify the item(s) shown. Return a JSON response with the following structure. Be thorough and accurate.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanation.

{
  "isValidItem": true/false,
  "rejectionReason": "string or null — if the image doesn't clearly show a stationery, electronics, books, or accessories item, explain why",
  "isNSFW": false,
  "detections": [
    {
      "className": "item name in lowercase",
      "confidence": 0.0 to 1.0,
      "bbox": { "x": 0, "y": 0, "width": 0, "height": 0 }
    }
  ],
  "imageCategory": "one of: stationery, electronics, books, accessories, unknown",
  "aiSummary": "A natural language sentence describing the item(s), e.g. 'The image shows a blue ballpoint pen and a spiral notebook.'",
  "tags": ["tag1", "tag2"],
  "itemCondition": "new, used, or damaged"
}

Category rules:
- "stationery" = pens, pencils, erasers, rulers, markers, notebooks, paper, staplers, scissors, tape, glue, highlighters, folders, binders, sticky notes, envelopes, clips, sharpeners
- "electronics" = phones, laptops, tablets, chargers, earphones, headphones, power banks, USB drives, cables, keyboards, mouse, calculators, smartwatches, speakers, cameras
- "books" = textbooks, novels, reference books, magazines, journals, dictionaries, comic books, study guides, notebooks with printed content
- "accessories" = bags, backpacks, wallets, keychains, water bottles, lunchboxes, umbrellas, glasses, sunglasses, watches (non-smart), caps, scarves, ID cards, lanyards

Rules:
- Only detect items you can clearly see
- Confidence should reflect how certain you are (0.6+ for clear items)
- bbox values can be approximate percentages of image dimensions (0-100)
- Tags should include the category, item names, brand if visible, color, and condition
- isValidItem = true ONLY if the image clearly shows items that fit into stationery, electronics, books, or accessories
- isValidItem = false for random scenes, people, food, landscapes, vehicles, or items not matching the 4 categories
- If category is "unknown", set isValidItem to false`;

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://campusvision.app',
          'X-Title': 'CampusVision AI',
        },
        data: {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        },
        timeout: this.timeout,
      });

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from AI model.');
      }

      return this._parseResponse(content);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Parse the JSON response from the AI model.
   * Handles potential markdown code blocks and malformed JSON.
   * @param {string} content - Raw response string
   * @returns {object} Parsed analysis
   */
  _parseResponse(content) {
    // Strip markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
      const parsed = JSON.parse(cleaned);

      // Normalize detections
      const detections = (parsed.detections || []).map((d) => ({
        className: (d.className || d.class_name || d.name || 'unknown').toLowerCase().trim(),
        confidence: Math.min(1, Math.max(0, parseFloat(d.confidence) || 0.5)),
        bbox: {
          x: Math.round(d.bbox?.x || 0),
          y: Math.round(d.bbox?.y || 0),
          width: Math.round(d.bbox?.width || 0),
          height: Math.round(d.bbox?.height || 0),
        },
      }));

      return {
        isValidItem: parsed.isValidItem !== false,
        isNSFW: parsed.isNSFW === true,
        rejectionReason: parsed.rejectionReason || null,
        detections,
        imageCategory: (parsed.imageCategory || 'unknown').toLowerCase(),
        aiSummary: parsed.aiSummary || 'No summary generated.',
        tags: parsed.tags || [],
        itemCondition: parsed.itemCondition || 'unknown',
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleaned.substring(0, 200));
      throw new Error('Failed to parse AI vision response. The model returned invalid JSON.');
    }
  }

  /**
   * Handle and transform API errors.
   * @param {Error} error
   * @returns {Error}
   */
  _handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('OpenRouter API authentication failed. Check your API key.');
        case 402:
          return new Error('OpenRouter API: Insufficient credits. Please add funds.');
        case 429:
          return new Error('OpenRouter API rate limit exceeded. Please try again later.');
        case 500:
        case 502:
        case 503:
          return new Error('AI model service temporarily unavailable. Please try again.');
        default:
          return new Error(
            `AI Vision API error (${status}): ${data?.error?.message || JSON.stringify(data) || 'Unknown error'}`
          );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('AI analysis timed out. The image may be too large. Please try again.');
    }

    if (error.code === 'ECONNREFUSED') {
      return new Error('Unable to connect to AI service. Check your network.');
    }

    return new Error(`AI Vision service error: ${error.message}`);
  }
}

module.exports = new AIVisionService();
