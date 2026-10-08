import { Toaster } from 'sonner'
import { useTheme } from '@/app/providers/theme-context'

export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return <Toaster theme={resolvedTheme} richColors position="top-right" />
}
