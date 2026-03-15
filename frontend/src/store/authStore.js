import { create } from 'zustand'
import { authService } from '../services/authService'

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

export const useAuthStore = create((set) => ({
  user: storedUser,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.register(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  logout: async () => {
    await authService.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
