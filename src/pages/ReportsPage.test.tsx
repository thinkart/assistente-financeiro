import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { server } from '@/mocks/server'
import { ReportsPage } from './ReportsPage'

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

const renderPage = () => render(<ReportsPage />, { wrapper: createWrapper() })

const applyFilters = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
}

describe('ReportsPage (AC-001, AC-007)', () => {
  beforeEach(() => {
    resetTransactionStore()
    resetCategoryStore()
  })

  it('mostra loading e depois cards, gráfico e tabela', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando relatórios…',
    )

    expect(
      await screen.findByRole('heading', { name: 'Relatórios' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('Despesas por categoria')).toBeInTheDocument()
    expect(screen.getByText('Detalhamento por categoria')).toBeInTheDocument()
  })

  it('aplica o filtro de tipo receitas', async () => {
    renderPage()
    await screen.findByText('Despesas por categoria')

    fireEvent.change(screen.getByLabelText('Tipo'), {
      target: { value: 'income' },
    })
    applyFilters()

    expect(
      await screen.findByText('Receitas por categoria'),
    ).toBeInTheDocument()

    const table = screen.getByRole('table')
    expect(within(table).getByText('Salário')).toBeInTheDocument()
  })

  it('mostra o estado vazio quando não há dados no período', async () => {
    renderPage()
    await screen.findByText('Despesas por categoria')

    fireEvent.change(screen.getByLabelText('De'), {
      target: { value: '2030-01-01' },
    })
    fireEvent.change(screen.getByLabelText('Até'), {
      target: { value: '2030-12-31' },
    })
    applyFilters()

    expect(
      await screen.findByText('Nenhum dado no período.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum dado no período.',
    )
  })

  it('mostra o estado de erro e permite tentar novamente', async () => {
    server.use(
      http.get('*/reports/summary', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
      http.get('*/reports/by-category', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os relatórios.',
    )

    server.resetHandlers()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByText('Despesas por categoria'),
    ).toBeInTheDocument()
  })
})
