const { Command } = require('commander');
const inquirer = require('inquirer');
const { runBackup } = require('./backup');
const { runRestore } = require('./restore');

const program = new Command();

program
  .name('db-backup')
  .description('A CLI tool for backing up and restoring databases')
  .version('1.0.0');

program
  .command('backup')
  .description('Create a backup of the specified database')
  .option('--dbtype <type>', 'Database type (mysql|postgres|mongodb)')
  .option('--host <host>', 'Database host')
  .option('--port <port>', 'Database port')
  .option('--user <username>', 'Database username')
  .option('--password <password>', 'Database password')
  .option('--database <name>', 'Name of the database')
  .option('--backup-type <type>', 'Type of backup (full|incremental|differential)', 'full')
  .option('--storage <type>', 'Where to store the backup (local|s3)', 'local')
  .action(async (options) => {
    await runBackup(options);
  });


program
  .command('restore')
  .description('Restore a database from a backup file')
  .option('--dbtype <type>', 'Database type (mysql|postgres|mongodb)')
  .option('--file <path>', 'Path to the backup file')
  .option('--host <host>', 'Database host')
  .option('--port <port>', 'Database port')
  .option('--user <username>', 'Database username')
  .option('--password <password>', 'Database password')
  .option('--database <name>', 'Database to restore into')
  .action(async (options) => {
    await runRestore(options);
  });

program.parse(process.argv);
