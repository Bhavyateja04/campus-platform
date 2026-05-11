const fs = require('fs');
const path = require('path');
const ImageAnalysis = require('../models/ImageAnalysis');
const config = require('../config');
const { ANALYSIS_STATUS } = require('../utils/constants');

/**
 * Cleanup Job
 * Periodically removes orphaned upload files and failed/stale analyses.
 */
class CleanupJob {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.intervalHours = config.cleanup.intervalHours;
    this.orphanAgeHours = config.cleanup.orphanAgeHours;
    this.intervalId = null;
  }

  /**
   * Start the cleanup job.
   */
  start() {
    console.log(`🧹 Cleanup job scheduled every ${this.intervalHours} hours`);

    // Run once on startup (after 1 minute delay)
    setTimeout(() => this.run(), 60 * 1000);

    // Schedule recurring
    this.intervalId = setInterval(
      () => this.run(),
      this.intervalHours * 60 * 60 * 1000
    );
  }

  /**
   * Stop the cleanup job.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🧹 Cleanup job stopped');
    }
  }

  /**
   * Execute cleanup tasks.
   */
  async run() {
    console.log('🧹 Running cleanup job...');
    try {
      const orphansRemoved = await this._removeOrphanFiles();
      const staleRemoved = await this._removeStaleAnalyses();
      console.log(`🧹 Cleanup complete: ${orphansRemoved} orphan files, ${staleRemoved} stale records removed`);
    } catch (error) {
      console.error('🧹 Cleanup job error:', error.message);
    }
  }

  /**
   * Remove upload files that have no corresponding DB record.
   */
  async _removeOrphanFiles() {
    let removed = 0;
    if (!fs.existsSync(this.uploadsDir)) return removed;

    const files = fs.readdirSync(this.uploadsDir);
    const cutoff = new Date(Date.now() - this.orphanAgeHours * 60 * 60 * 1000);

    for (const file of files) {
      if (file === '.gitkeep') continue;

      const filePath = path.join(this.uploadsDir, file);
      const stat = fs.statSync(filePath);

      // Only check files older than the orphan age
      if (stat.mtime < cutoff) {
        const exists = await ImageAnalysis.exists({ filename: file });
        if (!exists) {
          fs.unlinkSync(filePath);
          removed++;
        }
      }
    }

    return removed;
  }

  /**
   * Remove stale processing records (stuck in processing for too long).
   */
  async _removeStaleAnalyses() {
    const cutoff = new Date(Date.now() - this.orphanAgeHours * 60 * 60 * 1000);
    const result = await ImageAnalysis.updateMany(
      {
        status: ANALYSIS_STATUS.PROCESSING,
        updatedAt: { $lt: cutoff },
      },
      {
        $set: {
          status: ANALYSIS_STATUS.FAILED,
          validationErrors: ['Processing timed out. Marked as failed by cleanup job.'],
        },
      }
    );
    return result.modifiedCount;
  }
}

module.exports = new CleanupJob();
