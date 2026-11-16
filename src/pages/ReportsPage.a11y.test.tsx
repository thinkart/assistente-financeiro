import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { MOCK_ACCESS_TOKEN } from '@/mocks/handlers/auth'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { runAxe } from '@/test/a11y'
import { setStoredToken } from '@/services/token'
import { ReportsPage } from './ReportsPage'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const renderPage = () => render(<ReportsPage />, { wrapper: createWrapper() })

describe('acessibilidade da ReportsPage (AC-002)', () => {
  beforeEach(() => {
    setStoredToken(MOCK_ACCESS_TOKEN)
    resetTransactionStore()
    resetCategoryStore()
  })

  it('não possui violações apontadas pelo axe', async () => {
    const { container } = renderPage()

    await screen.findByText('Despesas por categoria')

    expect(await runAxe(container)).toHaveNoViolations()
  })
})
