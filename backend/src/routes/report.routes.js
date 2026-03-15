const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { generateReport, getReports, downloadReport } = require('../controllers/report.controller');

router.use(auth);

router.post('/generate',       generateReport);
router.get('/',                getReports);
router.get('/:id/download',    downloadReport);

module.exports = router;
