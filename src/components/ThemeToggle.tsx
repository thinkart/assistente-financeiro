import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers/theme-context'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Moon : Sun

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Icon size={18} />
    </button>
  )
}
