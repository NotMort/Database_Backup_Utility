const fs = require('fs');
const path = require('path');
const { S3 } = require('aws-sdk');
const logger = require('../logger');

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function saveToS3(filePath) {
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME not defined in .env');
  }

  const fileStream = fs.createReadStream(filePath);
  const key = path.basename(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
  };

  try {
    const result = await s3.upload(params).promise();
    logger.info(`Backup uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (err) {
    logger.error(`S3 upload failed: ${err.message}`);
    throw err;
  }
}

module.exports = { saveToS3 };
