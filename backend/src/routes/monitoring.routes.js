const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { getMonitoringData, getAlerts } = require('../controllers/monitoring.controller');

router.use(auth);

router.get('/:datasetId',        getMonitoringData);
router.get('/:datasetId/alerts', getAlerts);

module.exports = router;
