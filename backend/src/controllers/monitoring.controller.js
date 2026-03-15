const AnalyticsResult = require('../models/AnalyticsResult');
const Dataset         = require('../models/Dataset');

const getMonitoringData = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const result = await AnalyticsResult.findOne({ datasetId, type: 'ml' });
    const monitoring = result?.result?.monitoring || {};

    res.json({
      trends:          monitoring.trends          || [],
      trend_direction: monitoring.trend_direction || 'stable',
      growth_rate:     monitoring.growth_rate     || '0%',
      seasonality:     monitoring.seasonality     || 'none',
      alerts:          monitoring.alerts          || [],
    });
  } catch (err) {
    next(err);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const result = await AnalyticsResult.findOne({ datasetId, type: 'ml' });
    const alerts = result?.result?.monitoring?.alerts || [];

    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMonitoringData, getAlerts };
