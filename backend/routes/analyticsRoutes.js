const express = require('express');
const { getAnalytics, runNLQuery, triggerAnalysis } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:datasetId', getAnalytics);
router.post('/:datasetId/nl-query', runNLQuery);
router.post('/:datasetId/trigger', triggerAnalysis);

module.exports = router;
