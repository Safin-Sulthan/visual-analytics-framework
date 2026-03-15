import api from './api'

export const analyticsService = {
  async getSummary(datasetId) {
    const { data } = await api.get(`/analytics/summary/${datasetId}`)
    return data
  },

  async getCorrelations(datasetId) {
    const { data } = await api.get(`/analytics/correlations/${datasetId}`)
    return data
  },

  async getDistributions(datasetId) {
    const { data } = await api.get(`/analytics/distributions/${datasetId}`)
    return data
  },

  async getTimeSeries(datasetId, column) {
    const { data } = await api.get(`/analytics/timeseries/${datasetId}`, {
      params: { column },
    })
    return data
  },

  async runEda(datasetId) {
    const { data } = await api.post(`/analytics/eda/${datasetId}`)
    return data
  },
}
