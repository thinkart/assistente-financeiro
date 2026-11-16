import { http, HttpResponse } from 'msw'
import type { PaymentMethod, Transaction, TransactionType } from '@/types'
import { transactions as seedTransactions } from '../data'
import { applyMockDelay } from '../delay'
import { getAuthenticatedUserId } from './auth'
import { getCategoryById } from './categories'
import { errorResponse, validationErrorResponse } from './responses'

const TRANSACTION_STORES_KEY = 'financas-mock-transactions'

const transactionStores = new Map<string, Transaction[]>(
  (() => {
    try {
      const stored = localStorage.getItem(TRANSACTION_STORES_KEY)
      return stored
        ? Object.entries(JSON.parse(stored) as Record<string, Transaction[]>)
        : [['u-demo', [...seedTransactions]]]
    } catch {
      return [['u-demo', [...seedTransactions]]]
    }
  })(),
)

const persistTransactionStores = () => {
  try {
    localStorage.setItem(
      TRANSACTION_STORES_KEY,
      JSON.stringify(Object.fromEntries(transactionStores)),
    )
  } catch {
    /* Local persistence is optional in private browsing contexts. */
  }
}

export const resetTransactionStore = () => {
  transactionStores.clear()
  transactionStores.set('u-demo', [...seedTransactions])
  persistTransactionStores()
}

export const getTransactions = (userId = 'u-demo') => [
  ...(transactionStores.get(userId) ?? []),
]

const setTransactions = (userId: string, transactions: Transaction[]) => {
  transactionStores.set(userId, transactions)
  persistTransactionStores()
}

interface TransactionBody {
  description?: unknown
  amount?: unknown
  type?: unknown
  date?: unknown
  payment_method?: unknown
  category_id?: unknown
}

interface ApiTransaction {
  id: string
  description: string
  amount: string
  type: TransactionType
  date: string
  payment_method: PaymentMethod
  category_id: string
}

const toApiTransaction = (transaction: Transaction): ApiTransaction => ({
  id: transaction.id,
  description: transaction.description,
  amount: transaction.amount.toFixed(2),
  type: transaction.type,
  date: transaction.date,
  payment_method: transaction.paymentMethod,
  category_id: transaction.categoryId,
})

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isTransactionType = (value: unknown): value is TransactionType =>
  value === 'income' || value === 'expense'

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === 'pix' ||
  value === 'credito' ||
  value === 'debito' ||
  value === 'dinheiro' ||
  value === 'boleto'

const parseTransactionBody = (body: unknown) => {
  if (typeof body !== 'object' || body === null) return null

  const { description, amount, type, date, payment_method, category_id } =
    body as TransactionBody

  if (typeof description !== 'string' || description.trim().length < 3) {
    return null
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return null
  }
  if (!isTransactionType(type)) return null
  if (!isPaymentMethod(payment_method)) return null
  if (typeof date !== 'string' || !ISO_DATE.test(date)) return null
  if (typeof category_id !== 'string' || category_id === '') return null

  return {
    description: description.trim(),
    amount,
    type,
    paymentMethod: payment_method,
    date,
    categoryId: category_id,
  }
}

const parseAmountParam = (value: string | null) => {
  if (value === null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const applyFilters = (
  items: Transaction[],
  filters: {
    search?: string
    startDate?: string
    endDate?: string
    categoryId?: string
    type?: TransactionType
    minAmount?: number
    maxAmount?: number
  },
) =>
  items.filter((item) => {
    if (
      filters.search &&
      !item.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
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

export const getFilteredTransactions = (
  userId: string,
  params: URLSearchParams,
) =>
  applyFilters(getTransactions(userId), {
    search: params.get('search')?.trim() || undefined,
    startDate: params.get('startDate') ?? undefined,
    endDate: params.get('endDate') ?? undefined,
    categoryId: params.get('categoryId') ?? undefined,
    type: isTransactionType(params.get('type'))
      ? (params.get('type') as TransactionType)
      : undefined,
    minAmount: parseAmountParam(params.get('minAmount')),
    maxAmount: parseAmountParam(params.get('maxAmount')),
  })

export const transactionHandlers = [
  http.get('*/transactions', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const url = new URL(request.url)
    const filtered = getFilteredTransactions(userId, url.searchParams)

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

    return HttpResponse.json({ data: sorted.map(toApiTransaction) })
  }),

  http.post('*/transactions', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const parsed = parseTransactionBody(await request.json())
    if (!parsed) {
      return validationErrorResponse(
        'Dados inválidos: informe descrição (mínimo 3), valor positivo, tipo, data (YYYY-MM-DD), método de pagamento e categoria',
      )
    }

    if (!getCategoryById(parsed.categoryId, userId)) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    const transaction: Transaction = { id: crypto.randomUUID(), ...parsed }
    setTransactions(userId, [transaction, ...getTransactions(userId)])

    return HttpResponse.json(
      {
        message: 'Transação cadastrada com sucesso',
        data: toApiTransaction(transaction),
      },
      { status: 201 },
    )
  }),

  http.put('*/transactions/:id', async ({ params, request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const { id } = params

    const parsed = parseTransactionBody(await request.json())
    if (!parsed) {
      return validationErrorResponse(
        'Dados inválidos: informe descrição (mínimo 3), valor positivo, tipo, data (YYYY-MM-DD), método de pagamento e categoria',
      )
    }

    if (!getCategoryById(parsed.categoryId, userId)) {
      return errorResponse(404, 'Categoria não encontrada')
    }

    const userTransactions = getTransactions(userId)
    const existing = userTransactions.find((item) => item.id === id)
    if (!existing) {
      return errorResponse(404, 'Transação não encontrada')
    }

    const updated: Transaction = { id: existing.id, ...parsed }
    setTransactions(userId, userTransactions.map((item) =>
      item.id === existing.id ? updated : item,
    ))

    return HttpResponse.json({
      message: 'Transação atualizada com sucesso',
      data: toApiTransaction(updated),
    })
  }),

  http.delete('*/transactions/:id', async ({ params, request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const { id } = params
    const userTransactions = getTransactions(userId)
    const exists = userTransactions.some((item) => item.id === id)
    if (!exists) {
      return errorResponse(404, 'Transação não encontrada')
    }

    setTransactions(
      userId,
      userTransactions.filter((item) => item.id !== id),
    )

    return HttpResponse.json({ message: 'Transação deletada com sucesso' })
  }),
]
