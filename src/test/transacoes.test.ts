import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  dependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const mainSource = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8')

describe('dependências da feature de transações (AC-001)', () => {
  it('declara @tanstack/react-query em dependencies', () => {
    expect(packageJson.dependencies?.['@tanstack/react-query']).toBeDefined()
  })
})

describe('QueryProvider na raiz (AC-001)', () => {
  it('envolve o app com o QueryProvider no main.tsx', () => {
    expect(mainSource).toContain('QueryProvider')
  })
})

describe('documentação da feature de transações no README (T-011)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('documenta a rota, os filtros e o fluxo de CRUD', () => {
    expect(readme).toContain('## Transações')
    expect(readme).toContain('/transacoes')
    expect(readme).toContain('Aplicar filtros')
    expect(readme).toContain('Salvar e adicionar outra')
  })

  it('documenta a paginação e o estado via React Query', () => {
    expect(readme).toContain('React Query')
    expect(readme).toContain('10 itens')
  })
})
