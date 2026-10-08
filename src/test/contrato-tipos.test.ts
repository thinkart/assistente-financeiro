import { describe, expect, expectTypeOf, it } from 'vitest'
import type {
  AuthResponse,
  Category,
  CategoryReport,
  RegisterPayload,
  SummaryReport,
  Transaction,
  TransactionFilters,
  TransactionType,
  User,
} from '@/types'

describe('tipos do contrato da API (AC-002)', () => {
  it('permite montar um usuário e uma resposta de autenticação', () => {
    const user: User = {
      id: 'u1',
      name: 'Demo',
      email: 'demo@financas.dev',
      cpf: '12345678900',
      phone: '(11) 99999-0000',
    }
    const register: RegisterPayload = {
      name: 'Demo',
      cpf: '12345678900',
      email: 'demo@financas.dev',
      phone: '(11) 99999-0000',
      password: '123456',
    }
    const auth: AuthResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
    }

    expect(user.email).toBe('demo@financas.dev')
    expect(user.cpf).toBe('12345678900')
    expect(user.phone).toBe('(11) 99999-0000')
    expect(register.password).toBe('123456')
    expect(auth.token_type).toBe('Bearer')
  })

  it('permite montar categoria e transação coerentes', () => {
    const category: Category = { id: 'c1', name: 'Salário', type: 'income' }
    const transaction: Transaction = {
      id: 't1',
      description: 'Salário de outubro',
      amount: 5000,
      type: category.type,
      date: '2026-10-05',
      categoryId: category.id,
    }

    expect(transaction.type satisfies TransactionType).toBe('income')
    expect(transaction.categoryId).toBe('c1')
  })

  it('tipa os filtros de transação como opcionais', () => {
    const filters: TransactionFilters = {
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      type: 'expense',
      minAmount: 10,
      maxAmount: 500,
    }

    expectTypeOf(filters.categoryId).toEqualTypeOf<string | undefined>()
    expect(Object.keys(filters)).toHaveLength(5)
  })

  it('tipa os relatórios de resumo e por categoria', () => {
    const summary: SummaryReport = {
      income: 5000,
      expense: 1200,
      balance: 3800,
    }
    const byCategory: CategoryReport = {
      categoryId: 'c1',
      categoryName: 'Salário',
      total: 5000,
      percentage: 100,
    }

    expect(summary.balance).toBe(3800)
    expect(byCategory.percentage).toBe(100)
  })
})
