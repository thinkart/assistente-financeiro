import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createTransaction, fetchTransactions } from './transactions'
import { MOCK_ACCESS_TOKEN, resetAuthStore } from '@/mocks/handlers/auth'
import { transactions as seedTransactions } from '@/mocks/data'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { server } from '@/mocks/server'
import { setStoredToken } from './token'
import {
  downloadTransactionsCsv,
  downloadTransactionsPdf,
  fetchCategoryReport,
  fetchSummary,
} from './reports'
import type { TransactionInput } from '@/types'

const round2 = (value: number) => Math.round(value * 100) / 100

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const expectedSummary = (items: typeof seedTransactions) => {
  const income = round2(
    items
      .filter((item) => item.type === 'income')
      .reduce((total, item) => total + item.amount, 0),
  )
  const expense = round2(
    items
      .filter((item) => item.type === 'expense')
      .reduce((total, item) => total + item.amount, 0),
  )

  return { income, expense, balance: round2(income - expense) }
}

describe('serviço de relatórios (AC-002)', () => {
  beforeEach(() => {
    resetAuthStore()
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetTransactionStore()
  })

  it('busca o resumo completo quando não há período', async () => {
    const summary = await fetchSummary()

    expect(summary).toEqual(expectedSummary(seedTransactions))
  })

  it('envia o período como query string', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 2, 1))

    const summary = await fetchSummary({ startDate: start })

    expect(summary).toEqual(
      expectedSummary(seedTransactions.filter((item) => item.date >= start)),
    )
  })
})

describe('serviço de relatórios por categoria (AC-002)', () => {
  beforeEach(() => {
    resetAuthStore()
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetTransactionStore()
    resetCategoryStore()
  })

  it('busca o relatório de despesas por categoria por padrão', async () => {
    const report = await fetchCategoryReport()

    const expenseItems = seedTransactions.filter(
      (item) => item.type === 'expense',
    )
    const expectedAlimentacao = round2(
      expenseItems
        .filter((item) => item.categoryId === 'alimentacao')
        .reduce((total, item) => total + item.amount, 0),
    )

    const alimentacao = report.find((item) => item.categoryId === 'alimentacao')
    expect(alimentacao?.total).toBeCloseTo(expectedAlimentacao, 2)
    expect(alimentacao?.categoryName).toBe('Alimentação')

    const percentageSum = round2(
      report.reduce((total, item) => total + item.percentage, 0),
    )
    expect(Math.abs(percentageSum - 100)).toBeLessThan(0.5)
  })

  it('filtra por período e tipo (receitas)', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1))

    const report = await fetchCategoryReport({
      startDate: start,
      type: 'income',
    })

    const incomeItems = seedTransactions.filter(
      (item) => item.type === 'income' && item.date >= start,
    )
    const expectedSalario = round2(
      incomeItems
        .filter((item) => item.categoryId === 'salario')
        .reduce((total, item) => total + item.amount, 0),
    )

    expect(
      report.find((item) => item.categoryId === 'salario')?.total,
    ).toBeCloseTo(expectedSalario, 2)
    expect(report.every((item) => item.categoryId !== 'alimentacao')).toBe(true)
  })

  it('mapeia o payload snake_case do backend para o contrato do front', async () => {
    server.use(
      http.get('*/reports/by-category', () =>
        HttpResponse.json({
          data: [
            {
              category_id: 'alimentacao',
              category_name: 'Alimentação',
              total: 820.3,
              percentage: 41.6,
            },
          ],
        }),
      ),
    )

    const [item] = await fetchCategoryReport({ type: 'expense' })

    expect(item).toEqual({
      categoryId: 'alimentacao',
      categoryName: 'Alimentação',
      total: 820.3,
      percentage: 41.6,
    })
  })
})

