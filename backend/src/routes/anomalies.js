const { Router } = require('express');
const { detectAnomalies, getAnomalies } = require('../controllers/anomalyController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/:datasetId', detectAnomalies);
router.get('/:datasetId', getAnomalies);

module.exports = router;
