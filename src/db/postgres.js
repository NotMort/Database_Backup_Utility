const path = require('path');
const fs = require('fs');
const { execa } = require('execa');
const logger = require('../logger');

async function backupPostgres(options, fileName) {
  const {
    host, port, user, password, database
  } = options;

  const outputPath = path.join(__dirname, '..', '..', 'tmp', fileName);

  try {
    logger.info(`Running pg_dump for database: ${database}`);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const env = {
      ...process.env,
      PGPASSWORD: password,
    };

    const args = [
      `-h`, host,
      `-p`, port || '5432',
      `-U`, user,
      `-F`, `p`, 
      `-f`, outputPath,
      database
    ];

    await execa('pg_dump', args, { env });

    return outputPath;
  } catch (err) {
    logger.error(`PostgreSQL backup failed: ${err.message}`);
    throw err;
  }
}

module.exports = { backupPostgres };
