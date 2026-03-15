const { Router } = require('express');
const { triggerEDA, getEDA } = require('../controllers/edaController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/:datasetId', triggerEDA);
router.get('/:datasetId', getEDA);

module.exports = router;
