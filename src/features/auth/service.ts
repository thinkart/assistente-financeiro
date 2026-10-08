import { api } from '@/services/api'
import type { AuthResponse, RegisterPayload, User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export const loginRequest = async (credentials: LoginCredentials) => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data
}

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await api.post<User>('/auth/register', payload)
  return data
}

export const meRequest = async () => {
  const { data } = await api.get<User>('/auth/me')
  return data
}
