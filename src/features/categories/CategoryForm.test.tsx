import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category, CategoryInput } from '@/types'
import { CategoryForm } from './CategoryForm'

const existingCategory: Category = {
  id: 'lazer',
  name: 'Lazer',
  type: 'expense',
}

interface RenderOptions {
  category?: Category | null
  onSubmit?: (input: CategoryInput) => Promise<void> | void
  onOpenChange?: (open: boolean) => void
}

const renderForm = (options: RenderOptions = {}) => {
  const onSubmit = options.onSubmit ?? vi.fn()
  const onOpenChange = options.onOpenChange ?? vi.fn()

  render(
    <CategoryForm
      open
      category={options.category ?? null}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />,
  )

  return { onSubmit, onOpenChange }
}

const fill = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const clickSave = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

describe('CategoryForm (AC-007)', () => {
  it('exibe o modal de criação com Nome, Tipo e ações', () => {
    renderForm()

    expect(
      screen.getByRole('dialog', { name: 'Nova categoria' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Receita' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Despesa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('valida os campos obrigatórios', async () => {
    renderForm()

    clickSave()

    expect(
      await screen.findByText('Informe o nome da categoria'),
    ).toBeInTheDocument()
    expect(screen.getByText('Selecione o tipo')).toBeInTheDocument()
  })

  it('salva a categoria e fecha o modal', async () => {
    const { onSubmit, onOpenChange } = renderForm()

    fill('Nome', 'Pets')
    fill('Tipo', 'expense')
    clickSave()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Pets', type: 'expense' })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('no modo edição, pré-preenche e salva as alterações', async () => {
    const { onSubmit } = renderForm({ category: existingCategory })

    expect(
      screen.getByRole('dialog', { name: 'Editar categoria' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Lazer')
    expect(screen.getByLabelText('Tipo')).toHaveValue('expense')

    fill('Nome', 'Lazer e hobbies')
    clickSave()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Lazer e hobbies',
        type: 'expense',
      })
    })
  })

  it('mostra erro e mantém o modal quando o salvamento falha', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'))
    const { onOpenChange } = renderForm({ onSubmit })

    fill('Nome', 'Pets')
    fill('Tipo', 'expense')
    clickSave()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a categoria',
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
