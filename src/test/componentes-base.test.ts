import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson

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
  it.each(runtimeDependencies)(
    'declara %s em dependencies',
    (dependency) => {
      expect(packageJson.dependencies?.[dependency]).toBeDefined()
    },
  )

  it.each(buildDependencies)(
    'declara %s em devDependencies (uso apenas em build)',
    (dependency) => {
      expect(packageJson.devDependencies?.[dependency]).toBeDefined()
    },
  )
})
