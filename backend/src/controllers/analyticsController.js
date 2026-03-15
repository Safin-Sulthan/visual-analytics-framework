const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const getAnalytics = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const results = await AnalyticsResult.find({ datasetId: req.params.datasetId }).sort({
      type: 1,
      createdAt: -1,
    });

    return success(res, results);
  } catch (err) {
    console.error('[analyticsController.getAnalytics]', err);
    return error(res, err.message);
  }
};

module.exports = { getAnalytics };
