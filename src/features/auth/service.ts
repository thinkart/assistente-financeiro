import { api } from '@/services/api'
import type { ApiEnvelope, AuthResponse, RegisterPayload, User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export type ProfilePayload = Pick<User, 'name' | 'email' | 'cpf' | 'phone'>

export const loginRequest = async (credentials: LoginCredentials) => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data
}

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await api.post<ApiEnvelope<User>>('/auth/register', payload)
  return data.data
}

export const meRequest = async () => {
  const { data } = await api.get<ApiEnvelope<User>>('/auth/me')
  return data.data
}

export const updateProfileRequest = async (payload: ProfilePayload) => {
  const { data } = await api.put<ApiEnvelope<User>>('/auth/me', payload)
  return data.data
}
