import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

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
