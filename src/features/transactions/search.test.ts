import {
	defaultParseSearch,
	defaultStringifySearch,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import {
	clearTransactionFilters,
	pageIndexToPage,
	pageToPageIndex,
	parseTransactionSearch,
	updateTransactionFilters,
} from './search'

const id = '14ffc3a8-6cde-4172-9c66-4f170edbba91'
const defaults = {
	q: '',
	kind: 'all',
	categoryId: undefined,
	month: 'all',
	page: 1,
}

describe('parseTransactionSearch', () => {
	it('entrada direta e limpeza começam em todos os meses e na primeira página', () => {
		expect(parseTransactionSearch({})).toEqual(defaults)
		expect(clearTransactionFilters()).toEqual(defaults)
	})
	it('normaliza filtros combinados sem transformar curingas ou acentos', () => {
		expect(
			parseTransactionSearch({
				q: '  Café  50%_  ',
				kind: 'expense',
				categoryId: id.toUpperCase(),
				month: '2026-10',
				page: '002',
			}),
		).toEqual({
			q: 'Café  50%_',
			kind: 'expense',
			categoryId: id,
			month: '2026-10',
			page: 2,
		})
	})
	it.each([
		0,
		-1,
		1.5,
		Infinity,
		NaN,
		'Infinity',
		'NaN',
		'2.5',
		'-2',
		'',
		[],
		{},
		null,
		'9007199254740992',
	])('página inválida %j retorna 1', (page) => {
		expect(parseTransactionSearch({ page }).page).toBe(1)
	})
	it.each([1, 2, ' 3 ', '0004', Number.MAX_SAFE_INTEGER])(
		'aceita página inteira segura %s',
		(page) => {
			expect(parseTransactionSearch({ page }).page).toBe(Number(page))
		},
	)
	it('ignora objetos/arrays e opções inválidas sem coercão de objetos', () => {
		expect(
			parseTransactionSearch({
				q: {},
				kind: 'Income',
				categoryId: 'not-a-uuid',
				month: '2026-13',
				page: [],
			}),
		).toEqual(defaults)
		expect(
			parseTransactionSearch({
				q: ['café'],
				kind: ['expense'],
				categoryId: [id],
				month: ['2026-10'],
			}),
		).toEqual(defaults)
		expect(
			parseTransactionSearch({
				q: {
					toString: () => {
						throw new Error('Não converter objetos')
					},
				},
			}).q,
		).toBe('')
	})
	it('preserva mês vindo do dashboard, sem assumir o mês atual', () => {
		expect(parseTransactionSearch({ month: '2026-10' })).toEqual({
			...defaults,
			month: '2026-10',
		})
		expect(parseTransactionSearch({ month: 'all' }).month).toBe('all')
	})
	it('trata os primitivos produzidos pelo parser real do TanStack Router', () => {
		expect(
			parseTransactionSearch(
				defaultParseSearch('?q=123&page=2&month=2026-10'),
			).q,
		).toBe('123')
		expect(parseTransactionSearch(defaultParseSearch('?q=true')).q).toBe(
			'true',
		)
		const filters = {
			q: '00123',
			kind: 'income',
			categoryId: id,
			month: '2026-12',
			page: 4,
		}
		expect(
			parseTransactionSearch(
				defaultParseSearch(defaultStringifySearch(filters)),
			),
		).toEqual(filters)
	})
})

describe('filtros e paginação', () => {
	const current = {
		q: 'café',
		kind: 'expense' as const,
		categoryId: id,
		month: '2026-10',
		page: 8,
	}
	it.each([
		{ q: 'mercado' },
		{ kind: 'income' as const },
		{ categoryId: undefined },
		{ month: 'all' },
	])('mudar filtro %j volta à página 1 e mantém os demais', (patch) => {
		expect(updateTransactionFilters(current, patch)).toEqual({
			...current,
			...patch,
			page: 1,
		})
		expect(current.page).toBe(8)
	})
	it.each([1, 2, 100, Number.MAX_SAFE_INTEGER])(
		'adapta página %s para índice e volta sem deslocamento',
		(page) => {
			expect(pageToPageIndex(page)).toBe(page - 1)
			expect(pageIndexToPage(pageToPageIndex(page))).toBe(page)
		},
	)
	it.each([-1, Infinity, NaN, 0.5, Number.MAX_SAFE_INTEGER])(
		'índice inválido %s usa página 1',
		(index) => {
			expect(pageIndexToPage(index)).toBe(1)
		},
	)
	it('página inválida usa índice zero', () => {
		for (const page of [0, -1, NaN, Infinity, 1.5])
			expect(pageToPageIndex(page)).toBe(0)
	})
})
