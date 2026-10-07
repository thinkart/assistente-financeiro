import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import tailwindConfig from '../../tailwind.config'

interface PackageJson {
  dependencies?: Record<string, string>
}

interface TailwindExtend {
  colors?: Record<string, unknown>
  borderRadius?: Record<string, string>
  fontFamily?: Record<string, string[]>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

const tailwindExtend = tailwindConfig.theme?.extend as unknown as
  | TailwindExtend
  | undefined

describe('dependências do sistema de tema (AC-006, AC-007)', () => {
  it('declara lucide-react para os ícones do ThemeToggle', () => {
    expect(packageJson.dependencies?.['lucide-react']).toBeDefined()
  })

  it('declara @fontsource/inter para a fonte Inter', () => {
    expect(packageJson.dependencies?.['@fontsource/inter']).toBeDefined()
  })
})

describe('configuração do Tailwind (AC-001)', () => {
  it('usa a estratégia de classe no dark mode', () => {
    expect(tailwindConfig.darkMode).toBe('class')
  })

  it('define os tokens semânticos de cor', () => {
    const colors = tailwindExtend?.colors

    expect(colors).toBeDefined()
    expect(Object.keys(colors ?? {})).toEqual(
      expect.arrayContaining([
        'background',
        'foreground',
        'card',
        'primary',
        'secondary',
        'muted',
        'accent',
        'destructive',
        'border',
        'input',
        'ring',
        'income',
        'expense',
      ]),
    )
    expect(colors?.background).toBe('hsl(var(--background))')
    expect(colors?.foreground).toBe('hsl(var(--foreground))')
    expect(colors?.card).toEqual({
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    })
    expect(colors?.primary).toEqual({
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    })
    expect(colors?.secondary).toEqual({
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    })
    expect(colors?.muted).toEqual({
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    })
    expect(colors?.accent).toEqual({
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    })
    expect(colors?.destructive).toEqual({
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    })
    expect(colors?.border).toBe('hsl(var(--border))')
    expect(colors?.input).toBe('hsl(var(--input))')
    expect(colors?.ring).toBe('hsl(var(--ring))')
    expect(colors?.income).toBe('hsl(var(--income))')
    expect(colors?.expense).toBe('hsl(var(--expense))')
  })

  it('mapeia o borderRadius para a variável --radius', () => {
    expect(tailwindExtend?.borderRadius).toEqual({
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    })
  })

  it('define Inter como primeira fonte da família sans', () => {
    expect(tailwindExtend?.fontFamily?.sans?.[0]).toBe('Inter')
  })
})
