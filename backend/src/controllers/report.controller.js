const fs            = require('fs');
const path          = require('path');
const Report        = require('../models/Report');
const Dataset       = require('../models/Dataset');
const reportService = require('../services/report.service');

const generateReport = async (req, res, next) => {
  try {
    const { datasetId } = req.body;
    if (!datasetId) return res.status(400).json({ message: 'datasetId is required' });

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const { filePath, content } = await reportService.generatePDFReport(datasetId);

    const report = await Report.create({
      datasetId,
      userId:   req.user._id,
      title:    `Analytics Report — ${dataset.name}`,
      content,
      filePath,
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .populate('datasetId', 'name')
      .sort({ generatedAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!report.filePath || !fs.existsSync(report.filePath)) {
      return res.status(404).json({ message: 'Report file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(report.filePath)}"`);
    fs.createReadStream(report.filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateReport, getReports, downloadReport };
