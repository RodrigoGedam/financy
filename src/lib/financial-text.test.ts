import { describe, expect, it } from 'vitest'
import { countTitleCharacters, normalizeFinancialTitle } from './financial-text'

describe.each(['category', 'transaction'] as const)('%s title', field => {
  it.each([19, 20])('accepts %i code points', length => {
    expect(normalizeFinancialTitle('😀'.repeat(length), field)).toBe('😀'.repeat(length))
  })
  it.each(['x'.repeat(21), '😀'.repeat(21), '', ' \t\u00a0\ufeff'])('rejects invalid title %j', value => {
    expect(() => normalizeFinancialTitle(value, field)).toThrow()
  })
  it('trims only external whitespace without normalizing accents', () => {
    expect(normalizeFinancialTitle('\u00a0\ufeff\t e\u0301  café \r\n', field)).toBe('e\u0301  café')
  })
})
it('counts code points after ECMAScript trim, not UTF16 or graphemes', () => {
  expect(countTitleCharacters(' é ')).toBe(1)
  expect(countTitleCharacters('e\u0301')).toBe(2)
  expect(countTitleCharacters('👨‍👩‍👧‍👦')).toBe(7)
  expect(countTitleCharacters('\u1680\u2000😀\u202f\u205f\u3000')).toBe(1)
})
