import api from './api';

const alertService = {
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getAlert: async (id) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  acknowledgeAlert: async (id) => {
    const response = await api.put(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  dismissAlert: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  getAlertsByDataset: async (datasetId) => {
    const response = await api.get('/alerts', { params: { dataset_id: datasetId } });
    return response.data;
  }
};

export default alertService;
