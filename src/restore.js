const path = require('path');
const fs = require('fs');
const { execa } = require('execa');
const unzipper = require('unzipper');
const logger = require('./logger');

async function runRestore(options) {
  const { dbtype, file, host, port, user, password, database } = options;

  // Unzip backup
  const extractPath = path.join(__dirname, '..', 'tmp', path.parse(file).name);
  fs.mkdirSync(extractPath, { recursive: true });

  logger.info(`Extracting backup zip: ${file}`);
  await fs.createReadStream(file).pipe(unzipper.Extract({ path: extractPath })).promise();

  try {
    switch (dbtype) {
      case 'mysql':
        await restoreMySQL({ host, port, user, password, database }, extractPath);
        break;
      case 'postgres':
        await restorePostgres({ host, port, user, password, database }, extractPath);
        break;
      case 'mongodb':
        await restoreMongo({ host, port, user, password, database }, extractPath);
        break;
      default:
        throw new Error(`Unsupported DB type: ${dbtype}`);
    }

    logger.info(`Restore completed successfully.`);
  } catch (err) {
    logger.error(`Restore failed: ${err.message}`);
  }
}

async function restoreMySQL(opts, dir) {
  const sqlFile = findFile(dir, '.sql');
  logger.info(`Restoring MySQL from ${sqlFile}`);
  await execa('mysql', [
    `-h`, opts.host,
    `-P`, opts.port || '3306',
    `-u`, opts.user,
    `-p${opts.password}`,
    opts.database
  ], { input: fs.readFileSync(sqlFile) });
}

async function restorePostgres(opts, dir) {
  const sqlFile = findFile(dir, '.sql');
  logger.info(`Restoring PostgreSQL from ${sqlFile}`);
  const env = { ...process.env, PGPASSWORD: opts.password };
  await execa('psql', [
    `-h`, opts.host,
    `-p`, opts.port || '5432',
    `-U`, opts.user,
    `-d`, opts.database,
    `-f`, sqlFile
  ], { env });
}

async function restoreMongo(opts, dir) {
  const uriParts = [`mongodb://`];
  if (opts.user && opts.password)
    uriParts.push(`${encodeURIComponent(opts.user)}:${encodeURIComponent(opts.password)}@`);
  uriParts.push(`${opts.host}:${opts.port || '27017'}/${opts.database}`);
  const uri = uriParts.join('');
  logger.info(`Restoring MongoDB from ${dir}`);
  await execa('mongorestore', [`--uri=${uri}`, '--dir', dir]);
}

function findFile(dir, ext) {
  const files = fs.readdirSync(dir);
  const file = files.find(f => f.endsWith(ext));
  if (!file) throw new Error(`No ${ext} file found in ${dir}`);
  return path.join(dir, file);
}

module.exports = { runRestore };
