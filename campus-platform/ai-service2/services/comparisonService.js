/**
 * Comparison Service
 * Compares two image analyses to find similarities and differences.
 */
class ComparisonService {
  /**
   * Compare two image analyses.
   * @param {object} analysis1 - First ImageAnalysis document
   * @param {object} analysis2 - Second ImageAnalysis document
   * @returns {object} Comparison result
   */
  compareAnalyses(analysis1, analysis2) {
    const classes1 = this._getClassCounts(analysis1.detections);
    const classes2 = this._getClassCounts(analysis2.detections);

    const allClasses = new Set([...Object.keys(classes1), ...Object.keys(classes2)]);
    const commonObjects = [];
    const missingObjects = []; // in analysis1 but not analysis2
    const additionalObjects = []; // in analysis2 but not analysis1
    const countDifferences = [];

    for (const cls of allClasses) {
      const count1 = classes1[cls] || 0;
      const count2 = classes2[cls] || 0;

      if (count1 > 0 && count2 > 0) {
        commonObjects.push({ className: cls, countInImage1: count1, countInImage2: count2 });
        if (count1 !== count2) {
          countDifferences.push({ className: cls, image1: count1, image2: count2, diff: count2 - count1 });
        }
      } else if (count1 > 0 && count2 === 0) {
        missingObjects.push({ className: cls, count: count1 });
      } else if (count2 > 0 && count1 === 0) {
        additionalObjects.push({ className: cls, count: count2 });
      }
    }

    // Similarity using Jaccard index on class sets
    const set1 = new Set(Object.keys(classes1));
    const set2 = new Set(Object.keys(classes2));
    const intersection = [...set1].filter((x) => set2.has(x)).length;
    const union = new Set([...set1, ...set2]).size;
    const similarityPercentage = union === 0 ? 0 : Math.round((intersection / union) * 10000) / 100;

    // Confidence comparison
    const avgConf1 = this._avgConfidence(analysis1.detections);
    const avgConf2 = this._avgConfidence(analysis2.detections);

    return {
      image1: { id: analysis1._id, filename: analysis1.filename, category: analysis1.imageCategory, totalObjects: analysis1.detectedObjectsCount },
      image2: { id: analysis2._id, filename: analysis2.filename, category: analysis2.imageCategory, totalObjects: analysis2.detectedObjectsCount },
      similarityPercentage,
      commonObjects,
      missingObjects,
      additionalObjects,
      countDifferences,
      confidenceComparison: {
        image1Average: Math.round(avgConf1 * 1000) / 1000,
        image2Average: Math.round(avgConf2 * 1000) / 1000,
        higherConfidence: avgConf1 > avgConf2 ? 'image1' : avgConf2 > avgConf1 ? 'image2' : 'equal',
      },
      summary: this._generateComparisonSummary(commonObjects, missingObjects, additionalObjects, similarityPercentage),
    };
  }

  _getClassCounts(detections) {
    const counts = {};
    for (const d of (detections || [])) {
      const cls = d.className.toLowerCase();
      counts[cls] = (counts[cls] || 0) + 1;
    }
    return counts;
  }

  _avgConfidence(detections) {
    if (!detections || detections.length === 0) return 0;
    return detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
  }

  _generateComparisonSummary(common, missing, additional, similarity) {
    const parts = [];
    parts.push(`The images have a ${similarity}% similarity.`);
    if (common.length > 0) parts.push(`They share ${common.length} common object type(s): ${common.map(c => c.className).join(', ')}.`);
    if (missing.length > 0) parts.push(`Image 1 has ${missing.length} object type(s) not found in Image 2: ${missing.map(m => m.className).join(', ')}.`);
    if (additional.length > 0) parts.push(`Image 2 has ${additional.length} object type(s) not found in Image 1: ${additional.map(a => a.className).join(', ')}.`);
    return parts.join(' ');
  }
}

module.exports = new ComparisonService();
