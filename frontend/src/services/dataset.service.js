import api from './api';

export const datasetService = {
  async getDatasets() {
    const response = await api.get('/datasets');
    return response.data;
  },

  async getDataset(id) {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  async uploadDataset(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onUploadProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  async deleteDataset(id) {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
  },

  async getDatasetPreview(id) {
    const response = await api.get(`/datasets/${id}/preview`);
    return response.data;
  },
};
