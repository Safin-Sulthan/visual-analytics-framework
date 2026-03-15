import api from './api';

const analyticsService = {
  getEDA: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/eda`);
    return response.data;
  },

  getCorrelation: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/correlation`);
    return response.data;
  },

  getDistributions: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/distributions`);
    return response.data;
  },

  getCategoricalStats: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/categorical`);
    return response.data;
  },

  getPredictions: async (datasetId, params = {}) => {
    const response = await api.post(`/analytics/${datasetId}/predict`, params);
    return response.data;
  },

  getTimeSeries: async (datasetId, params = {}) => {
    const response = await api.get(`/analytics/${datasetId}/timeseries`, { params });
    return response.data;
  },

  getClusters: async (datasetId, params = {}) => {
    const response = await api.get(`/analytics/${datasetId}/clusters`, { params });
    return response.data;
  },

  getAnomalies: async (datasetId) => {
    const response = await api.get(`/analytics/${datasetId}/anomalies`);
    return response.data;
  }
};

export default analyticsService;
