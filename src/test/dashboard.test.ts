import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  dependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const dashboardDependencies = ['recharts', 'date-fns']

describe('dependências do dashboard (AC-001)', () => {
  it.each(dashboardDependencies)('declara %s em dependencies', (dependency) => {
    expect(packageJson.dependencies?.[dependency]).toBeDefined()
  })
})
