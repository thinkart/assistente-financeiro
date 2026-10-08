import { useQueryClient } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryProvider } from './QueryProvider'

const Probe = () => {
  const queryClient = useQueryClient()

  return <div>query client: {queryClient ? 'disponível' : 'ausente'}</div>
}

describe('QueryProvider (AC-001)', () => {
  it('disponibiliza o query client para a árvore', () => {
    render(
      <QueryProvider>
        <Probe />
      </QueryProvider>,
    )

    expect(screen.getByText('query client: disponível')).toBeInTheDocument()
  })
})
