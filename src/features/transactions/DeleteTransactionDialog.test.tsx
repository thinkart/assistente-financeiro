import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@/types'
import { DeleteTransactionDialog } from './DeleteTransactionDialog'

const transaction: Transaction = {
  id: 't1',
  description: 'Mercado',
  amount: 320.5,
  type: 'expense',
  paymentMethod: 'debito',
  date: '2026-10-01',
  categoryId: 'alimentacao',
}

interface RenderOptions {
  onConfirm?: () => Promise<void> | void
  onOpenChange?: (open: boolean) => void
}

const renderDialog = (options: RenderOptions = {}) => {
  const onConfirm = options.onConfirm ?? vi.fn()
  const onOpenChange = options.onOpenChange ?? vi.fn()

  render(
    <DeleteTransactionDialog
      open
      transaction={transaction}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  )

  return { onConfirm, onOpenChange }
}

describe('DeleteTransactionDialog (AC-009)', () => {
  it('pede confirmação citando a transação', () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Excluir transação' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Mercado/)).toBeInTheDocument()
    expect(screen.getByText(/não pode ser desfeita/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('confirma a exclusão e fecha o diálogo', async () => {
    const { onConfirm, onOpenChange } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('cancela sem excluir', () => {
    const { onConfirm, onOpenChange } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('mostra erro e mantém o diálogo quando a exclusão falha', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('falhou'))
    const { onOpenChange } = renderDialog({ onConfirm })

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir a transação',
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
