const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runTemporal } = require('../services/aiService');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const getTemporalData = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    let result = await AnalyticsResult.findOne({
      datasetId: req.params.datasetId,
      type: 'temporal',
    });

    if (!result) {
      const { data: temporalResult } = await runTemporal(
        dataset._id.toString(),
        dataset.path
      );
      result = await AnalyticsResult.findOneAndUpdate(
        { datasetId: dataset._id, type: 'temporal' },
        { datasetId: dataset._id, type: 'temporal', result: temporalResult },
        { upsert: true, new: true }
      );
    }

    return success(res, result);
  } catch (err) {
    console.error('[temporalController.getTemporalData]', err);
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getTemporalData };
