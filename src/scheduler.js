const cron = require('node-cron');
const { runBackup } = require('./backup');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

function scheduleBackup() {
  const configPath = path.join(__dirname, '..', 'schedule.config.json');
  if (!fs.existsSync(configPath)) {
    logger.warn('No schedule.config.json found. Skipping scheduling.');
    return;
  }

  const jobs = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  jobs.forEach((job) => {
    if (!cron.validate(job.cron)) {
      logger.warn(`Invalid cron expression: ${job.cron}`);
      return;
    }

    cron.schedule(job.cron, async () => {
      logger.info(`Scheduled backup started for ${job.database} (${job.dbtype})`);
      try {
        await runBackup(job);
      } catch (err) {
        logger.error(`Scheduled backup failed: ${err.message}`);
      }
    });

    logger.info(`Scheduled backup set for ${job.database} using cron: ${job.cron}`);
  });
}

module.exports = { scheduleBackup };
