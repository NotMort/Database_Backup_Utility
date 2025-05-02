const path = require('path');
const fs = require('fs');
const { execa } = require('execa');
const logger = require('../logger');

async function backupMySQL(options, fileName) {
  const {
    host, port, user, password, database
  } = options;

  const outputPath = path.join(__dirname, '..', '..', 'tmp', fileName);

  try {
    logger.info(`Running mysqldump for database: ${database}`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const command = `mysqldump`;
    const args = [
      `-h`, host,
      `-P`, port || '3306',
      `-u`, user,
      `-p${password}`,
      database
    ];

    const { stdout } = await execa(command, args);
    fs.writeFileSync(outputPath, stdout);

    return outputPath;
  } catch (err) {
    logger.error(`MySQL backup failed: ${err.message}`);
    throw err;
  }
}

module.exports = { backupMySQL };
