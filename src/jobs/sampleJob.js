/**
 * Sample cron job template
 * This is a template for creating background jobs
 * Uses node-cron for scheduling
 */

const cron = require('node-cron');
const logger = require('../utils/logger');

class SampleJob {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  /**
   * Start the job
   * @param {string} schedule - Cron schedule expression (default: every 5 minutes)
   */
  start(schedule = '*/5 * * * *') {
    if (this.isRunning) {
      logger.warn('Sample job is already running');
      return;
    }

    // Schedule the job
    this.job = cron.schedule(schedule, async () => {
      await this.execute();
    });

    this.isRunning = true;
    logger.info('Sample job started:', { schedule });

    // Optionally run immediately on start
    // setImmediate(() => this.execute());
  }

  /**
   * Stop the job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      logger.info('Sample job stopped');
    }
  }

  /**
   * Execute the job logic
   */
  async execute() {
    try {
      logger.debug('Running sample job...');

      // Add your job logic here
      // Examples:
      // - Clean up old records
      // - Send scheduled emails
      // - Generate reports
      // - Update cache
      // - Sync with external APIs

      logger.info('Sample job completed successfully');
    } catch (error) {
      logger.error('Error during sample job execution:', error);
    }
  }

  /**
   * Get job status
   * @returns {Object} Job status
   */
  getStatus() {
    return {
      is_running: this.isRunning,
      name: 'sample-job'
    };
  }
}

module.exports = new SampleJob();

