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

describe('documentação da feature de dashboard no README (T-008)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('documenta os KPIs, o gráfico e as últimas transações', () => {
    expect(readme).toContain('## Dashboard')
    expect(readme).toContain('Resumo financeiro do mês')
    expect(readme).toContain('/reports/summary')
    expect(readme).toContain('Recharts')
    expect(readme).toContain('date-fns')
    expect(readme).toContain('Últimas transações')
  })
})
