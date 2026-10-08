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
