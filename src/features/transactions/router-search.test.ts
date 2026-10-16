import { expect, it } from 'vitest'
import { parseAppSearch, stringifyAppSearch } from './router-search'
it('preserva descrição numérica grande na URL direta e no round-trip do Router', () => {
	expect(parseAppSearch('?q=9007199254740993.01').q).toBe(
		'9007199254740993.01',
	)
	for (const q of ['9007199254740993.01', 'true', 'Almoço %_*', '"texto"'])
		expect(parseAppSearch(stringifyAppSearch({ q })).q).toBe(q)
	expect(parseAppSearch('?q=%22texto%22').q).toBe('"texto"')
})
