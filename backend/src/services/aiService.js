const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_ENGINE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

aiClient.interceptors.response.use(
  (response) => response,
  (err) => {
    const message =
      err.response?.data?.detail || err.response?.data?.message || err.message;
    const status = err.response?.status || 503;
    const enhanced = new Error(`AI Engine error: ${message}`);
    enhanced.status = status;
    enhanced.originalError = err;
    return Promise.reject(enhanced);
  }
);

const runEDA = (datasetId, filePath) =>
  aiClient.post('/eda', { dataset_id: datasetId, file_path: filePath });

const runInsights = (datasetId, edaResult) =>
  aiClient.post('/insights', { dataset_id: datasetId, eda_result: edaResult });

const runTemporal = (datasetId, filePath) =>
  aiClient.post('/temporal', { dataset_id: datasetId, file_path: filePath });

const runPredictions = (datasetId, filePath, options = {}) =>
  aiClient.post('/predict', { dataset_id: datasetId, file_path: filePath, ...options });

const runAnomalyDetection = (datasetId, filePath, options = {}) =>
  aiClient.post('/anomalies', { dataset_id: datasetId, file_path: filePath, ...options });

const runNLPQuery = (datasetId, query, context = {}) =>
  aiClient.post('/nlp/query', { dataset_id: datasetId, query, context });

const generateReport = (datasetId, options = {}) =>
  aiClient.post('/reports/generate', { dataset_id: datasetId, ...options });

module.exports = {
  runEDA,
  runInsights,
  runTemporal,
  runPredictions,
  runAnomalyDetection,
  runNLPQuery,
  generateReport,
};
