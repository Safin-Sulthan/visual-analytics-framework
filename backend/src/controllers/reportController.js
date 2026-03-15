const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const { reportQueue } = require('../queues/reportQueue');
const { success, created, notFound, forbidden, error } = require('../utils/apiResponse');

const generateReport = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const report = await Report.create({
      datasetId: dataset._id,
      userId: req.user.id,
      status: 'pending',
    });

    await reportQueue.add('generate-report', {
      reportId: report._id.toString(),
      datasetId: dataset._id.toString(),
      options: req.body || {},
    });

    return created(res, report, 'Report generation queued');
  } catch (err) {
    console.error('[reportController.generateReport]', err);
    return error(res, err.message);
  }
};

const getReports = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const reports = await Report.find({ datasetId: req.params.datasetId }).sort({
      createdAt: -1,
    });
    return success(res, reports);
  } catch (err) {
    console.error('[reportController.getReports]', err);
    return error(res, err.message);
  }
};

const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return notFound(res, 'Report not found');
    if (report.userId.toString() !== req.user.id) return forbidden(res);
    if (report.status !== 'ready' || !report.filePath) {
      return error(res, 'Report is not ready for download', 409);
    }

    const absPath = path.resolve(report.filePath);
    if (!fs.existsSync(absPath)) {
      return notFound(res, 'Report file not found on disk');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report_${report._id}.pdf"`
    );
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    console.error('[reportController.downloadReport]', err);
    return error(res, err.message);
  }
};

module.exports = { generateReport, getReports, downloadReport };
