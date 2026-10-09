import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  devDependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const eslintConfigSource = readFileSync(
  join(process.cwd(), 'eslint.config.js'),
  'utf8',
)

const readmeSource = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

describe('acessibilidade estática no ESLint (AC-001)', () => {
  it('declara eslint-plugin-jsx-a11y em devDependencies', () => {
    expect(
      packageJson.devDependencies?.['eslint-plugin-jsx-a11y'],
    ).toBeDefined()
  })

  it('registra as regras recomendadas do jsx-a11y no flat config', () => {
    expect(eslintConfigSource).toContain('eslint-plugin-jsx-a11y')
    expect(eslintConfigSource).toContain('jsx-a11y')
    expect(eslintConfigSource).toContain('flatConfigs.recommended')
  })
})

describe('README final (AC-005)', () => {
  it('consolida as seções de rotas, acessibilidade e entregáveis', () => {
    expect(readmeSource).toContain('## Rotas')
    expect(readmeSource).toContain('## Acessibilidade')
    expect(readmeSource).toContain('## Entregáveis')
  })

  it('documenta rotas, credenciais de demonstração e alternância mock/API real', () => {
    for (const route of [
      '/login',
      '/cadastro',
      '/transacoes',
      '/categorias',
      '/relatorios',
    ]) {
      expect(readmeSource).toContain(`\`${route}\``)
    }

    expect(readmeSource).toContain('demo@financas.dev')
    expect(readmeSource).toContain('123456')
    expect(readmeSource).toContain('VITE_USE_MOCK=false')
    expect(readmeSource).toContain('VITE_API_URL')
  })
})
