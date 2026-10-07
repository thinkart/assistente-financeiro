import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
)

describe('Card (AC-005)', () => {
  it('renderiza as seções com título, descrição, conteúdo e rodapé', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Saldo</CardTitle>
          <CardDescription>Resumo do mês</CardDescription>
        </CardHeader>
        <CardContent>R$ 1.500,00</CardContent>
        <CardFooter>Atualizado hoje</CardFooter>
      </Card>,
    )

    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('Resumo do mês')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getByText('Atualizado hoje')).toBeInTheDocument()
  })

  it('usa tokens de card e raio no contêiner', () => {
    const { container } = render(<Card>conteúdo</Card>)
    const card = container.firstElementChild

    expect(card?.className).toContain('bg-card')
    expect(card?.className).toContain('text-card-foreground')
    expect(card?.className).toContain('rounded-lg')
    expect(card?.className).toContain('border')
  })

  it('mescla className customizada mantendo os tokens', () => {
    const { container } = render(<Card className="p-4">conteúdo</Card>)
    const card = container.firstElementChild

    expect(card?.className).toContain('p-4')
    expect(card?.className).toContain('bg-card')
  })

  it('encaminha a ref para o elemento div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>conteúdo</Card>)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('aplica token de texto suave na descrição', () => {
    render(<CardDescription>Resumo</CardDescription>)

    expect(screen.getByText('Resumo').className).toContain(
      'text-muted-foreground',
    )
  })
})

describe('bordas tokenizadas (AC-005)', () => {
  it('aplica border-border como padrão global do projeto', () => {
    expect(globalsCss).toContain('@apply border-border')
  })
})
