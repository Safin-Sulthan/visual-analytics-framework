const axios = require('axios');
const Dataset = require('../models/Dataset');
const Insight = require('../models/Insight');
const Alert = require('../models/Alert');
const { addJob } = require('../services/queueService');
const { sendToAIEngine } = require('../services/analyticsService');
const { success, error } = require('../utils/responseHelper');

const getAnalytics = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const [insights, alerts] = await Promise.all([
      Insight.find({ datasetId, isActive: true }).sort({ score: -1 }),
      Alert.find({ datasetId }).sort({ createdAt: -1 }),
    ]);

    const unreadAlerts = alerts.filter((a) => !a.isRead).length;

    return success(res, {
      dataset,
      insights,
      alerts,
      summary: {
        totalInsights: insights.length,
        totalAlerts: alerts.length,
        unreadAlerts,
        status: dataset.status,
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const runNLQuery = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { query } = req.body;

    if (!query) {
      return error(res, 'Query is required', 400);
    }

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiEngineUrl}/nl-query`, {
      query,
      datasetId,
      filePath: dataset.filePath,
      columns: dataset.columns,
    });

    return success(res, { result: response.data });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
      return error(res, 'AI engine unavailable', 503);
    }
    return error(res, err.message, 500);
  }
};

const triggerAnalysis = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    if (dataset.status === 'processing') {
      return error(res, 'Analysis already in progress', 409);
    }

    await Dataset.findByIdAndUpdate(datasetId, { status: 'processing' });
    await addJob(datasetId, dataset.filePath);

    return success(res, { datasetId, status: 'processing' }, 'Analysis triggered successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getAnalytics, runNLQuery, triggerAnalysis };
