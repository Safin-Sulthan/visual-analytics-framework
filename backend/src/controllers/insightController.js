const Dataset = require('../models/Dataset');
const Insight = require('../models/Insight');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runInsights } = require('../services/aiService');
const { success, notFound, forbidden, error } = require('../utils/apiResponse');

const generateInsights = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const edaRecord = await AnalyticsResult.findOne({
      datasetId: dataset._id,
      type: 'eda',
    });

    const { data: insightsData } = await runInsights(
      dataset._id.toString(),
      edaRecord?.result || {}
    );

    const rawInsights = Array.isArray(insightsData) ? insightsData : insightsData.insights || [];

    await Insight.deleteMany({ datasetId: dataset._id });

    const insights = await Insight.insertMany(
      rawInsights.map((item, index) => ({
        datasetId: dataset._id,
        userId: req.user.id,
        type: item.type || 'general',
        title: item.title || `Insight ${index + 1}`,
        description: item.description || '',
        score: item.score || 0,
        rank: index + 1,
        metadata: item.metadata || {},
      }))
    );

    return success(res, insights, 'Insights generated successfully');
  } catch (err) {
    console.error('[insightController.generateInsights]', err);
    return error(res, err.message, err.status || 500);
  }
};

const getInsights = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    const insights = await Insight.find({ datasetId: req.params.datasetId }).sort({ rank: 1 });
    return success(res, insights);
  } catch (err) {
    console.error('[insightController.getInsights]', err);
    return error(res, err.message);
  }
};

module.exports = { generateInsights, getInsights };
