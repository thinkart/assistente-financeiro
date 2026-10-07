import { http, HttpResponse } from 'msw'
import type { Category, TransactionType } from '@/types'
import { categories as seedCategories } from '../data'
import { applyMockDelay } from '../delay'

let categoryStore: Category[] = [...seedCategories]

export const resetCategoryStore = () => {
  categoryStore = [...seedCategories]
}

export const getCategoryById = (id: string) =>
  categoryStore.find((category) => category.id === id)

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
    name.trim() === '' ||
    !isTransactionType(type)
  ) {
    return null
  }

  return { name: name.trim(), type }
}

const errorResponse = (status: number, message: string) =>
  HttpResponse.json({ message }, { status })

export const categoryHandlers = [
  http.get('*/categories', async () => {
    await applyMockDelay()
    return HttpResponse.json(categoryStore)
  }),

  http.post('*/categories', async ({ request }) => {
    await applyMockDelay()

    const parsed = parseCategoryBody(await request.json())
    if (!parsed) {
      return errorResponse(400, 'Nome e tipo (income/expense) são obrigatórios')
    }

    const category: Category = { id: crypto.randomUUID(), ...parsed }
    categoryStore = [...categoryStore, category]

    return HttpResponse.json(category, { status: 201 })
  }),

  http.put('*/categories/:id', async ({ params, request }) => {
    await applyMockDelay()

    const { id } = params
    const existing = categoryStore.find((category) => category.id === id)
    if (!existing) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    const parsed = parseCategoryBody(await request.json())
    if (!parsed) {
      return errorResponse(400, 'Nome e tipo (income/expense) são obrigatórios')
    }

    const updated: Category = { id: existing.id, ...parsed }
    categoryStore = categoryStore.map((category) =>
      category.id === existing.id ? updated : category,
    )

    return HttpResponse.json(updated)
  }),

  http.delete('*/categories/:id', async ({ params }) => {
    await applyMockDelay()

    const { id } = params
    const exists = categoryStore.some((category) => category.id === id)
    if (!exists) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    categoryStore = categoryStore.filter((category) => category.id !== id)

    return new HttpResponse(null, { status: 204 })
  }),
]
