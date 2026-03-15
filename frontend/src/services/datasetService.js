import api from './api'

export const datasetService = {
  async list() {
    const { data } = await api.get('/datasets')
    return data
  },

  async upload(file, onProgress) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/datasets/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
    return data
  },

  async get(id) {
    const { data } = await api.get(`/datasets/${id}`)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/datasets/${id}`)
    return data
  },

  async preview(id) {
    const { data } = await api.get(`/datasets/${id}/preview`)
    return data
  },

  async stats(id) {
    const { data } = await api.get(`/datasets/${id}/stats`)
    return data
  },
}
