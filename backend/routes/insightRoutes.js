const express = require('express');
const { list, getById, dismiss, getTop } = require('../controllers/insightController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

<<<<<<< HEAD
=======
router.get('/top', getTop);
>>>>>>> copilot-pr-5
router.get('/dataset/:datasetId', list);
router.get('/:id', getById);
router.patch('/:id/dismiss', dismiss);

module.exports = router;
