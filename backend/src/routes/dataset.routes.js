const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');
const {
  uploadDataset, getDatasets, getDataset, deleteDataset, getDatasetPreview,
} = require('../controllers/dataset.controller');

router.use(auth);

router.get('/',            getDatasets);
router.post('/upload',     upload.single('file'), uploadDataset);
router.get('/:id',         getDataset);
router.delete('/:id',      deleteDataset);
router.get('/:id/preview', getDatasetPreview);

module.exports = router;
