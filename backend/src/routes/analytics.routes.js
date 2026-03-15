const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { getAnalytics, triggerAnalysis, getNLQuery } = require('../controllers/analytics.controller');

router.use(auth);

router.get('/:datasetId',         getAnalytics);
router.post('/:datasetId/trigger', triggerAnalysis);
router.post('/:datasetId/query',   getNLQuery);

module.exports = router;
