import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { runAxe } from '@/test/a11y'
import { TransactionsPage } from './TransactionsPage'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppToaster />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const renderPage = () =>
  render(<TransactionsPage />, { wrapper: createWrapper() })

describe('acessibilidade da TransactionsPage (AC-002)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('não possui violações apontadas pelo axe', async () => {
    const { container } = renderPage()

    await screen.findByText('Transações cadastradas')
    await screen.findByRole('table')

    expect(await runAxe(container)).toHaveNoViolations()
  })
})
