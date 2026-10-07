import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import App from '@/App'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { isMockEnabled } from '@/mocks/config'
import '@/styles/globals.css'

async function enableMocking() {
  if (!isMockEnabled(import.meta.env.VITE_USE_MOCK)) return

  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
})
