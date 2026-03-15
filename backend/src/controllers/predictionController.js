const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runPredictions } = require('../services/aiService');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const runPrediction = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const options = req.body || {};
    const { data: predResult } = await runPredictions(
      dataset._id.toString(),
      dataset.path,
      options
    );

    const result = await AnalyticsResult.findOneAndUpdate(
      { datasetId: dataset._id, type: 'prediction' },
      { datasetId: dataset._id, type: 'prediction', result: predResult },
      { upsert: true, new: true }
    );

    return success(res, result, 'Predictions completed');
  } catch (err) {
    console.error('[predictionController.runPrediction]', err);
    return error(res, err.message, err.status || 500);
  }
};

const getPredictions = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const result = await AnalyticsResult.findOne({
      datasetId: req.params.datasetId,
      type: 'prediction',
    });

    if (!result) return notFound(res, 'No prediction results found. Run predictions first.');
    return success(res, result);
  } catch (err) {
    console.error('[predictionController.getPredictions]', err);
    return error(res, err.message);
  }
};

module.exports = { runPrediction, getPredictions };
