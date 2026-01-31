const express = require('express');
const fileController = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/upload-url', fileController.getUploadUrl);
router.post('/', fileController.saveMetadata);
router.get('/storage', fileController.getStorageUsage);
router.get('/', fileController.listFiles);
router.get('/:fileId/download', fileController.downloadFile);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;