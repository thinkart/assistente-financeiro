import { ThemeToggle } from '@/components/ThemeToggle'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight">
            Assistente Financeiro
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao seu assistente financeiro
        </h2>
        <p className="text-muted-foreground">
          Front-end em construção — sistema de tema concluído.
        </p>
      </main>
    </div>
  )
}

export default App
