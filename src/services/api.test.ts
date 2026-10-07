import { describe, expect, it } from 'vitest'
import { API_URL, api } from './api'

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
