import { http, HttpResponse } from 'msw'
import type { Category, TransactionType } from '@/types'
import { categories as seedCategories } from '../data'
import { applyMockDelay } from '../delay'
import { getAuthenticatedUserId } from './auth'
import { errorResponse, validationErrorResponse } from './responses'
import { getTransactions } from './transactions'

const CATEGORY_STORES_KEY = 'financas-mock-categories'

const categoryStores = new Map<string, Category[]>(
  (() => {
    try {
      const stored = localStorage.getItem(CATEGORY_STORES_KEY)
      return stored
        ? Object.entries(JSON.parse(stored) as Record<string, Category[]>)
        : [['u-demo', [...seedCategories]]]
    } catch {
      return [['u-demo', [...seedCategories]]]
    }
  })(),
)

const persistCategoryStores = () => {
  try {
    localStorage.setItem(
      CATEGORY_STORES_KEY,
      JSON.stringify(Object.fromEntries(categoryStores)),
    )
  } catch {
    /* Local persistence is optional in private browsing contexts. */
  }
}

export const resetCategoryStore = () => {
  categoryStores.clear()
  categoryStores.set('u-demo', [...seedCategories])
  persistCategoryStores()
}

const getCategories = (userId: string) => {
  let categories = categoryStores.get(userId)
  if (!categories) {
    categories = [...seedCategories]
    categoryStores.set(userId, categories)
  }
  return categories
}

export const getCategoryById = (id: string, userId = 'u-demo') =>
  getCategories(userId).find((category) => category.id === id)

interface CategoryBody {
  name?: unknown
  type?: unknown
}

const isTransactionType = (value: unknown): value is TransactionType =>
  value === 'income' || value === 'expense'

const parseCategoryBody = (body: unknown) => {
  if (typeof body !== 'object' || body === null) return null

  const { name, type } = body as CategoryBody
  if (
    typeof name !== 'string' ||
    name.trim().length < 3 ||
    !isTransactionType(type)
  ) {
    return null
  }

  return { name: name.trim(), type }
}

export const categoryHandlers = [
  http.get('*/categories', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')
    return HttpResponse.json({ data: getCategories(userId) })
  }),

  http.post('*/categories', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const parsed = parseCategoryBody(await request.json())
    if (!parsed) {
      return validationErrorResponse(
        'Nome (mínimo 3) e tipo (income/expense) são obrigatórios',
      )
    }

    const categories = getCategories(userId)
    const duplicated = categories.some(
      (category) =>
        category.name === parsed.name && category.type === parsed.type,
    )
    if (duplicated) {
      return errorResponse(409, 'Categoria já cadastrada')
    }

    const category: Category = { id: crypto.randomUUID(), ...parsed }
    categoryStores.set(userId, [...categories, category])
    persistCategoryStores()

    return HttpResponse.json(
      {
        message: 'Categoria cadastrada com sucesso',
        data: category,
      },
      { status: 201 },
    )
  }),

  http.put('*/categories/:id', async ({ params, request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const { id } = params
    const categories = getCategories(userId)
    const existing = categories.find((category) => category.id === id)
    if (!existing) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    const parsed = parseCategoryBody(await request.json())
    if (!parsed) {
      return validationErrorResponse(
        'Nome (mínimo 3) e tipo (income/expense) são obrigatórios',
      )
    }

    const type_changed = parsed.type !== existing.type

    if (type_changed && getTransactions(userId).some(
      (transaction) => transaction.categoryId === existing.id,
    )) {
      return errorResponse(
        409,
        'Erro a categoria não pode ser excluída pois há transações vinculadas',
      )
    }

    const updated: Category = { id: existing.id, ...parsed }
    categoryStores.set(userId, categories.map((category) =>
      category.id === existing.id ? updated : category,
    ))
    persistCategoryStores()

    return HttpResponse.json({
      message: 'Categoria atualizada com sucesso',
      data: updated,
    })
  }),

  http.delete('*/categories/:id', async ({ params, request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const { id } = params
    const categories = getCategories(userId)
    const exists = categories.some((category) => category.id === id)
    if (!exists) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    const isInUse = getTransactions(userId).some(
      (transaction) => transaction.categoryId === id,
    )
    if (isInUse) {
      return errorResponse(
        409,
        'Erro a categoria não pode ser excluída pois há transações vinculadas',
      )
    }

    categoryStores.set(
      userId,
      categories.filter((category) => category.id !== id),
    )
    persistCategoryStores()

    return HttpResponse.json({ message: 'Categoria deletada com sucesso' })
  }),
]
