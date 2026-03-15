const express = require('express');
const { list, markRead, markAllRead } = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dataset/:datasetId', list);
router.patch('/:id/read', markRead);
router.patch('/dataset/:datasetId/read-all', markAllRead);

module.exports = router;
