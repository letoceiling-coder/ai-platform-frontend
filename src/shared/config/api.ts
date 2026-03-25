import axios from 'axios'
import { useAuthStore } from '../../store/auth.store'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://api.siteaacess.ru/api'

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

export { API_URL }
