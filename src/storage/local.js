const fs = require('fs');
const path = require('path');
const logger = require('../logger');

function saveLocal(compressedFilePath) {
  return new Promise((resolve, reject) => {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });

    const fileName = path.basename(compressedFilePath);
    const destination = path.join(backupDir, fileName);

    fs.copyFile(compressedFilePath, destination, (err) => {
      if (err) {
        logger.error(`Local save failed: ${err.message}`);
        return reject(err);
      }

      logger.info(`Backup saved locally to ${destination}`);
      resolve(destination);
    });
  });
}

module.exports = { saveLocal };
