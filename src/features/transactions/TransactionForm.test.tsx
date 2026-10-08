import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category, Transaction, TransactionInput } from '@/types'
import { TransactionForm } from './TransactionForm'

const categories: Category[] = [
  { id: 'salario', name: 'Salário', type: 'income' },
  { id: 'alimentacao', name: 'Alimentação', type: 'expense' },
]

const existingTransaction: Transaction = {
  id: 't1',
  description: 'Mercado',
  amount: 320.5,
  type: 'expense',
  paymentMethod: 'debito',
  date: '2026-10-01',
  categoryId: 'alimentacao',
}

interface RenderOptions {
  transaction?: Transaction | null
  onSubmit?: (input: TransactionInput) => Promise<void> | void
  onSaveAndAddAnother?: (input: TransactionInput) => Promise<void> | void
  onOpenChange?: (open: boolean) => void
}

const renderForm = (options: RenderOptions = {}) => {
  const onSubmit = options.onSubmit ?? vi.fn()
  const onSaveAndAddAnother = options.onSaveAndAddAnother ?? vi.fn()
  const onOpenChange = options.onOpenChange ?? vi.fn()

  render(
    <TransactionForm
      open
      transaction={options.transaction ?? null}
      categories={categories}
      onSubmit={onSubmit}
      onSaveAndAddAnother={onSaveAndAddAnother}
      onOpenChange={onOpenChange}
    />,
  )

  return { onSubmit, onSaveAndAddAnother, onOpenChange }
}

const fill = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const fillValidForm = () => {
  fill('Descrição', 'Nova despesa')
  fill('Valor (R$)', '99,90')
  fill('Tipo', 'expense')
  fill('Categoria', 'alimentacao')
  fill('Método de pagamento', 'pix')
  fill('Data', '2026-10-10')
}

const clickSave = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

describe('TransactionForm (AC-008)', () => {
  it('exibe o modal de criação com os campos do wireframe', () => {
    renderForm()

    expect(
      screen.getByRole('dialog', { name: 'Nova transação' }),
    ).toBeInTheDocument()

    for (const label of [
      'Descrição',
      'Valor (R$)',
      'Tipo',
      'Categoria',
      'Método de pagamento',
      'Data',
      'Repetição',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Salvar e adicionar outra' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Não repetir' }),
    ).toBeInTheDocument()
  })

  it('valida os campos obrigatórios', async () => {
    renderForm()

    clickSave()

    expect(await screen.findByText('Informe a descrição')).toBeInTheDocument()
    expect(screen.getByText('Informe o valor')).toBeInTheDocument()
    expect(screen.getByText('Selecione o tipo')).toBeInTheDocument()
    expect(screen.getByText('Selecione a categoria')).toBeInTheDocument()
    expect(
      screen.getByText('Selecione o método de pagamento'),
    ).toBeInTheDocument()
    expect(screen.getByText('Informe a data')).toBeInTheDocument()
  })

  it('salva convertendo o valor e fecha o modal', async () => {
    const { onSubmit, onOpenChange } = renderForm()

    fillValidForm()
    clickSave()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: 'Nova despesa',
        amount: 99.9,
        type: 'expense',
        categoryId: 'alimentacao',
        paymentMethod: 'pix',
        date: '2026-10-10',
      })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('limpa o formulário ao salvar e adicionar outra, mantendo o modal', async () => {
    const { onSubmit, onSaveAndAddAnother, onOpenChange } = renderForm()

    fillValidForm()
    fireEvent.click(
      screen.getByRole('button', { name: 'Salvar e adicionar outra' }),
    )

    await waitFor(() => {
      expect(onSaveAndAddAnother).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)

    await waitFor(() => {
      expect(screen.getByLabelText('Descrição')).toHaveValue('')
    })
  })

  it('no modo edição, pré-preenche os campos e não oferece adicionar outra', async () => {
    const { onSubmit } = renderForm({ transaction: existingTransaction })

    expect(
      screen.getByRole('dialog', { name: 'Editar transação' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toHaveValue('Mercado')
    expect(screen.getByLabelText('Valor (R$)')).toHaveValue('320.5')
    expect(screen.getByLabelText('Tipo')).toHaveValue('expense')
    expect(screen.getByLabelText('Categoria')).toHaveValue('alimentacao')
    expect(screen.getByLabelText('Método de pagamento')).toHaveValue('debito')
    expect(screen.getByLabelText('Data')).toHaveValue('2026-10-01')

    expect(
      screen.queryByRole('button', { name: 'Salvar e adicionar outra' }),
    ).not.toBeInTheDocument()

    fill('Descrição', 'Mercado atualizado')
    clickSave()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Mercado atualizado' }),
      )
    })
  })

  it('mostra erro e mantém o modal quando o salvamento falha', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'))
    const { onOpenChange } = renderForm({ onSubmit })

    fillValidForm()
    clickSave()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a transação',
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
