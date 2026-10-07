import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isMockEnabled } from '@/mocks/config'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  msw?: { workerDirectory?: string | string[] }
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

describe('dependências e worker do MSW (AC-001)', () => {
  it('declara axios em dependencies', () => {
    expect(packageJson.dependencies?.axios).toBeDefined()
  })

  it('declara msw em devDependencies', () => {
    expect(packageJson.devDependencies?.msw).toBeDefined()
  })

  it('configura o workerDirectory do msw como public', () => {
    expect(packageJson.msw?.workerDirectory).toContain('public')
  })

  it('versiona o worker public/mockServiceWorker.js', () => {
    const workerPath = join(process.cwd(), 'public/mockServiceWorker.js')

    expect(existsSync(workerPath)).toBe(true)
    expect(readFileSync(workerPath, 'utf8').length).toBeGreaterThan(1000)
  })
})

describe('interruptor do mock (AC-001)', () => {
  it('só habilita o worker quando VITE_USE_MOCK é "true"', () => {
    expect(isMockEnabled('true')).toBe(true)
    expect(isMockEnabled('false')).toBe(false)
    expect(isMockEnabled(undefined)).toBe(false)
  })
})

describe('bootstrap do MSW no main.tsx (AC-001)', () => {
  const mainSource = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8')

  it('inicializa o worker condicionalmente ao VITE_USE_MOCK', () => {
    expect(mainSource).toContain('VITE_USE_MOCK')
    expect(mainSource).toContain("import('@/mocks/browser')")
    expect(mainSource).toContain('worker.start')
  })

  it('renderiza o app depois de habilitar o mock', () => {
    expect(mainSource).toContain('enableMocking().then')
  })
})
