const { Router } = require('express');
const { uploadDataset, listDatasets, getDataset, deleteDataset } = require('../controllers/datasetController');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), handleUploadError, uploadDataset);
router.get('/', listDatasets);
router.get('/:id', getDataset);
router.delete('/:id', deleteDataset);

module.exports = router;
