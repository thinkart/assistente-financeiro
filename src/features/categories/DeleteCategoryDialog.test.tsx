import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '@/types'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'

const category: Category = {
  id: 'lazer',
  name: 'Lazer',
  type: 'expense',
}

interface RenderOptions {
  onConfirm?: () => Promise<void> | void
  onOpenChange?: (open: boolean) => void
}

const renderDialog = (options: RenderOptions = {}) => {
  const onConfirm = options.onConfirm ?? vi.fn()
  const onOpenChange = options.onOpenChange ?? vi.fn()

  render(
    <DeleteCategoryDialog
      open
      category={category}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  )

  return { onConfirm, onOpenChange }
}

describe('DeleteCategoryDialog (AC-008)', () => {
  it('pede confirmação citando a categoria', () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Excluir categoria' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Lazer/)).toBeInTheDocument()
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

  it('mostra a mensagem do backend quando a categoria está em uso', async () => {
    const blockedError = Object.assign(new Error('bloqueada'), {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Categoria em uso por 2 transação(ões)' },
      },
    })
    const onConfirm = vi.fn().mockRejectedValue(blockedError)
    const { onOpenChange } = renderDialog({ onConfirm })

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Categoria em uso por 2 transação(ões)',
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('mostra mensagem genérica para falhas sem resposta do backend', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('rede'))
    renderDialog({ onConfirm })

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir a categoria',
    )
  })
})
