const { Router } = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/:datasetId', getAnalytics);

module.exports = router;
