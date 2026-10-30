import { beforeEach, describe, expect, it } from 'vitest'
import { clearStoredToken, setStoredToken } from '@/services/token'
import { MOCK_ACCESS_TOKEN } from '@/mocks/handlers/auth'
import { meRequest, registerRequest } from './service'

describe('serviço de auth (AC-001)', () => {
  beforeEach(() => {
    clearStoredToken()
  })

  it('desembrulha o usuário de GET /auth/me', async () => {
    setStoredToken(MOCK_ACCESS_TOKEN)

    const user = await meRequest()

    expect(user.email).toBe('demo@financas.dev')
    expect(user.name).toBe('Demo')
  })

  it('desembrulha o usuário criado em POST /auth/register', async () => {
    const email = `servico-${Date.now()}@financas.dev`

    const user = await registerRequest({
      name: 'Usuário Serviço',
      cpf: '98765432100',
      email,
      phone: '(11) 98888-7777',
      password: '123456',
    })

    expect(user.email).toBe(email)
    expect(user.name).toBe('Usuário Serviço')
  })
})
