import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  dependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

describe('dependências do sistema de tema (AC-006, AC-007)', () => {
  it('declara lucide-react para os ícones do ThemeToggle', () => {
    expect(packageJson.dependencies?.['lucide-react']).toBeDefined()
  })

  it('declara @fontsource/inter para a fonte Inter', () => {
    expect(packageJson.dependencies?.['@fontsource/inter']).toBeDefined()
  })
})
