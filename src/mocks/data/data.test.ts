import { describe, expect, it } from 'vitest'
import { categories, transactions } from './index'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const categoryIds = new Set(categories.map((category) => category.id))
const categoryById = new Map(
  categories.map((category) => [category.id, category]),
)

const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, date.getDate())

describe('dados fake de categorias (AC-003)', () => {
  it('tem categorias realistas com ids únicos e tipos válidos', () => {
    expect(categories.length).toBeGreaterThanOrEqual(6)
    expect(new Set(categories.map((category) => category.id)).size).toBe(
      categories.length,
    )

    for (const category of categories) {
      expect(category.name.length).toBeGreaterThan(0)
      expect(['income', 'expense']).toContain(category.type)
    }

    expect(categories.some((category) => category.type === 'income')).toBe(true)
    expect(categories.some((category) => category.type === 'expense')).toBe(
      true,
    )
  })
})

describe('dados fake de transações (AC-003)', () => {
  it('tem cerca de 30 transações distribuídas em meses distintos', () => {
    expect(transactions.length).toBeGreaterThanOrEqual(28)
    expect(transactions.length).toBeLessThanOrEqual(32)

    const months = new Set(transactions.map((item) => item.date.slice(0, 7)))
    expect(months.size).toBeGreaterThanOrEqual(4)
  })

  it('usa ids únicos, descrições, valores positivos e datas no período', () => {
    const ids = new Set<string>()
    const now = new Date()
    const sixMonthsAgo = addMonths(now, -6)

    for (const item of transactions) {
      expect(ids.has(item.id)).toBe(false)
      ids.add(item.id)

      expect(item.description.length).toBeGreaterThan(0)
      expect(item.amount).toBeGreaterThan(0)
      expect(['pix', 'credito', 'debito', 'dinheiro', 'boleto']).toContain(
        item.paymentMethod,
      )
      expect(item.date).toMatch(ISO_DATE)

      const date = new Date(`${item.date}T00:00:00`).getTime()
      expect(date).toBeLessThanOrEqual(now.getTime())
      expect(date).toBeGreaterThanOrEqual(sixMonthsAgo.getTime())
    }
  })

  it('referencia categorias existentes e mantém o tipo coerente', () => {
    for (const item of transactions) {
      expect(categoryIds.has(item.categoryId)).toBe(true)
      expect(item.type).toBe(categoryById.get(item.categoryId)?.type)
    }
  })

  it('mistura entradas e saídas', () => {
    expect(transactions.some((item) => item.type === 'income')).toBe(true)
    expect(transactions.some((item) => item.type === 'expense')).toBe(true)
  })
})
