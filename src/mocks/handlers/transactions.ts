import { http, HttpResponse } from 'msw'
import type { Transaction, TransactionType } from '@/types'
import { transactions as seedTransactions } from '../data'
import { applyMockDelay } from '../delay'
import { getCategoryById } from './categories'

let transactionStore: Transaction[] = [...seedTransactions]

export const resetTransactionStore = () => {
  transactionStore = [...seedTransactions]
}

interface TransactionBody {
  description?: unknown
  amount?: unknown
  type?: unknown
  date?: unknown
  categoryId?: unknown
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isTransactionType = (value: unknown): value is TransactionType =>
  value === 'income' || value === 'expense'

const parseTransactionBody = (body: unknown) => {
  if (typeof body !== 'object' || body === null) return null

  const { description, amount, type, date, categoryId } =
    body as TransactionBody

  if (typeof description !== 'string' || description.trim() === '') return null
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return null
  }
  if (!isTransactionType(type)) return null
  if (typeof date !== 'string' || !ISO_DATE.test(date)) return null
  if (typeof categoryId !== 'string' || !getCategoryById(categoryId))
    return null

  return { description: description.trim(), amount, type, date, categoryId }
}

const parseAmountParam = (value: string | null) => {
  if (value === null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const errorResponse = (status: number, message: string) =>
  HttpResponse.json({ message }, { status })

const applyFilters = (
  items: Transaction[],
  filters: {
    startDate?: string
    endDate?: string
    categoryId?: string
    type?: TransactionType
    minAmount?: number
    maxAmount?: number
  },
) =>
  items.filter((item) => {
    if (filters.startDate && item.date < filters.startDate) return false
    if (filters.endDate && item.date > filters.endDate) return false
    if (filters.categoryId && item.categoryId !== filters.categoryId) {
      return false
    }
    if (filters.type && item.type !== filters.type) return false
    if (filters.minAmount !== undefined && item.amount < filters.minAmount) {
      return false
    }
    if (filters.maxAmount !== undefined && item.amount > filters.maxAmount) {
      return false
    }
    return true
  })

export const transactionHandlers = [
  http.get('*/transactions', async ({ request }) => {
    await applyMockDelay()

    const url = new URL(request.url)
    const typeParam = url.searchParams.get('type')

    const filtered = applyFilters(transactionStore, {
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
      categoryId: url.searchParams.get('categoryId') ?? undefined,
      type: isTransactionType(typeParam) ? typeParam : undefined,
      minAmount: parseAmountParam(url.searchParams.get('minAmount')),
      maxAmount: parseAmountParam(url.searchParams.get('maxAmount')),
    })

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

    return HttpResponse.json(sorted)
  }),

  http.post('*/transactions', async ({ request }) => {
    await applyMockDelay()

    const parsed = parseTransactionBody(await request.json())
    if (!parsed) {
      return errorResponse(
        400,
        'Dados inválidos: informe descrição, valor positivo, tipo, data (YYYY-MM-DD) e categoria existente',
      )
    }

    const transaction: Transaction = { id: crypto.randomUUID(), ...parsed }
    transactionStore = [transaction, ...transactionStore]

    return HttpResponse.json(transaction, { status: 201 })
  }),

  http.put('*/transactions/:id', async ({ params, request }) => {
    await applyMockDelay()

    const { id } = params
    const existing = transactionStore.find((item) => item.id === id)
    if (!existing) {
      return errorResponse(404, 'Transação não encontrada')
    }

    const parsed = parseTransactionBody(await request.json())
    if (!parsed) {
      return errorResponse(
        400,
        'Dados inválidos: informe descrição, valor positivo, tipo, data (YYYY-MM-DD) e categoria existente',
      )
    }

    const updated: Transaction = { id: existing.id, ...parsed }
    transactionStore = transactionStore.map((item) =>
      item.id === existing.id ? updated : item,
    )

    return HttpResponse.json(updated)
  }),

  http.delete('*/transactions/:id', async ({ params }) => {
    await applyMockDelay()

    const { id } = params
    const exists = transactionStore.some((item) => item.id === id)
    if (!exists) {
      return errorResponse(404, 'Transação não encontrada')
    }

    transactionStore = transactionStore.filter((item) => item.id !== id)

    return new HttpResponse(null, { status: 204 })
  }),
]
