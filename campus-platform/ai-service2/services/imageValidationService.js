const sharp = require('sharp');
const fs = require('fs');
const config = require('../config');
const { CAMPUS_OBJECT_CLASSES, IRRELEVANT_CLASSES } = require('../utils/constants');

/**
 * Image Validation Service
 * Validates uploaded images for quality, blur, corruption, and campus relevance.
 */
class ImageValidationService {
  constructor() {
    this.blurThreshold = config.imageValidation.blurThreshold;
    this.minQualityScore = config.imageValidation.minQualityScore;
    this.confidenceThreshold = config.imageValidation.confidenceThreshold;
  }

  /**
   * Run all pre-analysis validations on an image.
   * @param {string} filePath - Path to the image file
   * @returns {Promise<{isValid: boolean, errors: string[], metadata: object}>}
   */
  async validateImage(filePath) {
    const errors = [];
    let metadata = {};

    try {
      // 1. Check if file exists
      if (!fs.existsSync(filePath)) {
        return { isValid: false, errors: ['Image file not found.'], metadata };
      }

      // 2. Check file corruption by reading metadata
      try {
        metadata = await this._getImageMetadata(filePath);
      } catch (err) {
        return {
          isValid: false,
          errors: ['Image file is corrupted or unreadable.'],
          metadata,
        };
      }

      // 3. Check minimum dimensions
      if (metadata.width < 100 || metadata.height < 100) {
        errors.push(
          `Image too small (${metadata.width}x${metadata.height}). Minimum: 100x100 pixels.`
        );
      }

      // 4. Check maximum dimensions (prevent abuse)
      if (metadata.width > 10000 || metadata.height > 10000) {
        errors.push(
          `Image too large (${metadata.width}x${metadata.height}). Maximum: 10000x10000 pixels.`
        );
      }

      // 5. Blur detection
      const blurScore = await this._detectBlur(filePath);
      if (blurScore < this.blurThreshold) {
        errors.push(
          `Image appears blurry (score: ${blurScore.toFixed(1)}, threshold: ${this.blurThreshold}). Please upload a clearer image.`
        );
      }

      // 6. Quality check
      const qualityScore = this._calculateQualityScore(metadata, blurScore);
      if (qualityScore < this.minQualityScore) {
        errors.push(
          `Image quality too low (score: ${qualityScore.toFixed(1)}/100). Please upload a higher quality image.`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        metadata: {
          ...metadata,
          blurScore: Math.round(blurScore * 10) / 10,
          qualityScore: Math.round(qualityScore * 10) / 10,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        metadata,
      };
    }
  }

  /**
   * Post-analysis validation: check if detected objects are campus-relevant.
   * @param {Array} detections - Array of detection objects with className
   * @returns {{isRelevant: boolean, errors: string[], relevanceScore: number}}
   */
  validateCampusRelevance(detections) {
    if (!detections || detections.length === 0) {
      return {
        isRelevant: false,
        errors: ['No objects detected in the image. Please upload a campus-related image.'],
        relevanceScore: 0,
      };
    }

    const campusClassesLower = CAMPUS_OBJECT_CLASSES.map((c) => c.toLowerCase());
    const irrelevantClassesLower = IRRELEVANT_CLASSES.map((c) => c.toLowerCase());

    let campusCount = 0;
    let irrelevantCount = 0;

    for (const detection of detections) {
      const cls = detection.className.toLowerCase();
      if (campusClassesLower.includes(cls)) {
        campusCount++;
      }
      if (irrelevantClassesLower.includes(cls)) {
        irrelevantCount++;
      }
    }

    const relevanceScore = (campusCount / detections.length) * 100;
    const errors = [];

    // Reject if more than 50% are irrelevant or relevance is below 20%
    if (irrelevantCount > detections.length * 0.5) {
      errors.push('Image contains mostly non-campus objects.');
    }

    if (relevanceScore < 20 && detections.length > 2) {
      errors.push(
        `Low campus relevance (${relevanceScore.toFixed(1)}%). Please upload a campus-related image.`
      );
    }

    return {
      isRelevant: errors.length === 0,
      errors,
      relevanceScore: Math.round(relevanceScore * 10) / 10,
    };
  }

  /**
   * Filter predictions: remove low confidence, duplicates, and irrelevant objects.
   * @param {Array} predictions - Raw predictions from Roboflow
   * @returns {Array} Filtered and cleaned predictions
   */
  filterPredictions(predictions) {
    if (!predictions || predictions.length === 0) return [];

    const irrelevantLower = IRRELEVANT_CLASSES.map((c) => c.toLowerCase());

    // 1. Remove low confidence predictions
    let filtered = predictions.filter(
      (p) => p.confidence >= this.confidenceThreshold
    );

    // 2. Remove irrelevant classes
    filtered = filtered.filter(
      (p) => !irrelevantLower.includes(p.className.toLowerCase())
    );

    // 3. Remove duplicate detections (same class, overlapping bboxes)
    filtered = this._removeDuplicates(filtered);

    // 4. Sort by confidence descending
    filtered.sort((a, b) => b.confidence - a.confidence);

    return filtered;
  }

  /**
   * Detect image blur using Laplacian variance method via sharp.
   * Higher score = sharper image.
   * @param {string} filePath - Path to the image
   * @returns {Promise<number>} Blur score (variance of Laplacian)
   */
  async _detectBlur(filePath) {
    try {
      // Convert to greyscale and apply Laplacian-like kernel
      const { data, info } = await sharp(filePath)
        .greyscale()
        .resize(500, 500, { fit: 'inside' }) // Resize for performance
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { width, height } = info;
      let sum = 0;
      let sumSq = 0;
      let count = 0;

      // Calculate variance of pixel values (approximation of Laplacian variance)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          // Laplacian: center*4 - top - bottom - left - right
          const laplacian =
            4 * data[idx] -
            data[(y - 1) * width + x] -
            data[(y + 1) * width + x] -
            data[y * width + (x - 1)] -
            data[y * width + (x + 1)];

          sum += laplacian;
          sumSq += laplacian * laplacian;
          count++;
        }
      }

      const mean = sum / count;
      const variance = sumSq / count - mean * mean;

      return Math.abs(variance);
    } catch (error) {
      console.warn(`Blur detection failed: ${error.message}. Defaulting to passing.`);
      return this.blurThreshold + 1; // Pass by default if detection fails
    }
  }

