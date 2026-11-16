import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'
import { MOCK_ACCESS_TOKEN } from '@/mocks/handlers/auth'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { server } from '@/mocks/server'
import { setStoredToken } from '@/services/token'
import type { Transaction } from '@/types'
import { AssistantPage } from './AssistantPage'

const dateInMonth = (monthsAgo: number) =>
  format(startOfMonth(subMonths(new Date(), monthsAgo)), 'yyyy-MM-dd')

const currentMonth = dateInMonth(0)
const previousMonth = dateInMonth(1)

const transactions: Transaction[] = [
  {
    id: 'income-current',
    description: 'Salário atual',
    amount: 1000,
    type: 'income',
    paymentMethod: 'pix',
    date: currentMonth,
    categoryId: 'salario',
  },
  {
    id: 'expense-current',
    description: 'Aluguel atual',
    amount: 600,
    type: 'expense',
    paymentMethod: 'pix',
    date: currentMonth,
    categoryId: 'moradia',
  },
  {
    id: 'income-previous',
    description: 'Salário anterior',
    amount: 700,
    type: 'income',
    paymentMethod: 'pix',
    date: previousMonth,
    categoryId: 'salario',
  },
  {
    id: 'expense-previous',
    description: 'Aluguel anterior',
    amount: 800,
    type: 'expense',
    paymentMethod: 'pix',
    date: previousMonth,
    categoryId: 'moradia',
  },
]

const authValue: AuthContextValue = {
  user: {
    id: 'user-test',
    name: 'Ana Teste',
    email: 'ana@example.com',
    cpf: '52998224725',
    phone: '11999990000',
  },
  isLoading: false,
  isAuthenticated: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const renderPage = () => render(<AssistantPage />, { wrapper: createWrapper() })

const serveTransactions = (data: Transaction[]) =>
  server.use(
    http.get('*/transactions', () =>
      HttpResponse.json({
        data: data.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: String(transaction.amount),
          type: transaction.type,
          date: transaction.date,
          payment_method: transaction.paymentMethod,
          category_id: transaction.categoryId,
        })),
      }),
    ),
  )

describe('AssistantPage', () => {
  beforeEach(() => {
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetCategoryStore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra carregamento enquanto as consultas estão pendentes', async () => {
    let releaseRequest: (() => void) | undefined
    server.use(
      http.get(
        '*/transactions',
        () =>
          new Promise((resolve) => {
            releaseRequest = () => resolve(HttpResponse.json({ data: [] }))
          }),
      ),
    )

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando sua análise financeira…',
    )

    await waitFor(() => expect(releaseRequest).toBeDefined())
    await act(async () => {
      releaseRequest?.()
    })

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Sua conta ainda não tem movimentações',
      ),
    )
  })

  it('mostra valores zerados e não inventa conclusões para conta vazia', async () => {
    serveTransactions([])
    renderPage()

    expect(await screen.findAllByText('R$ 0,00')).toHaveLength(3)
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Sua conta ainda não tem movimentações',
      ),
    )
    expect(screen.queryByText('Pontos positivos')).not.toBeInTheDocument()
    expect(screen.queryByText('Pontos de atenção')).not.toBeInTheDocument()
    expect(screen.queryByText('Recomendações')).not.toBeInTheDocument()
  })

  it('explica quando não há dados dos dois meses para comparar', async () => {
    serveTransactions([transactions[0]])
    renderPage()

    expect(await screen.findByText(/Ainda não há dados dos dois períodos/)).toBeInTheDocument()
    expect(screen.queryByText('Pontos positivos')).not.toBeInTheDocument()
  })

  it('apresenta análise baseada nos dois meses e permite atualizar', async () => {
    // Determiniza a escolha de redação das observações para a primeira variante.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const request = vi.fn(() =>
      HttpResponse.json({
        data: transactions.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: String(transaction.amount),
          type: transaction.type,
          date: transaction.date,
          payment_method: transaction.paymentMethod,
          category_id: transaction.categoryId,
        })),
      }),
    )
    server.use(http.get('*/transactions', request))
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Olá, Ana' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Período analisado:/)).toBeInTheDocument()
    expect(
      await screen.findByText(/Seu saldo do período está positivo em R\$ 400,00/),
    ).toBeInTheDocument()
    expect(screen.getByText('Pontos positivos')).toBeInTheDocument()
    expect(screen.getByText('Pontos de atenção')).toBeInTheDocument()
    expect(screen.getByText('Recomendações')).toBeInTheDocument()
    expect(screen.getByText(/Última análise:/)).toBeInTheDocument()

    const requestCount = request.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar análise' }))

    await screen.findByRole('button', { name: 'Atualizar análise' })
    expect(request.mock.calls.length).toBeGreaterThan(requestCount)
  })

  it('apresenta erro e permite tentar novamente', async () => {
    server.use(
      http.get('*/transactions', () =>
        HttpResponse.json({ message: 'Falha de rede' }, { status: 500 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha de rede',
    )
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument()
  })
})
