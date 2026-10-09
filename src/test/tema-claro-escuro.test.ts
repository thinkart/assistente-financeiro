import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import postcss from 'postcss'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  TailwindExtend | undefined

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
        'popover',
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
        'category-1',
        'category-2',
        'category-3',
        'category-4',
        'category-5',
        'category-6',
        'category-7',
        'category-8',
      ]),
    )
    expect(colors?.background).toBe('hsl(var(--background))')
    expect(colors?.foreground).toBe('hsl(var(--foreground))')
    expect(colors?.card).toEqual({
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    })
    expect(colors?.popover).toEqual({
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
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

    for (const token of [
      'category-1',
      'category-2',
      'category-3',
      'category-4',
      'category-5',
      'category-6',
      'category-7',
      'category-8',
    ]) {
      expect(colors?.[token]).toBe(`hsl(var(--${token}))`)
    }
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

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
)
const globalsRoot = postcss.parse(globalsCss)

const cssVarsBySelector = new Map<string, Record<string, string>>()

globalsRoot.walkRules((rule) => {
  rule.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return
    const vars = cssVarsBySelector.get(rule.selector) ?? {}
    vars[decl.prop] = decl.value
    cssVarsBySelector.set(rule.selector, vars)
  })
})

const collectSourceFiles = (dirOrFile: string): string[] => {
  const absolutePath = join(process.cwd(), dirOrFile)
  if (!existsSync(absolutePath)) return []

  if (!statSync(absolutePath).isDirectory()) {
    const isSourceFile = /\.(ts|tsx)$/.test(absolutePath)
    const isTestFile = /\.test\.(ts|tsx)$/.test(absolutePath)
    return isSourceFile && !isTestFile ? [absolutePath] : []
  }

  return readdirSync(absolutePath).flatMap((entry) =>
    collectSourceFiles(join(dirOrFile, entry)),
  )
}

const expectedLightVars: Record<string, string> = {
  '--background': '0 0% 100%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 100%',
  '--card-foreground': '222 47% 11%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222 47% 11%',
  '--primary': '221 83% 53%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96%',
  '--secondary-foreground': '222 47% 11%',
  '--muted': '210 40% 96%',
  '--muted-foreground': '215 16% 47%',
  '--accent': '210 40% 96%',
  '--accent-foreground': '222 47% 11%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '214 32% 91%',
  '--input': '214 32% 91%',
  '--ring': '221 83% 53%',
  '--income': '142 71% 45%',
  '--expense': '0 84% 60%',
  '--category-1': '221 83% 53%',
  '--category-2': '142 71% 45%',
  '--category-3': '38 92% 50%',
  '--category-4': '262 83% 58%',
  '--category-5': '199 89% 48%',
  '--category-6': '330 81% 60%',
  '--category-7': '239 84% 67%',
  '--category-8': '173 80% 40%',
  '--radius': '0.75rem',
}

const expectedDarkVars: Record<string, string> = {
  '--background': '222 47% 7%',
  '--foreground': '210 40% 98%',
  '--card': '222 47% 10%',
  '--card-foreground': '210 40% 98%',
  '--popover': '222 47% 10%',
  '--popover-foreground': '210 40% 98%',
  '--primary': '217 91% 60%',
  '--primary-foreground': '222 47% 11%',
  '--secondary': '217 33% 17%',
  '--secondary-foreground': '210 40% 98%',
  '--muted': '217 33% 17%',
  '--muted-foreground': '215 20% 65%',
  '--accent': '217 33% 17%',
  '--accent-foreground': '210 40% 98%',
  '--destructive': '0 63% 50%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '217 33% 20%',
  '--input': '217 33% 20%',
  '--ring': '217 91% 60%',
  '--income': '142 71% 55%',
  '--expense': '0 72% 60%',
  '--category-1': '217 91% 60%',
  '--category-2': '142 71% 55%',
  '--category-3': '43 96% 56%',
  '--category-4': '263 85% 65%',
  '--category-5': '199 89% 60%',
  '--category-6': '330 81% 65%',
  '--category-7': '234 89% 74%',
  '--category-8': '172 66% 50%',
}

