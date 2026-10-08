import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('documentação da feature de categorias no README (T-011)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('documenta a rota, os badges e a exclusão protegida', () => {
    expect(readme).toContain('## Categorias')
    expect(readme).toContain('/categorias')
    expect(readme).toContain('colors.ts')
    expect(readme).toContain('CategoryBadge')
    expect(readme).toContain('em uso')
  })
})
