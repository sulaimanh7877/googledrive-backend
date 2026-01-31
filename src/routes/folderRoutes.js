const express = require('express');
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all folder routes
router.use(authMiddleware.protect);

// Resolve full folder path (used for folder uploads)
router.post('/resolve-path', folderController.resolvePath);

// Standard folder operations
router.post('/', folderController.createFolder);
router.get('/:folderId', folderController.getContents);
router.delete('/:folderId', folderController.deleteFolder);

module.exports = router;
