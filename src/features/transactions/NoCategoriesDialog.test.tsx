import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NoCategoriesDialog } from './NoCategoriesDialog'

interface RenderOptions {
  onOpenChange?: (open: boolean) => void
  onGoToCategories?: () => void
}

const renderDialog = (options: RenderOptions = {}) => {
  const onOpenChange = options.onOpenChange ?? vi.fn()
  const onGoToCategories = options.onGoToCategories ?? vi.fn()

  render(
    <NoCategoriesDialog
      open
      onOpenChange={onOpenChange}
      onGoToCategories={onGoToCategories}
    />,
  )

  return { onOpenChange, onGoToCategories }
}

describe('NoCategoriesDialog (categorias obrigatórias)', () => {
  it('orienta o cadastro de categoria antes da transação', () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Nenhuma categoria cadastrada' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Cadastre pelo menos uma categoria antes de cadastrar uma transação',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ir para categorias' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('navega para categorias ao confirmar', () => {
    const { onGoToCategories } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Ir para categorias' }))

    expect(onGoToCategories).toHaveBeenCalledTimes(1)
  })

  it('cancela e fecha o diálogo', () => {
    const { onOpenChange, onGoToCategories } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onGoToCategories).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