const appSourceFiles = [
  'src/app',
  'src/components',
  'src/features',
  'src/pages',
  'src/App.tsx',
  'src/main.tsx',
].flatMap(collectSourceFiles)

const forbiddenColorPatterns = [
  /#[0-9a-fA-F]{3,8}\b/g,
  /\b(?:rgba?|hsla?)\(\s*[\d.]/g,
  /(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?\b/g,
]

describe('tokens de tema no globals.css (AC-002)', () => {
  it('define todas as variáveis do tema claro em :root', () => {
    expect(cssVarsBySelector.get(':root')).toEqual(expectedLightVars)
  })

  it('define todas as variáveis do tema escuro em .dark', () => {
    expect(cssVarsBySelector.get('.dark')).toEqual(expectedDarkVars)
  })

  it('aplica tokens semânticos como padrão do body', () => {
    const applyParams: string[] = []
    globalsRoot.walkRules('body', (rule) => {
      rule.walkAtRules('apply', (atRule) => {
        applyParams.push(...atRule.params.split(/\s+/))
      })
    })

    expect(applyParams).toEqual(
      expect.arrayContaining(['bg-background', 'text-foreground', 'font-sans']),
    )
  })

  it('não usa cores fixas nos componentes, apenas tokens', () => {
    const violations: string[] = []

    for (const file of appSourceFiles) {
      const content = readFileSync(file, 'utf8')
      for (const pattern of forbiddenColorPatterns) {
        for (const match of content.matchAll(pattern)) {
          violations.push(`${relative(process.cwd(), file)}: ${match[0]}`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})

const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
const headContent = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? ''
const inlineScripts = [
  ...headContent.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
].map((match) => match[1])
const antiFoucScript = inlineScripts.find((script) =>
  script.includes('financas-theme'),
)
const moduleScriptIndex = html.indexOf('type="module"')

const runAntiFouc = () => {
  if (!antiFoucScript) {
    throw new Error('script anti-FOUC não encontrado no index.html')
  }
  new Function(antiFoucScript)()
}

const stubPrefersDark = (matches: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }))
}

describe('script anti-FOUC no index.html (AC-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('dark')
  })

  it('fica no <head> antes do bundle do app', () => {
    expect(antiFoucScript).toBeDefined()
    expect(moduleScriptIndex).toBeGreaterThan(-1)
    expect(html.indexOf(antiFoucScript as string)).toBeLessThan(
      moduleScriptIndex,
    )
  })

  it('aplica dark quando o tema salvo é dark', () => {
    localStorage.setItem('financas-theme', 'dark')
    stubPrefersDark(false)

    runAntiFouc()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('não aplica dark quando o tema salvo é light', () => {
    localStorage.setItem('financas-theme', 'light')
    stubPrefersDark(true)

    runAntiFouc()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('segue prefers-color-scheme quando o tema é system', () => {
    localStorage.setItem('financas-theme', 'system')
    stubPrefersDark(true)

    runAntiFouc()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('usa system como padrão quando não há tema salvo', () => {
    stubPrefersDark(true)

    runAntiFouc()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('trata valor inválido como system', () => {
    localStorage.setItem('financas-theme', 'solar')
    stubPrefersDark(true)

    runAntiFouc()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

describe('documentação do tema no README (T-008)', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')

  it('explica os modos, a persistência e o anti-FOUC', () => {
    expect(readme).toContain('## Tema claro/escuro')
    expect(readme).toContain('financas-theme')
    expect(readme).toContain('ThemeToggle')
    expect(readme).toContain('FOUC')
  })

  it('orienta o uso exclusivo de tokens semânticos', () => {
    expect(readme).toContain('tokens semânticos')
    expect(readme).toContain('bg-background')
    expect(readme).toContain('text-foreground')
  })
})
