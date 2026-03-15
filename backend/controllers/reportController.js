const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const Dataset = require('../models/Dataset');
const Insight = require('../models/Insight');
const Alert = require('../models/Alert');
const { generatePDF } = require('../services/reportService');
const { success, error } = require('../utils/responseHelper');

const generate = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { title, description } = req.body;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const report = await Report.create({
      datasetId,
      userId: req.user.id,
      title: title || `Report for ${dataset.name}`,
      description: description || '',
      status: 'generating',
    });

    const [insights, alerts] = await Promise.all([
      Insight.find({ datasetId, isActive: true }).sort({ score: -1 }).limit(20),
      Alert.find({ datasetId }).sort({ createdAt: -1 }).limit(20),
    ]);

    generatePDF(dataset, insights, alerts)
      .then(async (filePath) => {
        await Report.findByIdAndUpdate(report._id, {
          filePath,
          status: 'completed',
          sections: { insights: insights.length, alerts: alerts.length },
        });
      })
      .catch(async (err) => {
        await Report.findByIdAndUpdate(report._id, { status: 'failed' });
        console.error('PDF generation failed:', err.message);
      });

    return success(res, { report }, 'Report generation started', 202);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const list = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('datasetId', 'name')
      .select('-__v');
    return success(res, { reports, total: reports.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const download = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });

    if (!report) {
      return error(res, 'Report not found', 404);
    }

    if (report.status !== 'completed' || !report.filePath) {
      return error(res, 'Report is not ready yet', 409);
    }

    if (!fs.existsSync(report.filePath)) {
      return error(res, 'Report file not found on disk', 404);
    }

    res.download(report.filePath, path.basename(report.filePath));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { generate, list, download };