  /**
   * Get image metadata using sharp.
   * @param {string} filePath
   * @returns {Promise<object>} Image metadata
   */
  async _getImageMetadata(filePath) {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      sizeBytes: metadata.size || fs.statSync(filePath).size,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density,
    };
  }

  /**
   * Calculate overall image quality score (0-100).
   * @param {object} metadata - Image metadata
   * @param {number} blurScore - Blur detection score
   * @returns {number} Quality score 0-100
   */
  _calculateQualityScore(metadata, blurScore) {
    let score = 0;

    // Resolution score (max 40 points)
    const pixels = (metadata.width || 0) * (metadata.height || 0);
    if (pixels >= 1000000) score += 40;       // 1MP+
    else if (pixels >= 500000) score += 30;   // 0.5MP+
    else if (pixels >= 100000) score += 20;   // 0.1MP+
    else score += 10;

    // Blur score (max 40 points)
    if (blurScore >= this.blurThreshold * 2) score += 40;
    else if (blurScore >= this.blurThreshold) score += 30;
    else if (blurScore >= this.blurThreshold * 0.5) score += 15;
    else score += 5;

    // Format bonus (max 20 points)
    const format = (metadata.format || '').toLowerCase();
    if (['jpeg', 'jpg', 'png'].includes(format)) score += 20;
    else if (['webp', 'bmp'].includes(format)) score += 15;
    else score += 10;

    return Math.min(100, score);
  }

  /**
   * Remove duplicate detections with overlapping bounding boxes.
   * Uses IoU (Intersection over Union) to detect overlaps.
   * @param {Array} detections
   * @returns {Array} Deduplicated detections
   */
  _removeDuplicates(detections) {
    const iouThreshold = 0.5;
    const kept = [];

    for (const detection of detections) {
      let isDuplicate = false;

      for (const existing of kept) {
        if (
          detection.className === existing.className &&
          this._calculateIoU(detection.bbox, existing.bbox) > iouThreshold
        ) {
          // Keep the one with higher confidence
          if (detection.confidence > existing.confidence) {
            const idx = kept.indexOf(existing);
            kept[idx] = detection;
          }
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        kept.push(detection);
      }
    }

    return kept;
  }

  /**
   * Calculate Intersection over Union (IoU) of two bounding boxes.
   * @param {object} box1 - {x, y, width, height}
   * @param {object} box2 - {x, y, width, height}
   * @returns {number} IoU value (0-1)
   */
  _calculateIoU(box1, box2) {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return union === 0 ? 0 : intersection / union;
  }
}

module.exports = new ImageValidationService();
