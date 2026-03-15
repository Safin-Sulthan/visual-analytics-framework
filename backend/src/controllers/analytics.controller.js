const Dataset         = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const analyticsService = require('../services/analytics.service');
const { addAnalyticsJob } = require('../services/queue.service');

const getAnalytics = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const [eda, ml] = await Promise.all([
      AnalyticsResult.findOne({ datasetId, type: 'eda' }),
      AnalyticsResult.findOne({ datasetId, type: 'ml'  }),
    ]);

    res.json({
      dataset,
      eda:         eda?.result  || null,
      ml:          ml?.result   || null,
      predictions: null,
    });
  } catch (err) {
    next(err);
  }
};

const triggerAnalysis = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    await addAnalyticsJob(datasetId);
    res.json({ message: 'Analysis job queued' });
  } catch (err) {
    next(err);
  }
};

const getNLQuery = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const result = await analyticsService.requestNLQuery(datasetId, dataset.filePath, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, triggerAnalysis, getNLQuery };
