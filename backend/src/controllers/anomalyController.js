const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runAnomalyDetection } = require('../services/aiService');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const detectAnomalies = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const options = req.body || {};
    const { data: anomalyResult } = await runAnomalyDetection(
      dataset._id.toString(),
      dataset.path,
      options
    );

    const result = await AnalyticsResult.findOneAndUpdate(
      { datasetId: dataset._id, type: 'anomaly' },
      { datasetId: dataset._id, type: 'anomaly', result: anomalyResult },
      { upsert: true, new: true }
    );

    return success(res, result, 'Anomaly detection completed');
  } catch (err) {
    console.error('[anomalyController.detectAnomalies]', err);
    return error(res, err.message, err.status || 500);
  }
};

const getAnomalies = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const result = await AnalyticsResult.findOne({
      datasetId: req.params.datasetId,
      type: 'anomaly',
    });

    if (!result) return notFound(res, 'No anomaly results found. Run detection first.');
    return success(res, result);
  } catch (err) {
    console.error('[anomalyController.getAnomalies]', err);
    return error(res, err.message);
  }
};

module.exports = { detectAnomalies, getAnomalies };
