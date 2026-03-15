import api from './api'

export const aiService = {
  async getInsights(datasetId) {
    const { data } = await api.get(`/ai/insights/${datasetId}`)
    return data
  },

  async getAnomalies(datasetId) {
    const { data } = await api.get(`/ai/anomalies/${datasetId}`)
    return data
  },

  async getPredictions(datasetId, config) {
    const { data } = await api.post(`/ai/predictions/${datasetId}`, config)
    return data
  },

  async getNlpAnalysis(datasetId, query) {
    const { data } = await api.post(`/ai/nlp/${datasetId}`, { query })
    return data
  },

  async generateReport(datasetId, options) {
    const { data } = await api.post(`/ai/report/${datasetId}`, options, {
      responseType: 'blob',
    })
    return data
  },
}
