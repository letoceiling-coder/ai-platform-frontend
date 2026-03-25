import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://api.siteaacess.ru'

export const api = axios.create({
  baseURL: API_URL,
})

export { API_URL }
