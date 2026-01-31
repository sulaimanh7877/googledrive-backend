const Folder = require('../models/Folder');
const File = require('../models/File');
const S3Service = require('./s3Service');
const AppError = require('../utils/AppError');

class FolderService {
  static async createFolder(userId, name, parentFolderId) {
    if (parentFolderId) {
      const parent = await Folder.findOne({ _id: parentFolderId, ownerId: userId });
      if (!parent) throw new AppError('Parent folder not found', 404);
    }

    const existing = await Folder.findOne({
      ownerId: userId,
      parentFolderId: parentFolderId || null,
      name: name
    });
    if (existing) throw new AppError('A folder with this name already exists', 400);

    return await Folder.create({ name, parentFolderId, ownerId: userId });
  }

  static async getContents(userId, folderId) {
    let folder = null;
    if (folderId) {
       folder = await Folder.findOne({ _id: folderId, ownerId: userId });
       if (!folder) throw new AppError('Folder not found', 404);
    }
    
    const subfolders = await Folder.find({ parentFolderId: folderId, ownerId: userId });
    const files = await File.find({ folderId: folderId, ownerId: userId });
    
    return { folder, subfolders, files };
  }

  static async deleteFolder(userId, folderId) {
    const folder = await Folder.findOne({ _id: folderId, ownerId: userId });
    if (!folder) throw new AppError('Folder not found', 404);

    // Recursive delete helper
    await this._recursiveDelete(userId, folderId);
  }

  static async _recursiveDelete(userId, folderId) {
    // Find subfolders
    const subfolders = await Folder.find({ parentFolderId: folderId, ownerId: userId });
    for (const sub of subfolders) {
      await this._recursiveDelete(userId, sub._id);
    }

    // Delete files in this folder
    const files = await File.find({ folderId, ownerId: userId });
    for (const file of files) {
      await S3Service.deleteFile(file.s3Key);
      await File.deleteOne({ _id: file._id });
    }

    // Delete the folder itself
    await Folder.deleteOne({ _id: folderId });
  }
}

module.exports = FolderService;