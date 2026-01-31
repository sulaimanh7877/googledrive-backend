const FolderService = require('../services/folderService');
const catchAsync = require('../utils/catchAsync');

exports.createFolder = catchAsync(async (req, res, next) => {
  const { name, parentFolderId } = req.body;
  const folder = await FolderService.createFolder(req.user.id, name, parentFolderId);
  res.status(201).json({ success: true, folder });
});

exports.getContents = catchAsync(async (req, res, next) => {
  const folderId = req.params.folderId !== 'root' ? req.params.folderId : null;
  const contents = await FolderService.getContents(req.user.id, folderId);
  res.status(200).json({ success: true, ...contents });
});

exports.deleteFolder = catchAsync(async (req, res, next) => {
  await FolderService.deleteFolder(req.user.id, req.params.folderId);
  res.status(200).json({ success: true, message: 'Folder deleted' });
});