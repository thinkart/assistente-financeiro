import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const renderTabs = () =>
  render(
    <Tabs defaultValue="transacoes">
      <TabsList>
        <TabsTrigger value="transacoes">Transações</TabsTrigger>
        <TabsTrigger value="categorias">Categorias</TabsTrigger>
      </TabsList>
      <TabsContent value="transacoes">Lista de transações</TabsContent>
      <TabsContent value="categorias">Lista de categorias</TabsContent>
    </Tabs>,
  )

describe('Tabs (AC-009)', () => {
  it('renderiza a tablist com a aba inicial selecionada e seu painel', () => {
    renderTabs()

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Transações' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'Lista de transações',
    )
    expect(screen.queryByText('Lista de categorias')).not.toBeInTheDocument()
  })

  it('troca de painel ao clicar em outra aba', () => {
    renderTabs()

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Categorias' }), {
      button: 0,
      ctrlKey: false,
    })

    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'Lista de categorias',
    )
  })

  it('navega entre as abas com as setas do teclado', async () => {
    renderTabs()

    const firstTab = screen.getByRole('tab', { name: 'Transações' })
    firstTab.focus()
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'Lista de categorias',
    )
  })

  it('usa tokens no TabsList, nos Triggers e no Content', () => {
    renderTabs()

    const tablist = screen.getByRole('tablist')
    expect(tablist.className).toContain('bg-muted')
    expect(tablist.className).toContain('text-muted-foreground')

    const activeTab = screen.getByRole('tab', { name: 'Transações' })
    expect(activeTab.className).toContain('data-[state=active]:bg-background')
    expect(activeTab.className).toContain('focus-visible:ring-ring')

    expect(screen.getByRole('tabpanel').className).toContain(
      'focus-visible:ring-ring',
    )
  })
})
