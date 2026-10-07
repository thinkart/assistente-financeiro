import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import animate from 'tailwindcss-animate'
import { describe, expect, it } from 'vitest'
import tailwindConfig from '../../tailwind.config'
import { cn } from '@/lib/utils'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface ComponentsJson {
  style?: string
  rsc?: boolean
  tsx?: boolean
  tailwind?: {
    config?: string
    css?: string
    baseColor?: string
    cssVariables?: boolean
    prefix?: string
  }
  aliases?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const componentsJson = JSON.parse(
  readFileSync(join(process.cwd(), 'components.json'), 'utf8'),
) as ComponentsJson

const runtimeDependencies = [
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  '@radix-ui/react-slot',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-tabs',
]

const buildDependencies = ['tailwindcss-animate']

describe('dependências do design system (AC-001)', () => {
  it.each(runtimeDependencies)('declara %s em dependencies', (dependency) => {
    expect(packageJson.dependencies?.[dependency]).toBeDefined()
  })

  it.each(buildDependencies)(
    'declara %s em devDependencies (uso apenas em build)',
    (dependency) => {
      expect(packageJson.devDependencies?.[dependency]).toBeDefined()
    },
  )
})

describe('configuração do shadcn/ui (AC-001)', () => {
  it('define o components.json apontando para os arquivos do projeto', () => {
    expect(componentsJson.style).toBe('default')
    expect(componentsJson.rsc).toBe(false)
    expect(componentsJson.tsx).toBe(true)
    expect(componentsJson.tailwind).toEqual({
      config: 'tailwind.config.ts',
      css: 'src/styles/globals.css',
      baseColor: 'slate',
      cssVariables: true,
      prefix: '',
    })
    expect(componentsJson.aliases).toEqual({
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    })
  })

  it('registra o plugin tailwindcss-animate', () => {
    expect(tailwindConfig.plugins).toContain(animate)
  })
})

describe('utilitário cn (AC-001)', () => {
  it('combina classes condicionais', () => {
    expect(cn('p-4', undefined, 'text-sm', null, false)).toBe('p-4 text-sm')
  })

  it('resolve conflitos do Tailwind mantendo a última classe', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('bg-background', 'bg-card')).toBe('bg-card')
  })
})

describe('documentação do design system no README (T-010)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('explica como o shadcn/ui está configurado', () => {
    expect(readme).toContain('## Design system')
    expect(readme).toContain('shadcn@2.3.0')
    expect(readme).toContain('components.json')
    expect(readme).toContain('src/lib/utils')
    expect(readme).toContain('tailwindcss-animate')
  })

  it('lista o diretório e os componentes base', () => {
    expect(readme).toContain('src/components/ui')
    expect(readme).toContain('Button')
    expect(readme).toContain('Dialog')
    expect(readme).toContain('Dropdown Menu')
    expect(readme).toContain('Tabs')
  })
})
