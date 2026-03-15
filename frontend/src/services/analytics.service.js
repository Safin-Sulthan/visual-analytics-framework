import api from './api';

export const analyticsService = {
  async getAnalytics(datasetId) {
    const response = await api.get(`/analytics/${datasetId}`);
    return response.data;
  },

  async triggerAnalysis(datasetId) {
    const response = await api.post(`/analytics/${datasetId}/trigger`);
    return response.data;
  },

  async getInsights(datasetId) {
    const response = await api.get(`/insights/${datasetId}`);
    return response.data;
  },

  async getTopInsights(datasetId) {
    const response = await api.get(`/insights/${datasetId}/top`);
    return response.data;
  },

  async getPredictions(datasetId) {
    const response = await api.get(`/analytics/${datasetId}`);
    return response.data?.predictions || null;
  },

  async getMonitoring(datasetId) {
    const response = await api.get(`/monitoring/${datasetId}`);
    return response.data;
  },

  async getAlerts(datasetId) {
    const response = await api.get(`/monitoring/${datasetId}/alerts`);
    return response.data;
  },

  async runNLQuery(datasetId, query) {
    const response = await api.post(`/analytics/${datasetId}/query`, { query });
    return response.data;
  },

  async generateReport(datasetId) {
    const response = await api.post('/reports/generate', { datasetId });
    return response.data;
  },

  async getReports() {
    const response = await api.get('/reports');
    return response.data;
  },

  async downloadReport(reportId) {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
