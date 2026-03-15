const Insight = require('../models/Insight');
const Dataset = require('../models/Dataset');

const getInsights = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const insights = await Insight.find({ datasetId }).sort({ rank: 1, score: -1 });
    res.json(insights);
  } catch (err) {
    next(err);
  }
};

const getTopInsights = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const top = await Insight.find({ datasetId }).sort({ score: -1 }).limit(5);
    res.json(top);
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights, getTopInsights };
