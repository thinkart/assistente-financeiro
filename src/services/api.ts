import axios, { type AxiosError } from 'axios'
import { clearStoredToken, getStoredToken } from './token'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export const UNAUTHORIZED_EVENT = 'financas:unauthorized'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const isAuthAttempt = (url: string | undefined) =>
  Boolean(url?.includes('/auth/login') || url?.includes('/auth/register'))

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url

    if (error.response?.status === 401 && !isAuthAttempt(url)) {
      clearStoredToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(error)
  },
)
