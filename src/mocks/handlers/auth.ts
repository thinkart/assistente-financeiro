import { http, HttpResponse } from 'msw'
import type { AuthResponse, User } from '@/types'
import { applyMockDelay } from '../delay'

export const MOCK_ACCESS_TOKEN = 'mock-access-token'

interface StoredUser extends User {
  password: string
}

const users: StoredUser[] = [
  {
    id: 'u-demo',
    name: 'Demo',
    email: 'demo@financas.dev',
    password: '123456',
  },
]

const toPublicUser = ({ id, name, email }: StoredUser): User => ({
  id,
  name,
  email,
})

const errorResponse = (status: number, message: string) =>
  HttpResponse.json({ message }, { status })

interface CredentialsBody {
  name?: string
  email?: string
  password?: string
}

export const authHandlers = [
  http.post('*/auth/register', async ({ request }) => {
    await applyMockDelay()

    const { name, email, password } = (await request.json()) as CredentialsBody

    if (!name || !email || !password) {
      return errorResponse(400, 'Nome, e-mail e senha são obrigatórios')
    }

    if (users.some((user) => user.email === email)) {
      return errorResponse(400, 'E-mail já cadastrado')
    }

    const user: StoredUser = {
      id: `u${users.length + 1}`,
      name,
      email,
      password,
    }
    users.push(user)

    return HttpResponse.json(toPublicUser(user), { status: 201 })
  }),

  http.post('*/auth/login', async ({ request }) => {
    await applyMockDelay()

    const { email, password } = (await request.json()) as CredentialsBody

    const user = users.find(
      (candidate) =>
        candidate.email === email && candidate.password === password,
    )

    if (!user) {
      return errorResponse(401, 'Credenciais inválidas')
    }

    const auth: AuthResponse = {
      access_token: MOCK_ACCESS_TOKEN,
      token_type: 'Bearer',
    }

    return HttpResponse.json(auth)
  }),

  http.get('*/auth/me', async ({ request }) => {
    await applyMockDelay()

    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')

    if (token !== MOCK_ACCESS_TOKEN) {
      return errorResponse(401, 'Token inválido ou ausente')
    }

    return HttpResponse.json(toPublicUser(users[0]))
  }),
]
