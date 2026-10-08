import { createContext, useContext } from 'react'
import type { RegisterPayload, User } from '@/types'
import type { LoginCredentials } from './service'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (credentials: LoginCredentials) => Promise<User>
  signUp: (payload: RegisterPayload) => Promise<User>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}
