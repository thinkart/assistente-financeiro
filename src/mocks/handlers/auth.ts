import { http, HttpResponse } from 'msw'
import type { AuthResponse, User } from '@/types'
import { isValidCpf, isValidPhone } from '@/features/auth/personal-data'
import { applyMockDelay } from '../delay'
import { errorResponse, validationErrorResponse } from './responses'

export const MOCK_ACCESS_TOKEN = 'mock-access-token'

interface StoredUser extends User {
  password: string
}

const AUTH_USERS_STORAGE_KEY = 'financas-mock-users'
const AUTH_TOKENS_STORAGE_KEY = 'financas-mock-tokens'

const defaultDemoUser: StoredUser = {
  id: 'u-demo',
  name: 'Demo',
  email: 'demo@financas.dev',
  cpf: '52998224725',
  phone: '11999990000',
  password: '123456',
}

const readStoredValue = <Value,>(key: string, fallback: Value): Value => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as Value) : fallback
  } catch {
    return fallback
  }
}

const users = readStoredValue<StoredUser[]>(AUTH_USERS_STORAGE_KEY, [
  { ...defaultDemoUser },
])
const tokenUserIds = new Map(
  Object.entries(
    readStoredValue<Record<string, string>>(AUTH_TOKENS_STORAGE_KEY, {
      [MOCK_ACCESS_TOKEN]: defaultDemoUser.id,
    }),
  ),
)

const persistAuthStore = () => {
  try {
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users))
    localStorage.setItem(
      AUTH_TOKENS_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(tokenUserIds)),
    )
  } catch {
    /* Local persistence is optional in private browsing contexts. */
  }
}

export const resetAuthStore = () => {
  users.splice(0, users.length, { ...defaultDemoUser })
  tokenUserIds.clear()
  tokenUserIds.set(MOCK_ACCESS_TOKEN, defaultDemoUser.id)
  persistAuthStore()
}

export const getAuthenticatedUserId = (request: Request) => {
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return tokenUserIds.get(authorization.slice('Bearer '.length)) ?? null
}

const toPublicUser = ({ id, name, email, cpf, phone }: StoredUser): User => ({
  id,
  name,
  email,
  cpf,
  phone,
})

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
  http.put('*/auth/me', async ({ request }) => {
    await applyMockDelay()

    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Sessão inválida')

    const { name, cpf, email, phone } = (await request.json()) as {
      name?: string
      cpf?: string
      email?: string
      phone?: string
    }

    if (
      typeof name !== 'string' ||
      name.trim().length < 3 ||
      typeof cpf !== 'string' ||
      !/^\d{11}$/.test(cpf) ||
      !isValidCpf(cpf) ||
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof phone !== 'string' ||
      !/^\d{10,11}$/.test(phone) ||
      !isValidPhone(phone)
    ) {
      return errorResponse(400, 'Dados inválidos: informe nome, CPF e telefone válidos e e-mail')
    }

    if (users.some((user) => user.email === email.trim() && user.id !== userId)) {
      return errorResponse(400, 'E-mail já cadastrado')
    }

    if (users.some((user) => user.cpf === cpf && user.id !== userId)) {
      return errorResponse(400, 'CPF já cadastrado')
    }

    const user = users.find((candidate) => candidate.id === userId)
    if (!user) {
      return errorResponse(401, 'Sessão inválida')
    }

    user.name = name.trim()
    user.email = email.trim()
    user.cpf = cpf
    user.phone = phone
    persistAuthStore()

    return HttpResponse.json({
      message: 'Perfil atualizado com sucesso',
      data: toPublicUser(user),
    })
  }),

  http.post('*/auth/register', async ({ request }) => {
    await applyMockDelay()

    const { name, cpf, email, phone, password } =
      (await request.json()) as RegisterBody

    if (
      typeof name !== 'string' ||
      name.trim().length < 3 ||
      typeof cpf !== 'string' ||
      !/^\d{11}$/.test(cpf) ||
      !isValidCpf(cpf) ||
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof phone !== 'string' ||
      !/^\d{10,11}$/.test(phone) ||
      !isValidPhone(phone) ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return validationErrorResponse(
        'Dados inválidos: informe nome, CPF, e-mail, telefone válidos e senha (mínimo 6)',
      )
    }

    if (users.some((user) => user.email === email.trim())) {
      return errorResponse(400, 'E-mail já cadastrado')
    }

    if (users.some((user) => user.cpf === cpf)) {
      return errorResponse(400, 'CPF já cadastrado')
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      cpf,
      phone,
      password,
    }
    users.push(user)
    persistAuthStore()

    return HttpResponse.json(
      {
        message: 'Usuário cadastrado com sucesso',
        data: toPublicUser(user),
      },
      { status: 201 },
    )
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

    const accessToken =
      user.id === defaultDemoUser.id
        ? MOCK_ACCESS_TOKEN
        : `mock-access-token-${user.id}`
    tokenUserIds.set(accessToken, user.id)
    persistAuthStore()

    const auth: AuthResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      message: 'Login efetuado com sucesso',
    }

    return HttpResponse.json(auth)
  }),

  http.get('*/auth/me', async ({ request }) => {
    await applyMockDelay()

    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const user = users.find((candidate) => candidate.id === userId)
    if (!user) {
      return errorResponse(401, 'Sessão inválida')
    }

    return HttpResponse.json({ data: toPublicUser(user) })
  }),
]
