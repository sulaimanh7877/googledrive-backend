const express = require('express');
const folderController = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', folderController.createFolder);
router.get('/:folderId', folderController.getContents);
router.delete('/:folderId', folderController.deleteFolder);

module.exports = router;