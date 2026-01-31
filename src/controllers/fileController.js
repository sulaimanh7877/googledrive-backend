const FileService = require('../services/fileService');
const catchAsync = require('../utils/catchAsync');

exports.getUploadUrl = catchAsync(async (req, res, next) => {
  const { fileName, mimeType, folderId, size } = req.body;
  const result = await FileService.getUploadUrl(req.user.id, fileName, mimeType, folderId, size);
  res.status(200).json(result);
});

exports.getStorageUsage = catchAsync(async (req, res, next) => {
  const totalUsage = await FileService.getUsage(req.user.id);
  const limitMb = Number(process.env.STORAGE_LIMIT_MB) || 250;
  const limit = limitMb * 1024 * 1024;
  res.status(200).json({ success: true, totalUsage, limit });
});

exports.saveMetadata = catchAsync(async (req, res, next) => {
  const file = await FileService.saveMetadata(req.user.id, req.body);
  res.status(201).json({ success: true, file });
});

exports.listFiles = catchAsync(async (req, res, next) => {
  const folderId = req.query.folderId || null;
  const files = await FileService.listFiles(req.user.id, folderId);
  res.status(200).json({ success: true, files });
});

exports.downloadFile = catchAsync(async (req, res, next) => {
  const url = await FileService.getDownloadUrl(req.user.id, req.params.fileId);
  res.status(200).json({ success: true, downloadUrl: url });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  await FileService.deleteFile(req.user.id, req.params.fileId);
  res.status(200).json({ success: true, message: 'File deleted' });
});