const Insight = require('../models/Insight');

const WEIGHTS = {
  statisticalSignificance: 0.5,
  businessImpact: 0.3,
  anomalySeverity: 0.2,
};

/**
 * Compute an insight score using the weighted formula:
 *   InsightScore = 0.5 × statistical_significance
 *                + 0.3 × business_impact
 *                + 0.2 × anomaly_severity
 */
const computeScore = (insight) => {
  return (
    WEIGHTS.statisticalSignificance * (insight.statisticalSignificance || 0) +
    WEIGHTS.businessImpact * (insight.businessImpact || 0) +
    WEIGHTS.anomalySeverity * (insight.anomalySeverity || 0)
  );
};

/**
 * Re-compute scores for an array of plain insight objects, then sort
 * highest-score first and return all of them.
 */
const rankInsights = (insights) => {
  return insights
    .map((insight) => {
      const computed = computeScore(insight);
      return { ...insight, score: Math.round(computed * 10000) / 10000 };
    })
    .sort((a, b) => b.score - a.score);
};

/**
 * Fetch insights from MongoDB for the given dataset (or all datasets),
 * rank them, and return the top `limit` results.
 */
const getTopInsights = async (datasetId, limit = 5) => {
  const filter = { isActive: true };
  if (datasetId) filter.datasetId = datasetId;

  const docs = await Insight.find(filter).select('-__v').lean();
  const ranked = rankInsights(docs);
  return ranked.slice(0, limit);
};

module.exports = { computeScore, rankInsights, getTopInsights };
