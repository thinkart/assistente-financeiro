import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import App from '@/App'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { isMockEnabled } from '@/mocks/config'
import '@/styles/globals.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

async function enableMocking() {
  if (!isMockEnabled(import.meta.env.VITE_USE_MOCK)) return

  try {
    const { worker } = await import('@/mocks/browser')
    return await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    })
  } catch (error) {
    console.error('Falha ao iniciar o mock do MSW:', error)
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={basename}>
        <QueryProvider>
          <ThemeProvider>
            <AppToaster />
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </BrowserRouter>
    </StrictMode>,
  )
})
