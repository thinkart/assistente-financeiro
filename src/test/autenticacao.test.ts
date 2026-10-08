import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  dependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const authDependencies = [
  'react-router-dom',
  'react-hook-form',
  'zod',
  '@hookform/resolvers',
  'sonner',
]

describe('dependências da autenticação (AC-001)', () => {
  it.each(authDependencies)('declara %s em dependencies', (dependency) => {
    expect(packageJson.dependencies?.[dependency]).toBeDefined()
  })
})

describe('documentação da autenticação no README (T-012)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('documenta rotas, sessão e credenciais de demonstração', () => {
    expect(readme).toContain('## Autenticação')
    expect(readme).toContain('/login')
    expect(readme).toContain('/cadastro')
    expect(readme).toContain('financas-token')
    expect(readme).toContain('RequireAuth')
    expect(readme).toContain('demo@financas.dev')
  })
})
