import axios, { type AxiosError } from 'axios'
import { clearStoredToken, getStoredToken } from './token'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data

  if (typeof data === 'object' && data !== null) {
    const body = data as { detail?: unknown; message?: unknown }

    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message
    }

    if (typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail
    }

    if (Array.isArray(body.detail)) {
      const messages = body.detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (typeof item === 'object' && item !== null) {
            const msg = (item as { msg?: unknown }).msg
            if (typeof msg === 'string') return msg
          }
          return null
        })
        .filter((message): message is string => Boolean(message))

      if (messages.length > 0) return messages.join('; ')
    }
  }

  return fallback
}

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
