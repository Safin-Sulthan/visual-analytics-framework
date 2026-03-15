import api from './api';

const reportService = {
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  generateReport: async (datasetId, options = {}) => {
    const response = await api.post('/reports/generate', {
      dataset_id: datasetId,
      ...options
    });
    return response.data;
  },

  downloadReport: async (id) => {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  }
};

export default reportService;
