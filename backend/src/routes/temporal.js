const { Router } = require('express');
const { getTemporalData } = require('../controllers/temporalController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/:datasetId', getTemporalData);

module.exports = router;
