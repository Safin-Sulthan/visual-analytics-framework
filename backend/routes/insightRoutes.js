const express = require('express');
const { list, getById, dismiss } = require('../controllers/insightController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dataset/:datasetId', list);
router.get('/:id', getById);
router.patch('/:id/dismiss', dismiss);

module.exports = router;