describe('exportações de transações', () => {
  beforeEach(() => {
    resetAuthStore()
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetCategoryStore()
    resetTransactionStore()
  })

  it('gera um PDF válido com filtros e nome de arquivo correto', async () => {
    const result = await downloadTransactionsPdf({ type: 'income' })
    const bytes = new Uint8Array(await result.blob.arrayBuffer())
    const pdf = new TextDecoder('windows-1252').decode(bytes)

    expect(result.filename).toBe('relatorio-financeiro.pdf')
    expect(result.blob.type).toBe('application/pdf')
    expect(pdf.startsWith('%PDF-')).toBe(true)
    expect(pdf).toContain('/Type /Page')
    expect(pdf).toContain('xref')
    expect(pdf).toContain('%%EOF')
    expect(pdf).toContain('Receita')
    expect(pdf).toContain('Salário')
    expect(pdf).not.toContain('Despesa')
  })

  it('gera PDF com mensagem quando os filtros não encontram transações', async () => {
    const result = await downloadTransactionsPdf({ startDate: '2099-01-01' })
    const pdf = new TextDecoder('windows-1252').decode(
      await result.blob.arrayBuffer(),
    )

    expect(pdf).toContain('Não existem transações no período.')
  })

  it('gera CSV UTF-8 com BOM, delimitador brasileiro e células seguras', async () => {
    const input: TransactionInput = {
      description: '=1+1;"São Paulo"\nNova linha',
      amount: 1234.56,
      type: 'expense',
      paymentMethod: 'pix',
      date: '2026-09-15',
      categoryId: 'lazer',
    }
    await createTransaction(input)

    const result = await downloadTransactionsCsv({ search: '=1+1' })
    const csvBytes = new Uint8Array(await result.blob.arrayBuffer())
    const csv = new TextDecoder().decode(csvBytes)

    expect(result.filename).toBe('relatorio-financeiro.csv')
    expect(result.blob.type).toBe('text/csv;charset=utf-8')
    expect([...csvBytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(csv).toContain(
      '"Data";"Descrição";"Tipo";"Categoria";"Forma de pagamento";"Valor (R$)"',
    )
    expect(csv).toContain('"\'=1+1;""São Paulo""\nNova linha"')
    expect(csv).toContain('1.234,56')
    expect(csv).toContain('"15/09/2026"')
    expect(csv).toContain('Lazer')
    expect(csv).not.toContain('Aluguel')
  })

  it('gera CSV somente com os cabeçalhos quando não há transações', async () => {
    const result = await downloadTransactionsCsv({ startDate: '2099-01-01' })
    const csvBytes = new Uint8Array(await result.blob.arrayBuffer())
    const csv = new TextDecoder().decode(csvBytes)

    expect(csv.split('\r\n')).toHaveLength(1)
    expect(csv).toContain('"Data";"Descrição";"Tipo"')
  })

  it('mantém usuário recém-cadastrado vazio em transações, resumo, relatórios e exportações', async () => {
    const email = `conta-vazia-${crypto.randomUUID()}@financas.dev`
    const registration = await fetch('http://127.0.0.1:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pessoa Nova',
        cpf: '11144477735',
        email,
        phone: '11988887777',
        password: '123456',
      }),
    })
    expect(registration.status).toBe(201)

    const login = await fetch('http://127.0.0.1:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: '123456' }),
    })
    const auth = (await login.json()) as { access_token: string }
    setStoredToken(auth.access_token)

    expect(await fetchTransactions()).toEqual([])
    expect(await fetchSummary()).toEqual({ income: 0, expense: 0, balance: 0 })
    expect(await fetchCategoryReport()).toEqual([])

    const csv = await downloadTransactionsCsv()
    const csvBytes = new Uint8Array(await csv.blob.arrayBuffer())
    expect(new TextDecoder().decode(csvBytes).split('\r\n')).toHaveLength(1)

    const pdf = await downloadTransactionsPdf()
    const pdfText = new TextDecoder('windows-1252').decode(
      await pdf.blob.arrayBuffer(),
    )
    expect(pdfText).toContain('Não existem transações no período.')
  })
})
