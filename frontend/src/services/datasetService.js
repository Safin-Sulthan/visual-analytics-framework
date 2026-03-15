import api from './api';

const datasetService = {
  getDatasets: async () => {
    const response = await api.get('/datasets');
    return response.data;
  },

  getDataset: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  uploadDataset: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return response.data;
  },

  deleteDataset: async (id) => {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
  },

  getDatasetPreview: async (id, page = 1, perPage = 20) => {
    const response = await api.get(`/datasets/${id}/preview`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  getDatasetStats: async (id) => {
    const response = await api.get(`/datasets/${id}/stats`);
    return response.data;
  }
};

export default datasetService;
