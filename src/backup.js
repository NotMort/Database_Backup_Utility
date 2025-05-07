const path = require('path');
const fs = require('fs');
const { backupMySQL } = require('./db/mysql');
const { backupPostgres } = require('./db/postgres');
const { backupMongo } = require('./db/mongodb');
const { backupSQLite } = require('./db/sqlite');
const { testConnection } = require('./db/testConnection');
const { sendSlackNotification } = require('./notify/slack');


const { compressFile } = require('./compressor');
const { saveLocal } = require('./storage/local');
const { saveToS3 } = require('./storage/aws');
const logger = require('./logger');
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
async function runBackup(options) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `${options.database}-${timestamp}.sql`; 
  await testConnection(options);

  try {
    logger.info(`Starting ${options.backupType} backup for ${options.dbtype}...`);

    let rawBackupPath;

    switch (options.dbtype) {
      case 'mysql':
        rawBackupPath = await backupMySQL(options, backupFileName);
        break;
      case 'postgres':
        rawBackupPath = await backupPostgres(options, backupFileName);
        break;
      case 'sqlite':
        rawBackupPath = await backupSQLite(options, backupFileName);
           break;

      case 'mongodb':
        rawBackupPath = await backupMongo(options, backupFileName);
        break;
        
      default:
        throw new Error(`Unsupported database type: ${options.dbtype}`);
    }

    const compressedPath = await compressFile(rawBackupPath);

    if (options.storage === 's3') {
      await saveToS3(compressedPath);
    } else {
      await saveLocal(compressedPath);
    }

    sendSlackNotification(`✅ Backup succeeded for ${options.database} (${options.dbtype})`, process.env.SLACK_WEBHOOK_URL);

  } catch (err) {
    sendSlackNotification(`❌ Backup FAILED for ${options.database} (${options.dbtype}): ${err.message}`, process.env.SLACK_WEBHOOK_URL);

  }
}

module.exports = { runBackup };
