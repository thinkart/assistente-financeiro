import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'
import { AssistantPage } from './AssistantPage'

const authValue: AuthContextValue = {
  user: {
    id: 'user-consent',
    name: 'Carlos Consentimento',
    email: 'carlos@example.com',
    cpf: '11144477735',
    phone: '11999990000',
  },
  isLoading: false,
  isAuthenticated: true,
  signIn: () => Promise.resolve({
    id: 'user-consent',
    name: 'Carlos Consentimento',
    email: 'carlos@example.com',
    cpf: '11144477735',
    phone: '11999990000',
  }),
  signUp: () => Promise.resolve({
    id: 'user-consent',
    name: 'Carlos Consentimento',
    email: 'carlos@example.com',
    cpf: '11144477735',
    phone: '11999990000',
  }),
  signOut: () => {},
  updateUser: () => Promise.resolve({
    id: 'user-consent',
    name: 'Carlos Consentimento',
    email: 'carlos@example.com',
    cpf: '11144477735',
    phone: '11999990000',
  }),
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider value={authValue}>
          <AssistantPage />
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe('Consentimento de IA e Ausência de Exposição de Chaves', () => {
  it('abre modal explicativo de consentimento e privacidade', async () => {
    renderPage()

    const consentBtn = await screen.findByRole('button', {
      name: /Privacidade & IA/i,
    })
    expect(consentBtn).toBeInTheDocument()

    fireEvent.click(consentBtn)

    expect(
      await screen.findByText('Privacidade e Análise Externa por IA'),
    ).toBeInTheDocument()
    expect(screen.getByText('Google Gemini (através de conexão criptografada direta pelo backend do servidor).')).toBeInTheDocument()
    expect(screen.getByText('O que NUNCA é compartilhado?')).toBeInTheDocument()
  })

  it('garante que nenhuma chave secreta de IA exista no bundle do front-end', () => {
    // Verifica que variáveis VITE_* não contêm chaves de IA
    const envKeys = Object.keys(import.meta.env)
    const dangerousAiKeys = envKeys.filter((k) =>
      /AI_API_KEY|GEMINI_API_KEY|OPENAI_API_KEY|SECRET/i.test(k),
    )
    expect(dangerousAiKeys).toHaveLength(0)
  })
})
