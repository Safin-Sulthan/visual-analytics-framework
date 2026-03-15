import api from './api';

const insightService = {
  getInsights: async (datasetId) => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const response = await api.get('/insights', { params });
    return response.data;
  },

  getInsight: async (id) => {
    const response = await api.get(`/insights/${id}`);
    return response.data;
  },

  generateInsights: async (datasetId) => {
    const response = await api.post(`/insights/generate`, { dataset_id: datasetId });
    return response.data;
  },

  queryInsights: async (question, datasetId) => {
    const response = await api.post('/insights/query', {
      question,
      dataset_id: datasetId
    });
    return response.data;
  },

  getInsightsByType: async (type) => {
    const response = await api.get('/insights', { params: { type } });
    return response.data;
  }
};

export default insightService;
