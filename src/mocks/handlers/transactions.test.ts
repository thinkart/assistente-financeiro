import { beforeEach, describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { transactions as seedTransactions } from '../data'
import { resetCategoryStore } from './categories'
import { resetTransactionStore } from './transactions'

const API_URL = 'http://127.0.0.1:5000'

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchTransactions = async (query = '') => {
  const response = await fetch(`${API_URL}/transactions${query}`)
  return { response, body: (await response.json()) as Transaction[] }
}

const sendJson = (method: string, path: string, body: unknown) =>
  fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const expectedIds = (filter: (item: Transaction) => boolean) =>
  seedTransactions
    .filter(filter)
    .map((item) => item.id)
    .sort()

const validPayload = {
  description: 'Compra de teste',
  amount: 99.9,
  type: 'expense' as const,
  date: '2026-09-15',
  categoryId: 'lazer',
}

describe('handlers de transações (AC-006)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('lista as transações com 200', async () => {
    const { response, body } = await fetchTransactions()

    expect(response.status).toBe(200)
    expect(body.length).toBe(seedTransactions.length)
  })

  it('filtra por tipo', async () => {
    const { body } = await fetchTransactions('?type=income')

    expect(body.every((item) => item.type === 'income')).toBe(true)
    expect(body.map((item) => item.id).sort()).toEqual(
      expectedIds((item) => item.type === 'income'),
    )
  })

  it('filtra por categoria', async () => {
    const { body } = await fetchTransactions('?categoryId=alimentacao')

    expect(body.length).toBeGreaterThan(0)
    expect(body.every((item) => item.categoryId === 'alimentacao')).toBe(true)
  })

  it('filtra por período (startDate e endDate)', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 2, 1))
    const end = toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1))

    const { body } = await fetchTransactions(
      `?startDate=${start}&endDate=${end}`,
    )

    expect(body.map((item) => item.id).sort()).toEqual(
      expectedIds((item) => item.date >= start && item.date <= end),
    )
  })

  it('filtra por faixa de valor (minAmount e maxAmount)', async () => {
    const { body } = await fetchTransactions('?minAmount=100&maxAmount=500')

    expect(body.every((item) => item.amount >= 100 && item.amount <= 500)).toBe(
      true,
    )
    expect(body.length).toBe(
      seedTransactions.filter(
        (item) => item.amount >= 100 && item.amount <= 500,
      ).length,
    )
  })

  it('combina múltiplos filtros', async () => {
    const { body } = await fetchTransactions(
      '?type=expense&categoryId=alimentacao&minAmount=400',
    )

    expect(body.map((item) => item.id).sort()).toEqual(
      expectedIds(
        (item) =>
          item.type === 'expense' &&
          item.categoryId === 'alimentacao' &&
          item.amount >= 400,
      ),
    )
  })

  it('cria uma transação com 201 e a inclui na listagem', async () => {
    const response = await sendJson('POST', '/transactions', validPayload)

    expect(response.status).toBe(201)

    const created = (await response.json()) as Transaction
    expect(created.id).toBeTruthy()
    expect(created.description).toBe('Compra de teste')

    const { body } = await fetchTransactions()
    expect(body.some((item) => item.id === created.id)).toBe(true)
  })

  it('rejeita transação com categoria desconhecida (400)', async () => {
    const response = await sendJson('POST', '/transactions', {
      ...validPayload,
      categoryId: 'nao-existe',
    })

    expect(response.status).toBe(400)
  })

  it('rejeita payload inválido (400)', async () => {
    const withoutDescription = await sendJson('POST', '/transactions', {
      ...validPayload,
      description: '',
    })
    expect(withoutDescription.status).toBe(400)

    const negativeAmount = await sendJson('POST', '/transactions', {
      ...validPayload,
      amount: -10,
    })
    expect(negativeAmount.status).toBe(400)

    const invalidDate = await sendJson('POST', '/transactions', {
      ...validPayload,
      date: '15/09/2026',
    })
    expect(invalidDate.status).toBe(400)
  })

  it('atualiza uma transação existente com 200', async () => {
    const response = await sendJson('PUT', '/transactions/t1', {
      ...validPayload,
      description: 'Atualizada',
    })

    expect(response.status).toBe(200)

    const updated = (await response.json()) as Transaction
    expect(updated.id).toBe('t1')
    expect(updated.description).toBe('Atualizada')

    const { body } = await fetchTransactions()
    expect(body.find((item) => item.id === 't1')?.description).toBe(
      'Atualizada',
    )
  })

  it('retorna 404 ao atualizar transação inexistente', async () => {
    const response = await sendJson(
      'PUT',
      '/transactions/nao-existe',
      validPayload,
    )

    expect(response.status).toBe(404)
  })

  it('remove uma transação com 204 e depois retorna 404', async () => {
    const response = await fetch(`${API_URL}/transactions/t30`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(204)

    const { body } = await fetchTransactions()
    expect(body.some((item) => item.id === 't30')).toBe(false)

    const again = await fetch(`${API_URL}/transactions/t30`, {
      method: 'DELETE',
    })
    expect(again.status).toBe(404)
  })
})
