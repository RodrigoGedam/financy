import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { categoryColors, categoryIcons, isCategoryColor, isCategoryIcon } from './category-options'

it('catálogo frontend tem exatamente as chaves documentadas e permitidas pela migration', () => {
  const design = readFileSync('DESIGN.md', 'utf8')
  const sql = readFileSync('supabase/migrations/20261015182208_financy_core.sql', 'utf8')
  const documented = (section: string) => [...section.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1])
  const sqlKeys = (field: string) => [...(sql.match(new RegExp(`${field} in \\(([^)]+)\\)`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map(match => match[1])
  expect(Object.keys(categoryColors)).toEqual(documented(design.split('### Catálogo fechado de cores')[1].split('### Catálogo fechado de ícones')[0]))
  expect(Object.keys(categoryIcons)).toEqual(documented(design.split('### Catálogo fechado de ícones')[1].split('### Contrato para SQL')[0]))
  expect(Object.keys(categoryColors)).toEqual(sqlKeys('color'))
  expect(Object.keys(categoryIcons)).toEqual(sqlKeys('icon'))
  for (const [key, color] of Object.entries(categoryColors)) {
    const row = design.split('\n').find(line => line.startsWith(`| \`${key}\` |`))
    for (const token of [color.base, color.dark, color.light]) expect(row).toContain(token)
  }
  for (const value of ['gray', 'Green', '#16A34A', '', 'toString', '__proto__']) expect(isCategoryColor(value)).toBe(false)
  for (const value of ['plus', 'House', '', 'toString', '__proto__']) expect(isCategoryIcon(value)).toBe(false)
})
