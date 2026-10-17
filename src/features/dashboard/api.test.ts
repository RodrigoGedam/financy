import { expect, it } from 'vitest'
import { parseDashboard } from './api'
const empty = {
	balance: '-0.01',
	income: '9007199254740993.01',
	expenses: '0.00',
	topCategories: [],
	recentTransactions: [],
}
it('preserva decimal textual grande e saldo negativo, normaliza centavos sem arredondar', () => {
	expect(parseDashboard(empty)).toEqual(empty)
	expect(
		parseDashboard({ ...empty, income: '1', expenses: '1.2' }),
	).toMatchObject({ income: '1.00', expenses: '1.20' })
})
it('recusa dinheiro numérico ou inválido, resposta truncada e catálogo desconhecido', () => {
	for (const income of [9007199254740992, '1.001', 'NaN', '-0.01'])
		expect(() => parseDashboard({ ...empty, income })).toThrow()
	expect(() => parseDashboard(null)).toThrow()
	expect(() => parseDashboard({ ...empty, recentTransactions: {} })).toThrow()
	const category = {
		id: 'abc',
		name: 'Casa',
		color: 'green',
		icon: 'house',
		amount: '1.00',
		transaction_count: 1005,
	}
	expect(
		parseDashboard({ ...empty, topCategories: [category] }).topCategories[0]
			.transaction_count,
	).toBe(1005)
	for (const patch of [
		{ color: 'arbitrary' },
		{ icon: 'unknown' },
		{ transaction_count: 1.2 },
		{ amount: '0.00' },
	])
		expect(() =>
			parseDashboard({
				...empty,
				topCategories: [{ ...category, ...patch }],
			}),
		).toThrow()
	expect(() =>
		parseDashboard({
			...empty,
			topCategories: Array.from({ length: 6 }, () => category),
		}),
	).toThrow()
})
