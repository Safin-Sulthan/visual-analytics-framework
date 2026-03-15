const { Router } = require('express');
const { generateReport, getReports, downloadReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/generate/:datasetId', generateReport);
router.get('/:datasetId', getReports);
router.get('/:id/download', downloadReport);

module.exports = router;
