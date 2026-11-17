import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
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

const transactions: Transaction[] = [
  {
    id: 'income-current',
    description: 'Salário atual',
    amount: 1000,
    type: 'income',
    paymentMethod: 'pix',
    date: dateInMonth(0),
    categoryId: 'salario',
  },
  {
    id: 'expense-current',
    description: 'Aluguel atual',
    amount: 600,
    type: 'expense',
    paymentMethod: 'pix',
    date: dateInMonth(0),
    categoryId: 'moradia',
  },
  {
    id: 'income-previous',
    description: 'Salário anterior',
    amount: 700,
    type: 'income',
    paymentMethod: 'pix',
    date: dateInMonth(1),
    categoryId: 'salario',
  },
  {
    id: 'expense-previous',
    description: 'Aluguel anterior',
    amount: 800,
    type: 'expense',
    paymentMethod: 'pix',
    date: dateInMonth(1),
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

const FORMAT_STORAGE_KEY = 'financas-analysis-format:user-test'

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

const chooseResumido = () =>
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Resumido' }), {
    button: 0,
    ctrlKey: false,
  })

describe('AssistantPage - formato da análise', () => {
  beforeEach(() => {
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetCategoryStore()
    localStorage.removeItem(FORMAT_STORAGE_KEY)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('apresenta a análise detalhada por padrão com o seletor de formato', async () => {
    serveTransactions(transactions)
    renderPage()

    expect(await screen.findByText('Pontos positivos')).toBeInTheDocument()
    expect(screen.getByText('Pontos de atenção')).toBeInTheDocument()
    expect(screen.getByText('Recomendações')).toBeInTheDocument()

    expect(
      screen.getByRole('tab', { name: 'Detalhado' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Resumido' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.queryByText(/Resumo do mês/)).not.toBeInTheDocument()
  })

  it('entrega a análise como mensagem única em linguagem simples ao escolher Resumido', async () => {
    serveTransactions(transactions)
    renderPage()
    expect(await screen.findByText('Pontos positivos')).toBeInTheDocument()

    chooseResumido()

    expect(await screen.findByText(/Resumo do mês/)).toBeInTheDocument()
    expect(screen.queryByText('Pontos positivos')).not.toBeInTheDocument()
    expect(screen.queryByText('Pontos de atenção')).not.toBeInTheDocument()
    expect(screen.queryByText('Recomendações')).not.toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Resumido' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem(FORMAT_STORAGE_KEY)).toBe('simple')
  })

  it('mantém a preferência da pessoa após recarregar a página', async () => {
    serveTransactions(transactions)
    const { unmount } = renderPage()
    expect(await screen.findByText('Pontos positivos')).toBeInTheDocument()

    chooseResumido()
    await screen.findByText(/Resumo do mês/)
    unmount()

    renderPage()
    expect(await screen.findByText(/Resumo do mês/)).toBeInTheDocument()
    expect(screen.queryByText('Pontos positivos')).not.toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Resumido' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('volta para o modo detalhado e persiste a escolha', async () => {
    serveTransactions(transactions)
    renderPage()
    expect(await screen.findByText('Pontos positivos')).toBeInTheDocument()

    chooseResumido()
    await screen.findByText(/Resumo do mês/)

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Detalhado' }), {
      button: 0,
      ctrlKey: false,
    })

    expect(await screen.findByText('Pontos positivos')).toBeInTheDocument()
    expect(screen.queryByText(/Resumo do mês/)).not.toBeInTheDocument()
    expect(localStorage.getItem(FORMAT_STORAGE_KEY)).toBe('detailed')
  })
})
