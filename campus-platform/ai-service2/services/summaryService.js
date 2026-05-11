const { IMAGE_CATEGORIES, CATEGORY_KEYWORDS } = require('../utils/constants');

/**
 * Summary Service
 * Generates AI summaries, image categories, and tags from detection results.
 */
class SummaryService {
  generateSummary(detections) {
    if (!detections || detections.length === 0) {
      return 'No objects were detected in this image.';
    }

    const classCounts = this._groupByClass(detections);
    const category = this.categorizeImage(detections);
    const parts = [];
    const entries = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);

    for (const [className, count] of entries) {
      const plural = count > 1 ? this._pluralize(className) : className;
      parts.push(`${count} ${plural}`);
    }

    let description;
    if (parts.length === 1) description = parts[0];
    else if (parts.length === 2) description = `${parts[0]} and ${parts[1]}`;
    else description = `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;

    const locationPhrase = this._getLocationPhrase(category);
    const avgConfidence = this._getAverageConfidence(detections);
    const confidencePhrase = avgConfidence >= 0.9 ? 'Detection confidence is very high.'
      : avgConfidence >= 0.75 ? 'Detection confidence is high.'
      : avgConfidence >= 0.6 ? 'Detection confidence is moderate.'
      : 'Detection confidence is low.';

    return `The image contains ${description}${locationPhrase}. ${confidencePhrase}`;
  }

  categorizeImage(detections) {
    if (!detections || detections.length === 0) return IMAGE_CATEGORIES.UNKNOWN;

    const detectedClasses = detections.map((d) => d.className.toLowerCase());
    const scores = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        score += detectedClasses.filter(
          (cls) => cls.includes(keyword) || keyword.includes(cls)
        ).length;
      }
      if (score > 0) scores[category] = score;
    }

    if (Object.keys(scores).length === 0) return IMAGE_CATEGORIES.UNKNOWN;
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  generateTags(detections, category) {
    const tags = new Set();
    if (category && category !== IMAGE_CATEGORIES.UNKNOWN) tags.add(category);

    if (detections && detections.length > 0) {
      for (const d of detections) tags.add(d.className.toLowerCase());
      if (detections.length >= 10) tags.add('crowded');
      if (detections.length >= 5) tags.add('busy');

      const avgConf = this._getAverageConfidence(detections);
      if (avgConf >= 0.9) tags.add('high-confidence');
      else if (avgConf >= 0.7) tags.add('medium-confidence');

      const hasPeople = detections.some((d) =>
        ['person', 'student', 'teacher'].includes(d.className.toLowerCase())
      );
      tags.add(hasPeople ? 'people-present' : 'empty-space');
    }
    return [...tags];
  }

  _groupByClass(detections) {
    const counts = {};
    for (const d of detections) {
      const cls = d.className.toLowerCase();
      counts[cls] = (counts[cls] || 0) + 1;
    }
    return counts;
  }

  _pluralize(word) {
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch')) return `${word}es`;
    if (word.endsWith('y') && !['a','e','i','o','u'].includes(word[word.length - 2])) return `${word.slice(0, -1)}ies`;
    return `${word}s`;
  }

  _getLocationPhrase(category) {
    const phrases = {
      [IMAGE_CATEGORIES.CLASSROOM]: ' inside a classroom',
      [IMAGE_CATEGORIES.LABORATORY]: ' in a laboratory',
      [IMAGE_CATEGORIES.LIBRARY]: ' in a library',
      [IMAGE_CATEGORIES.CAFETERIA]: ' in a cafeteria',
      [IMAGE_CATEGORIES.OUTDOOR]: ' in an outdoor campus area',
      [IMAGE_CATEGORIES.SPORTS]: ' at a sports facility',
      [IMAGE_CATEGORIES.OFFICE]: ' in an office',
      [IMAGE_CATEGORIES.CORRIDOR]: ' in a corridor',
      [IMAGE_CATEGORIES.PARKING]: ' in a parking area',
      [IMAGE_CATEGORIES.AUDITORIUM]: ' in an auditorium',
    };
    return phrases[category] || ' on campus';
  }

  _getAverageConfidence(detections) {
    if (!detections || detections.length === 0) return 0;
    return detections.reduce((acc, d) => acc + d.confidence, 0) / detections.length;
  }
}

module.exports = new SummaryService();
