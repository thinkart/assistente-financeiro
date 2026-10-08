import { describe, expect, it, vi } from 'vitest'
import { API_URL, UNAUTHORIZED_EVENT, api } from './api'
import { clearStoredToken, getStoredToken, setStoredToken } from './token'

describe('instância Axios (AC-001)', () => {
  it('usa VITE_API_URL como baseURL (fallback para a API local)', () => {
    expect(API_URL).toBe('http://127.0.0.1:5000')
    expect(api.defaults.baseURL).toBe('http://127.0.0.1:5000')
  })

  it('conversa com a API mockada via axios', async () => {
    const response = await api.get<{ id: string }[]>('/categories')

    expect(response.status).toBe(200)
    expect(response.data.length).toBeGreaterThan(0)
  })

  it('recebe 401 do mock ao chamar rota protegida sem token', async () => {
    await expect(api.get('/auth/me')).rejects.toMatchObject({
      response: { status: 401 },
    })
  })
})

describe('sessão e interceptors (AC-005)', () => {
  it('anexa Authorization Bearer quando há token armazenado', async () => {
    setStoredToken('mock-access-token')

    const response = await api.get<{ email: string }>('/auth/me')

    expect(response.status).toBe(200)
    expect(response.data.email).toBe('demo@financas.dev')
  })

  it('em 401 de rota autenticada, limpa o token e dispara financas:unauthorized', async () => {
    setStoredToken('token-invalido')
    const listener = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)

    await expect(api.get('/auth/me')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(getStoredToken()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)

    window.removeEventListener(UNAUTHORIZED_EVENT, listener)
  })

  it('não limpa o token nem dispara o evento em 401 de login', async () => {
    setStoredToken('sessao-existente')
    const listener = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)

    await expect(
      api.post('/auth/login', {
        email: 'demo@financas.dev',
        password: 'senha-errada',
      }),
    ).rejects.toMatchObject({ response: { status: 401 } })

    expect(getStoredToken()).toBe('sessao-existente')
    expect(listener).not.toHaveBeenCalled()

    window.removeEventListener(UNAUTHORIZED_EVENT, listener)
    clearStoredToken()
  })
})
