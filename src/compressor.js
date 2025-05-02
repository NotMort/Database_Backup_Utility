const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const logger = require('./logger');

async function compressFile(inputPath) {
  return new Promise((resolve, reject) => {
    const isDirectory = fs.lstatSync(inputPath).isDirectory();
    const baseName = path.basename(inputPath).replace(/\.(sql|dump)$/, '');
    const outputZip = path.join(__dirname, '..', 'tmp', `${baseName}.zip`);

    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      logger.info(`Compressed to ${outputZip} (${archive.pointer()} bytes)`);
      resolve(outputZip);
    });

    archive.on('error', (err) => {
      logger.error(`Compression failed: ${err.message}`);
      reject(err);
    });

    archive.pipe(output);

    if (isDirectory) {
      archive.directory(inputPath, false);
    } else {
      archive.file(inputPath, { name: path.basename(inputPath) });
    }

    archive.finalize();
  });
}

module.exports = { compressFile };
