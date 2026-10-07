import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = process.cwd()

const baseDirs = [
  'app',
  'components',
  'features',
  'hooks',
  'services',
  'mocks',
  'types',
  'styles',
  'utils',
  'pages',
]

const featureDirs = ['auth', 'transactions', 'categories', 'reports']

describe('estrutura de pastas src/ (AC-007)', () => {
  it.each(baseDirs)('deve existir a pasta src/%s', (dir) => {
    expect(existsSync(join(rootDir, 'src', dir))).toBe(true)
  })

  it.each(featureDirs)('deve existir a subpasta src/features/%s', (dir) => {
    expect(existsSync(join(rootDir, 'src', 'features', dir))).toBe(true)
  })

  it('deve existir src/main.tsx', () => {
    expect(existsSync(join(rootDir, 'src', 'main.tsx'))).toBe(true)
  })
})

describe('.env.example (AC-008)', () => {
  it('define VITE_API_URL da API local', () => {
    const envExample = readFileSync(join(rootDir, '.env.example'), 'utf8')

    expect(envExample).toContain('VITE_API_URL=http://127.0.0.1:5000')
  })

  it('define VITE_USE_MOCK=true', () => {
    const envExample = readFileSync(join(rootDir, '.env.example'), 'utf8')

    expect(envExample).toContain('VITE_USE_MOCK=true')
  })
})

describe('.gitignore (AC-008)', () => {
  it.each(['.env', 'node_modules', 'dist'])('ignora o padrão %s', (entry) => {
    const gitignore = readFileSync(join(rootDir, '.gitignore'), 'utf8')

    expect(gitignore).toMatch(new RegExp(`^${entry}$`, 'm'))
  })
})
