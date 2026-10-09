import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { server } from '@/mocks/server'
import { DashboardPage } from './DashboardPage'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const renderPage = () => render(<DashboardPage />, { wrapper: createWrapper() })

describe('DashboardPage (AC-006, AC-007)', () => {
  beforeEach(() => {
    resetTransactionStore()
    resetCategoryStore()
  })

  it('mostra loading e depois o resumo com KPIs, gráfico e últimas transações', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando dashboard…',
    )

    expect(
      await screen.findByText('Resumo financeiro do mês'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getAllByText('Saldo')).toHaveLength(2)
    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument()
    expect(screen.getByText('Últimas transações')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
      'href',
      '/transacoes',
    )
  })

  it('mostra o estado vazio das últimas transações', async () => {
    server.use(http.get('*/transactions', () => HttpResponse.json([])))

    renderPage()

    expect(
      await screen.findByText('Resumo financeiro do mês'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma transação encontrada.',
    )
  })

  it('mostra o estado de erro e permite tentar novamente', async () => {
    server.use(
      http.get('*/reports/summary', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
      http.get('*/transactions', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o dashboard.',
    )

    server.resetHandlers()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Receitas')).toBeInTheDocument()
  })
})
