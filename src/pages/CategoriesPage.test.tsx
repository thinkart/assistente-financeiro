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
import { CategoriesPage } from './CategoriesPage'

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
  render(<CategoriesPage />, { wrapper: createWrapper() })

const getTable = () => screen.getByRole('table')

const getRowByText = (text: string) => {
  const cell = within(getTable()).getByText(text)
  return cell.closest('tr') as HTMLElement
}

const fill = (label: string, value: string) => {
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText(label), {
    target: { value },
  })
}

const createCategory = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }))
  fill('Nome', name)
  fill('Tipo', 'expense')
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

  await waitFor(() => {
    expect(within(getTable()).getByText(name)).toBeInTheDocument()
  })
}

describe('CategoriesPage (AC-004, AC-006, AC-008)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('mostra loading e lista as categorias com badges e ações', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando categorias…',
    )

    await waitFor(() => {
      expect(
        within(getTable()).getAllByRole('row').length,
      ).toBeGreaterThanOrEqual(7)
    })

    expect(within(getTable()).getByText('Salário').className).toContain(
      'text-category-2',
    )
    expect(within(getTable()).getAllByText('Receita').length).toBe(2)

    const row = getRowByText('Lazer')
    expect(
      within(row).getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
    expect(
      within(row).getByRole('button', { name: 'Excluir' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('list', { name: 'Lista de categorias (mobile)' }),
    ).toBeInTheDocument()
  })

  it('cria uma categoria pelo modal', async () => {
    renderPage()
    await waitFor(() => {
      expect(getTable()).toBeInTheDocument()
    })

    await createCategory('Pets')

    expect(await within(getTable()).findByText('Pets')).toBeInTheDocument()
  })

  it('edita uma categoria existente', async () => {
    renderPage()
    await waitFor(() => {
      expect(getTable()).toBeInTheDocument()
    })

    const row = getRowByText('Lazer')
    fireEvent.click(within(row).getByRole('button', { name: 'Editar' }))

    expect(
      screen.getByRole('dialog', { name: 'Editar categoria' }),
    ).toBeInTheDocument()

    fill('Nome', 'Lazer e hobbies')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Categoria atualizada!')).toBeInTheDocument()
    expect(
      await within(getTable()).findByText('Lazer e hobbies'),
    ).toBeInTheDocument()
  })

  it('exclui uma categoria sem vínculo com confirmação', async () => {
    renderPage()
    await waitFor(() => {
      expect(getTable()).toBeInTheDocument()
    })

    await createCategory('Temporária')

    const row = getRowByText('Temporária')
    fireEvent.click(within(row).getByRole('button', { name: 'Excluir' }))

    expect(
      screen.getByRole('dialog', { name: 'Excluir categoria' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Categoria excluída!')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        within(getTable()).queryByText('Temporária'),
      ).not.toBeInTheDocument()
    })
  })

  it('bloqueia a exclusão de categoria em uso mostrando a mensagem', async () => {
    renderPage()
    await waitFor(() => {
      expect(getTable()).toBeInTheDocument()
    })

    const row = getRowByText('Alimentação')
    fireEvent.click(within(row).getByRole('button', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/em uso/i)
    expect(
      screen.getByRole('dialog', { name: 'Excluir categoria' }),
    ).toBeInTheDocument()
  })

  it('mostra o estado vazio quando não há categorias', async () => {
    server.use(http.get('*/categories', () => HttpResponse.json([])))

    renderPage()

    expect(
      await screen.findByText('Nenhuma categoria encontrada.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma categoria encontrada.',
    )
  })

  it('mostra o estado de erro e permite tentar novamente', async () => {
    server.use(
      http.get('*/categories', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 }),
      ),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as categorias.',
    )

    server.resetHandlers()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => {
      expect(getTable()).toBeInTheDocument()
    })
  })
})
