const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { getInsights, getTopInsights } = require('../controllers/insight.controller');

router.use(auth);

router.get('/:datasetId',     getInsights);
router.get('/:datasetId/top', getTopInsights);

module.exports = router;
