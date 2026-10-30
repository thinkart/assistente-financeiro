import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MOCK_DELAY_MS, resolveMockDelay } from '@/mocks/delay'
import { server } from '@/mocks/server'
import { MOCK_ACCESS_TOKEN } from './auth'

const API_URL = 'http://127.0.0.1:5000'

const postJson = (path: string, body: unknown) =>
  fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('handlers de auth (AC-004)', () => {
  it('registra um usuário novo com 201', async () => {
    const response = await postJson('/auth/register', {
      name: 'Ana Souza',
      cpf: '98765432100',
      email: `ana-${Date.now()}@financas.dev`,
      phone: '(11) 98888-7777',
      password: '123456',
    })

    expect(response.status).toBe(201)

    const body = (await response.json()) as {
      message: string
      data: {
        id: string
        name: string
        email: string
        cpf: string
        phone: string
      }
    }
    expect(body.message).toBe('Usuário cadastrado com sucesso')
    expect(body.data.id).toBeTruthy()
    expect(body.data.name).toBe('Ana Souza')
    expect(body.data.cpf).toBe('98765432100')
    expect(body.data.phone).toBe('(11) 98888-7777')
  })

  it('rejeita registro com e-mail duplicado (400)', async () => {
    const response = await postJson('/auth/register', {
      name: 'Demo',
      cpf: '11122233344',
      email: 'demo@financas.dev',
      phone: '(11) 97777-6666',
      password: '123456',
    })

    expect(response.status).toBe(400)
  })

  it('rejeita registro com CPF duplicado (400)', async () => {
    const response = await postJson('/auth/register', {
      name: 'Outra Pessoa',
      cpf: '12345678900',
      email: `outra-${Date.now()}@financas.dev`,
      phone: '(11) 96666-5555',
      password: '123456',
    })

    expect(response.status).toBe(400)
  })

  it('rejeita registro com payload inválido (422)', async () => {
    const response = await postJson('/auth/register', {
      name: 'A',
      cpf: '123',
      email: 'invalido',
      phone: '1',
      password: '123',
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as { detail: { msg: string }[] }
    expect(body.detail[0].msg).toContain('Dados inválidos')
  })

  it('faz login com credenciais válidas e retorna access_token', async () => {
    const response = await postJson('/auth/login', {
      email: 'demo@financas.dev',
      password: '123456',
    })

    expect(response.status).toBe(200)

    const body = (await response.json()) as {
      access_token: string
      token_type: string
      message: string
    }
    expect(body.access_token).toBe(MOCK_ACCESS_TOKEN)
    expect(body.token_type).toBe('Bearer')
    expect(body.message).toBe('Login efetuado com sucesso')
  })

  it('rejeita login com credenciais inválidas (401)', async () => {
    const response = await postJson('/auth/login', {
      email: 'demo@financas.dev',
      password: 'senha-errada',
    })

    expect(response.status).toBe(401)
  })

  it('retorna o usuário autenticado em /auth/me', async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
    })

    expect(response.status).toBe(200)

    const body = (await response.json()) as { data: { email: string } }
    expect(body.data.email).toBe('demo@financas.dev')
  })

  it('rejeita /auth/me sem token ou com token inválido (401)', async () => {
    const withoutToken = await fetch(`${API_URL}/auth/me`)
    expect(withoutToken.status).toBe(401)

    const withInvalidToken = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: 'Bearer token-errado' },
    })
    expect(withInvalidToken.status).toBe(401)
  })
})

describe('latência simulada (AC-008)', () => {
  it('usa 0 em ambiente de teste e 300 fora dele', () => {
    expect(resolveMockDelay('test')).toBe(0)
    expect(resolveMockDelay('development')).toBe(300)
    expect(resolveMockDelay('production')).toBe(300)
    expect(MOCK_DELAY_MS).toBe(0)
  })
})

describe('infra MSW (AC-009)', () => {
  it('expõe o server usado pelo setup de testes', () => {
    expect(typeof server.listen).toBe('function')
  })

  it('define o browser worker para o navegador', () => {
    const browserSource = readFileSync(
      join(process.cwd(), 'src/mocks/browser.ts'),
      'utf8',
    )

    expect(browserSource).toContain('setupWorker')
    expect(browserSource).toContain("from './handlers'")
  })
})
