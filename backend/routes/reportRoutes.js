const express = require('express');
const { generate, list, download } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/dataset/:datasetId', generate);
router.get('/', list);
router.get('/:id/download', download);

module.exports = router;
