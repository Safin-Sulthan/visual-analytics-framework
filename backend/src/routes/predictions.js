const { Router } = require('express');
const { runPrediction, getPredictions } = require('../controllers/predictionController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/:datasetId', runPrediction);
router.get('/:datasetId', getPredictions);

module.exports = router;
