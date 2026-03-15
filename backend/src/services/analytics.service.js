const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const requestAnalysis = async (datasetId, filePath) => {
  const response = await axios.post(`${AI_ENGINE_URL}/analysis/full`, {
    dataset_id: datasetId,
    file_path:  filePath,
  }, { timeout: 120000 });
  return response.data;
};

const requestPrediction = async (datasetId, targetCol, periods = 30) => {
  const response = await axios.post(`${AI_ENGINE_URL}/prediction/forecast`, {
    dataset_id: datasetId,
    target_col: targetCol,
    periods,
  }, { timeout: 120000 });
  return response.data;
};

const requestNLQuery = async (datasetId, filePath, query) => {
  const response = await axios.post(`${AI_ENGINE_URL}/insights/nlquery`, {
    dataset_id: datasetId,
    file_path:  filePath,
    query,
  }, { timeout: 30000 });
  return response.data;
};

module.exports = { requestAnalysis, requestPrediction, requestNLQuery };
