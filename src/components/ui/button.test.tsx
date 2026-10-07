import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button (AC-003)', () => {
  it('renderiza um button com o texto e dispara onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Salvar</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('aplica variante, tamanho e foco via classes de token', () => {
    render(
      <Button variant="destructive" size="lg">
        Excluir
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Excluir' })
    expect(button.className).toContain('bg-destructive')
    expect(button.className).toContain('h-11')
    expect(button.className).toContain('focus-visible:ring-ring')
  })

  it('não dispara onClick quando desabilitado', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('encaminha a ref para o elemento button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Salvar</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toHaveTextContent('Salvar')
  })

  it('com asChild renderiza o filho mantendo as classes', () => {
    render(
      <Button asChild>
        <a href="/login">Entrar</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Entrar' })
    expect(link).toHaveAttribute('href', '/login')
    expect(link.className).toContain('bg-primary')
  })
})
