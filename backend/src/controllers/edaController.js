const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runEDA } = require('../services/aiService');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const triggerEDA = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const { data: edaResult } = await runEDA(dataset._id.toString(), dataset.path);

    const result = await AnalyticsResult.findOneAndUpdate(
      { datasetId: dataset._id, type: 'eda' },
      { datasetId: dataset._id, type: 'eda', result: edaResult },
      { upsert: true, new: true }
    );

    return success(res, result, 'EDA completed');
  } catch (err) {
    console.error('[edaController.triggerEDA]', err);
    return error(res, err.message, err.status || 500);
  }
};

const getEDA = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const result = await AnalyticsResult.findOne({
      datasetId: req.params.datasetId,
      type: 'eda',
    });

    if (!result) return notFound(res, 'EDA results not found. Trigger EDA first.');
    return success(res, result);
  } catch (err) {
    console.error('[edaController.getEDA]', err);
    return error(res, err.message);
  }
};

module.exports = { triggerEDA, getEDA };
