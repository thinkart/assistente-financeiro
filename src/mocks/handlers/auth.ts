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
    cpf: '12345678900',
    phone: '(11) 99999-0000',
    password: '123456',
  },
]

const toPublicUser = ({ id, name, email, cpf, phone }: StoredUser): User => ({
  id,
  name,
  email,
  cpf,
  phone,
})

const errorResponse = (status: number, message: string) =>
  HttpResponse.json({ message }, { status })

interface RegisterBody {
  name?: unknown
  cpf?: unknown
  email?: unknown
  phone?: unknown
  password?: unknown
}

interface LoginBody {
  email?: string
  password?: string
}

export const authHandlers = [
  http.post('*/auth/register', async ({ request }) => {
    await applyMockDelay()

    const { name, cpf, email, phone, password } =
      (await request.json()) as RegisterBody

    if (
      typeof name !== 'string' ||
      name.trim() === '' ||
      typeof cpf !== 'string' ||
      cpf.replace(/\D/g, '').length !== 11 ||
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof phone !== 'string' ||
      phone.replace(/\D/g, '').length < 10 ||
      typeof password !== 'string' ||
      password === ''
    ) {
      return errorResponse(
        400,
        'Nome, CPF (11 dígitos), e-mail, telefone e senha são obrigatórios',
      )
    }

    if (users.some((user) => user.email === email.trim())) {
      return errorResponse(400, 'E-mail já cadastrado')
    }

    if (users.some((user) => user.cpf === cpf)) {
      return errorResponse(400, 'CPF já cadastrado')
    }

    const user: StoredUser = {
      id: `u${users.length + 1}`,
      name: name.trim(),
      email: email.trim(),
      cpf,
      phone,
      password,
    }
    users.push(user)

    return HttpResponse.json(toPublicUser(user), { status: 201 })
  }),

  http.post('*/auth/login', async ({ request }) => {
    await applyMockDelay()

    const { email, password } = (await request.json()) as LoginBody

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
