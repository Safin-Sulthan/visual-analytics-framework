const express = require('express');
const datasetController = require('../controllers/datasetController');
const { protect } = require('../middlewares/authMiddleware');
const { upload: uploadMiddleware } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', uploadMiddleware.single('file'), datasetController.upload);
router.get('/', datasetController.list);
router.get('/:id', datasetController.getById);
router.delete('/:id', datasetController.delete);
router.get('/:id/preview', datasetController.preview);

module.exports = router;
