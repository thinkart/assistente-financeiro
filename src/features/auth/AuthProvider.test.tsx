import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UNAUTHORIZED_EVENT } from '@/services/api'
import { getStoredToken, setStoredToken } from '@/services/token'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './auth-context'

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider })

describe('AuthProvider (AC-004)', () => {
  it('começa deslogado e sem carregamento quando não há token', () => {
    const { result } = renderAuth()

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('restaura a sessão com token válido no boot', async () => {
    setStoredToken('mock-access-token')

    const { result } = renderAuth()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user?.email).toBe('demo@financas.dev')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('limpa a sessão quando o token restaurado é inválido', async () => {
    setStoredToken('token-invalido')

    const { result } = renderAuth()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })

  it('signIn autentica, guarda o token e retorna o usuário', async () => {
    const { result } = renderAuth()

    await act(async () => {
      await result.current.signIn({
        email: 'demo@financas.dev',
        password: '123456',
      })
    })

    expect(getStoredToken()).toBe('mock-access-token')
    expect(result.current.user?.email).toBe('demo@financas.dev')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('signIn rejeita credenciais inválidas sem autenticar', async () => {
    const { result } = renderAuth()

    await act(async () => {
      await expect(
        result.current.signIn({
          email: 'demo@financas.dev',
          password: 'senha-errada',
        }),
      ).rejects.toMatchObject({ response: { status: 401 } })
    })

    expect(result.current.user).toBeNull()
    expect(getStoredToken()).toBeNull()
  })

  it('signUp cria a conta e já autentica', async () => {
    const { result } = renderAuth()
    const email = `nova-${Date.now()}@financas.dev`

    await act(async () => {
      await result.current.signUp({
        name: 'Nova Pessoa',
        cpf: '98765432100',
        email,
        phone: '(11) 98888-7777',
        password: '123456',
      })
    })

    expect(result.current.user?.email).toBe(email)
    expect(result.current.isAuthenticated).toBe(true)
    expect(getStoredToken()).toBe('mock-access-token')
  })

  it('signOut limpa o usuário e o token', async () => {
    const { result } = renderAuth()

    await act(async () => {
      await result.current.signIn({
        email: 'demo@financas.dev',
        password: '123456',
      })
    })

    act(() => {
      result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })

  it('derruba a sessão ao receber financas:unauthorized', async () => {
    const { result } = renderAuth()

    await act(async () => {
      await result.current.signIn({
        email: 'demo@financas.dev',
        password: '123456',
      })
    })

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
