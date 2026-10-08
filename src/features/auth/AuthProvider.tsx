import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { UNAUTHORIZED_EVENT } from '@/services/api'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/services/token'
import type { RegisterPayload, User } from '@/types'
import { AuthContext, type AuthContextValue } from './auth-context'
import {
  loginRequest,
  meRequest,
  registerRequest,
  type LoginCredentials,
} from './service'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()))

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      if (!getStoredToken()) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await meRequest()
        if (active) setUser(currentUser)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void restoreSession()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => setUser(null)

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const auth = await loginRequest(credentials)
    setStoredToken(auth.access_token)

    const currentUser = await meRequest()
    setUser(currentUser)

    return currentUser
  }, [])

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest(payload)

      return signIn({ email: payload.email, password: payload.password })
    },
    [signIn],
  )

  const signOut = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
