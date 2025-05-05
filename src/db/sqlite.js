const fs = require('fs');
const path = require('path');
const logger = require('../logger');

async function backupSQLite(options, fileName) {
  const dbPath = options.database; 

  if (!fs.existsSync(dbPath)) {
    throw new Error(`SQLite file not found: ${dbPath}`);
  }

  const outputPath = path.join(__dirname, '..', '..', 'tmp', fileName.replace(/\.sql$/, '.sqlite'));

  try {
    fs.copyFileSync(dbPath, outputPath);
    logger.info(`SQLite backup copied from ${dbPath} to ${outputPath}`);
    return outputPath;
  } catch (err) {
    logger.error(`SQLite backup failed: ${err.message}`);
    throw err;
  }
}

module.exports = { backupSQLite };
