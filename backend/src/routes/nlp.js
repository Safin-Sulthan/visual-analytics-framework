const { Router } = require('express');
const { query, getNLPHistory, nlpQueryValidation } = require('../controllers/nlpController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.post('/query', nlpQueryValidation, validate, query);
router.get('/history/:datasetId', getNLPHistory);

module.exports = router;
