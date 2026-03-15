const { Router } = require('express');
const { generateInsights, getInsights } = require('../controllers/insightController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/generate/:datasetId', generateInsights);
router.get('/:datasetId', getInsights);

module.exports = router;
