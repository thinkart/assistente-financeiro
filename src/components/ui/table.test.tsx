import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const renderTable = () =>
  render(
    <Table>
      <TableCaption>Transações recentes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>01/10</TableCell>
          <TableCell>Mercado</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>R$ 100,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  )

describe('Table (AC-007)', () => {
  it('renderiza as seções e células com semântica de tabela', () => {
    renderTable()

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Transações recentes').tagName).toBe('CAPTION')
    expect(
      screen.getByRole('columnheader', { name: 'Data' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Mercado' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'R$ 100,00' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('usa tokens no cabeçalho, nas linhas e no rodapé', () => {
    const { container } = renderTable()

    expect(
      screen.getByRole('columnheader', { name: 'Data' }).className,
    ).toContain('text-muted-foreground')

    const bodyRow = screen.getByRole('cell', { name: 'Mercado' }).closest('tr')
    expect(bodyRow?.className).toContain('hover:bg-muted/50')
    expect(bodyRow?.className).toContain('border-b')

    expect(container.querySelector('tfoot')?.className).toContain('bg-muted/50')
  })

  it('encaminha a ref para o elemento table', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(ref.current).toBeInstanceOf(HTMLTableElement)
  })

  it('mescla className customizada mantendo os padrões', () => {
    const { container } = render(<Table className="max-w-md">tabela</Table>)

    const table = container.querySelector('table')
    expect(table?.className).toContain('max-w-md')
    expect(table?.className).toContain('w-full')
  })
})
