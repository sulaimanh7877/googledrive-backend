const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const File = require('../models/File');
const Folder = require('../models/Folder');
const S3Service = require('./s3Service');
const AppError = require('../utils/AppError');

class FileService {
  static async getUsage(userId) {
    const result = await File.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } }
    ]);
    return result[0] ? result[0].totalSize : 0;
  }

  static async getUploadUrl(userId, fileName, mimeType, folderId, size = 0) {
    // 1. Check Quota (300MB)
    const currentUsage = await this.getUsage(userId);
    const LIMIT = 300 * 1024 * 1024;
    
    if (currentUsage + size > LIMIT) {
      throw new AppError('Storage quota exceeded (300MB limit)', 400);
    }

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, ownerId: userId });
      if (!folder) throw new AppError('Folder not found', 404);
    }

    const s3Key = `users/${userId}/${uuidv4()}-${fileName}`;
    const uploadUrl = await S3Service.generateSignedUploadUrl(s3Key, mimeType);
    
    return { uploadUrl, s3Key };
  }

  static async saveMetadata(userId, data) {
    if (data.folderId) {
      const folder = await Folder.findOne({ _id: data.folderId, ownerId: userId });
      if (!folder) throw new AppError('Folder not found', 404);
    }

    const existing = await File.findOne({
      ownerId: userId,
      folderId: data.folderId || null,
      name: data.name
    });
    if (existing) throw new AppError('A file with this name already exists in this folder', 400);
    
    return await File.create({ ...data, ownerId: userId });
  }

  static async listFiles(userId, folderId) {
    const query = { ownerId: userId, folderId: folderId || null };
    return await File.find(query);
  }

  static async getDownloadUrl(userId, fileId) {
    const file = await File.findOne({ _id: fileId, ownerId: userId });
    if (!file) throw new AppError('File not found', 404);

    return await S3Service.generateSignedDownloadUrl(file.s3Key, file.name);
  }

  static async deleteFile(userId, fileId) {
    const file = await File.findOne({ _id: fileId, ownerId: userId });
    if (!file) throw new AppError('File not found', 404);

    await S3Service.deleteFile(file.s3Key);
    await File.deleteOne({ _id: fileId });
  }
}

module.exports = FileService;