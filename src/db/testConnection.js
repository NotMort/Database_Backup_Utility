const { execa } = require('execa');
const fs = require('fs');
const logger = require('../logger');

async function testConnection(options) {
  const { dbtype, host, port, user, password, database } = options;

  try {
    switch (dbtype) {
      case 'mysql':
        await execa('mysqladmin', [
          `-h`, host,
          `-P`, port || '3306',
          `-u`, user,
          `-p${password}`,
          'ping'
        ]);
        break;

      case 'postgres':
        await execa('psql', [
          `-h`, host,
          `-p`, port || '5432',
          `-U`, user,
          `-d`, database,
          `-c`, `SELECT 1`
        ], { env: { ...process.env, PGPASSWORD: password } });
        break;

      case 'mongodb':
        const uri = `mongodb://${user}:${password}@${host}:${port || '27017'}/${database}`;
        await execa('mongosh', [uri, '--eval', 'db.stats()']);
        break;

      case 'sqlite':
        if (!fs.existsSync(database)) {
          throw new Error(`SQLite file not found: ${database}`);
        }
        break;

      default:
        throw new Error(`Unsupported DB type: ${dbtype}`);
    }

    logger.info(`${dbtype} connection test successful.`);
  } catch (err) {
    logger.error(`Connection test failed: ${err.message}`);
    throw new Error(`Connection to ${dbtype} failed`);
  }
}

module.exports = { testConnection };
