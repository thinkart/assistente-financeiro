import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('documentação da feature de relatórios no README (T-008)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('documenta filtros, gráfico e tabela por categoria', () => {
    expect(readme).toContain('## Relatórios')
    expect(readme).toContain('/relatorios')
    expect(readme).toContain('barras horizontais')
    expect(readme).toContain('Nenhum dado no período.')
  })
})
