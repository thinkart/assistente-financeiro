import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { server } from '@/mocks/server'
import { TransactionsPage } from './TransactionsPage'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppToaster />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const renderPage = () =>
  render(<TransactionsPage />, { wrapper: createWrapper() })

const applyFilters = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

const tableBodyRows = () => {
  const table = screen.getByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

const fillFilter = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const fillForm = (label: string, value: string) => {
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText(label), {
    target: { value },
  })
}

const fillValidForm = (description: string) => {
  fillForm('Descrição', description)
  fillForm('Valor (R$)', '99,90')
  fillForm('Tipo', 'expense')
  fillForm('Categoria', 'lazer')
  fillForm('Método de pagamento', 'pix')
  fillForm('Data', '2026-10-10')
}

describe('TransactionsPage (AC-004, AC-007, AC-009)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('mostra loading, lista paginada de 10 e controles nos extremos', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando transações…',
    )

    expect(
      await screen.findByText('Transações cadastradas'),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 3 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  it('aplica os filtros e volta para a primeira página', async () => {
    renderPage()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()

    fillFilter('Buscar', 'merc')
    applyFilters()

    await waitFor(() => {
      expect(screen.getByText('Página 1 de 1')).toBeInTheDocument()
    })
    expect(tableBodyRows()).toHaveLength(6)
  })

  it('cria uma transação pelo modal e atualiza a lista', async () => {
    renderPage()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    fireEvent.click(screen.getByRole('button', { name: /nova transação/i }))

    fillValidForm('Compra nova')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Transação criada!')).toBeInTheDocument()
    expect(
      await within(screen.getByRole('table')).findByText('Compra nova'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Página 1 de 4')).toBeInTheDocument()
  })

  it('edita uma transação existente', async () => {
    renderPage()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    fillFilter('Buscar', 'Farmácia')
    applyFilters()

    await waitFor(() => {
      expect(
        within(screen.getByRole('table')).getByText('Farmácia'),
      ).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    const row = within(table).getByText('Farmácia').closest('tr') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: 'Editar' }))

    expect(
      screen.getByRole('dialog', { name: 'Editar transação' }),
    ).toBeInTheDocument()

    fillForm('Descrição', 'Farmácia editada')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Transação atualizada!')).toBeInTheDocument()
    expect(
      await within(screen.getByRole('table')).findByText('Farmácia editada'),
    ).toBeInTheDocument()
  })

  it('exclui uma transação com confirmação e mostra o estado vazio', async () => {
    renderPage()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    fillFilter('Buscar', 'Dentista')
    applyFilters()

    await waitFor(() => {
      expect(
        within(screen.getByRole('table')).getByText('Dentista'),
      ).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    const row = within(table).getByText('Dentista').closest('tr') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: 'Excluir' }))

    expect(
      screen.getByRole('dialog', { name: 'Excluir transação' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Transação excluída!')).toBeInTheDocument()
    expect(
      await screen.findByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
  })

  it('mostra o estado vazio quando nenhum filtro encontra resultados', async () => {
    renderPage()
    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })

    fillFilter('Buscar', 'zzz-inexistente')
    applyFilters()

    expect(
      await screen.findByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma transação encontrada.',
    )
  })

  it('mostra o estado de erro e permite tentar novamente', async () => {
    server.use(
      http.get('*/transactions', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as transações.',
    )

    server.resetHandlers()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => {
      expect(tableBodyRows()).toHaveLength(10)
    })
  })
})
