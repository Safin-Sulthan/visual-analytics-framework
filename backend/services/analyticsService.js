const axios = require('axios');
const Dataset = require('../models/Dataset');
const Insight = require('../models/Insight');
const Alert = require('../models/Alert');

const sendToAIEngine = async (datasetPath, datasetId) => {
  const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';

  const response = await axios.post(`${aiEngineUrl}/analyze`, {
    filePath: datasetPath,
    datasetId,
  });

  return response.data;
};

const processResults = async (datasetId, results) => {
  const { insights = [], alerts = [], metadata = {} } = results;

  const insightDocs = insights.map((insight) => ({
    datasetId,
    type: insight.type || 'eda',
    title: insight.title,
    description: insight.description || '',
    score: insight.score || 0,
    statisticalSignificance: insight.statisticalSignificance || 0,
    businessImpact: insight.businessImpact || 0,
    anomalySeverity: insight.anomalySeverity || 0,
    chartConfig: insight.chartConfig || {},
    data: insight.data || {},
    isActive: true,
  }));

  const alertDocs = alerts.map((alert) => ({
    datasetId,
    type: alert.type || 'anomaly',
    severity: alert.severity || 'medium',
    title: alert.title,
    description: alert.description || '',
    data: alert.data || {},
    isRead: false,
  }));

  await Promise.all([
    insightDocs.length > 0 ? Insight.insertMany(insightDocs) : Promise.resolve(),
    alertDocs.length > 0 ? Alert.insertMany(alertDocs) : Promise.resolve(),
    Dataset.findByIdAndUpdate(datasetId, {
      status: 'completed',
      metadata,
    }),
  ]);

  return { insightsCreated: insightDocs.length, alertsCreated: alertDocs.length };
};

module.exports = { sendToAIEngine, processResults };
