import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface MenuSpies {
  onSelect?: () => void
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  onValueChange?: (value: string) => void
}

const renderMenu = (spies: MenuSpies = {}) =>
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Abrir menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={spies.onSelect}>Editar</DropdownMenuItem>
        <DropdownMenuItem>
          Exportar
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem
          checked
          onCheckedChange={spies.onCheckedChange}
        >
          Notificações
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup
          value="mes"
          onValueChange={spies.onValueChange}
        >
          <DropdownMenuRadioItem value="mes">Mês</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ano">Ano</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mais opções</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Arquivar</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  )

const openMenu = () => {
  fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu' }), {
    button: 0,
    ctrlKey: false,
  })
}

describe('DropdownMenu (AC-008)', () => {
  it('abre o menu com itens usando tokens popover/accent', () => {
    renderMenu()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    openMenu()

    const menu = screen.getByRole('menu')
    expect(menu.className).toContain('bg-popover')
    expect(menu.className).toContain('text-popover-foreground')
    expect(screen.getByText('Minha conta')).toBeInTheDocument()

    const item = screen.getByRole('menuitem', { name: 'Editar' })
    expect(item.className).toContain('focus:bg-accent')
    expect(screen.getByText('⌘E')).toBeInTheDocument()
  })

  it('dispara onSelect e fecha ao escolher um item', () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    openMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('reflete e altera o estado dos itens de checkbox', () => {
    const onCheckedChange = vi.fn()
    renderMenu({ onCheckedChange })
    openMenu()

    const checkbox = screen.getByRole('menuitemcheckbox', {
      name: 'Notificações',
    })
    expect(checkbox).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(checkbox)

    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('marca a opção ativa nos itens de rádio', () => {
    const onValueChange = vi.fn()
    renderMenu({ onValueChange })
    openMenu()

    expect(
      screen.getByRole('menuitemradio', { name: 'Mês' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('menuitemradio', { name: 'Ano' }),
    ).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Ano' }))

    expect(onValueChange).toHaveBeenCalledWith('ano')
  })

  it('fecha com a tecla Escape', () => {
    renderMenu()
    openMenu()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('abre o submenu ao clicar no gatilho', () => {
    renderMenu()
    openMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Mais opções' }))

    expect(
      screen.getByRole('menuitem', { name: 'Arquivar' }),
    ).toBeInTheDocument()
  })
})
