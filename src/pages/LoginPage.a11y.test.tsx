import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { runAxe } from '@/test/a11y'
import { LoginPage } from './LoginPage'

const renderLogin = () =>
  render(
    <ThemeProvider>
      <AppToaster />
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )

describe('acessibilidade da LoginPage (AC-002)', () => {
  it('não possui violações apontadas pelo axe', async () => {
    const { container } = renderLogin()

    expect(await runAxe(container)).toHaveNoViolations()
  })
})
