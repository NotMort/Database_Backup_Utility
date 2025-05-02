const path = require('path');
const fs = require('fs');
const { execa } = require('execa');
const logger = require('../logger');

async function backupMongo(options, fileName) {
  const {
    host, port, user, password, database
  } = options;

  const backupDir = path.join(__dirname, '..', '..', 'tmp', path.parse(fileName).name);

  try {
    logger.info(`Running mongodump for database: ${database}`);
    fs.mkdirSync(backupDir, { recursive: true });

    const uriParts = [`mongodb://`];
    if (user && password) uriParts.push(`${encodeURIComponent(user)}:${encodeURIComponent(password)}@`);
    uriParts.push(`${host}:${port || '27017'}/${database}`);
    const uri = uriParts.join('');

    const args = [
      `--uri=${uri}`,
      `--out=${backupDir}`
    ];

    await execa('mongodump', args);

    return backupDir; 
  } catch (err) {
    logger.error(`MongoDB backup failed: ${err.message}`);
    throw err;
  }
}

module.exports = { backupMongo };
