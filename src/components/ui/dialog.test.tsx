import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const renderDialog = () =>
  render(
    <Dialog>
      <DialogTrigger>Abrir modal</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
          <DialogDescription>Preencha os dados abaixo.</DialogDescription>
        </DialogHeader>
        <DialogFooter>Rodapé do modal</DialogFooter>
      </DialogContent>
    </Dialog>,
  )

const openDialog = () => {
  renderDialog()
  fireEvent.click(screen.getByRole('button', { name: 'Abrir modal' }))
}

const getOverlay = () =>
  Array.from(document.querySelectorAll('[data-state="open"]')).find((element) =>
    element.className.includes('bg-background/80'),
  )

describe('Dialog (AC-006)', () => {
  it('não renderiza o conteúdo antes de abrir', () => {
    renderDialog()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre com título e descrição acessíveis', () => {
    openDialog()

    const dialog = screen.getByRole('dialog', { name: 'Nova transação' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAccessibleDescription('Preencha os dados abaixo.')
    expect(screen.getByText('Rodapé do modal')).toBeInTheDocument()
  })

  it('usa tokens no conteúdo e no overlay, sem cores fixas', () => {
    openDialog()

    const dialog = screen.getByRole('dialog', { name: 'Nova transação' })
    expect(dialog.className).toContain('bg-background')

    const overlay = getOverlay()
    expect(overlay).toBeDefined()
    expect(overlay?.className).not.toContain('bg-black')
  })

  it('fecha com a tecla Escape', () => {
    openDialog()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fecha pelo botão Fechar', () => {
    openDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fecha ao clicar no overlay', async () => {
    openDialog()

    await new Promise((resolve) => setTimeout(resolve, 0))

    const overlay = getOverlay()
    expect(overlay).toBeDefined()
    fireEvent.pointerDown(overlay as Element)
    fireEvent.click(overlay as Element)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
