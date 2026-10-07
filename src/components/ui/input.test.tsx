import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'

describe('Input (AC-004)', () => {
  it('renderiza com placeholder e aceita digitação', () => {
    const onChange = vi.fn()
    render(<Input placeholder="E-mail" onChange={onChange} />)

    const input = screen.getByPlaceholderText('E-mail')
    fireEvent.change(input, { target: { value: 'ana@email.com' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('ana@email.com')
  })

  it('usa classes de token para borda, fundo e foco', () => {
    render(<Input aria-label="Valor" />)

    const input = screen.getByLabelText('Valor')
    expect(input.className).toContain('border-input')
    expect(input.className).toContain('bg-background')
    expect(input.className).toContain('focus-visible:ring-ring')
  })

  it('encaminha a ref para o elemento input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} defaultValue="100" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveValue('100')
  })

  it('respeita o estado desabilitado e o type', () => {
    render(<Input type="number" disabled aria-label="Valor" />)

    const input = screen.getByLabelText('Valor')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('type', 'number')
  })
})
