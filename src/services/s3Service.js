const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/aws');

class S3Service {
  static async generateSignedUploadUrl(key, contentType) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 mins
  }

  static async generateSignedDownloadUrl(key, originalName) {
    const command = new GetObjectCommand({
      ResponseContentDisposition: `attachment; filename="${originalName}"`, 
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 mins
  }

  static async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  }
}

module.exports = S3Service;