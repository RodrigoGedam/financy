import { expect, it } from 'vitest'
import { parseDashboard } from './api'
const empty = {
	balance: '-0.01',
	income: '9007199254740993.01',
	expenses: '0.00',
	topCategories: [],
	recentTransactions: [],
}
it('preserves nullable descriptions in both JSON paths and legacy titles', () => {
	const category = {
		id: 'cat',
		name: 'x'.repeat(80),
		description: 'Descrição opcional integral acima de vinte',
		color: 'green',
		icon: 'house',
	}
	const tx = {
		id: 'tx',
		description: 'y'.repeat(80),
		kind: 'expense',
		amount: '9007199254740993.01',
		occurred_on: '2024-01-01',
		created_at: '2024-01-01T00:00:00Z',
		category_id: 'cat',
		category,
	}
	for (const description of [null, category.description]) {
		const linked = { ...category, description }
		const result = parseDashboard({
			...empty,
			topCategories: [
				{ ...linked, amount: '1.00', transaction_count: 1 },
			],
			recentTransactions: [{ ...tx, category: linked }],
		})
		expect(result.topCategories[0].description).toBe(description)
		expect(result.recentTransactions[0].category).toEqual(linked)
		expect(result.recentTransactions[0].description).toBe(tx.description)
		expect(result.recentTransactions[0].amount).toBe(tx.amount)
	}
	for (const description of [undefined, 3, {}]) {
		expect(() =>
			parseDashboard({
				...empty,
				topCategories: [
					{
						...category,
						description,
						amount: '1.00',
						transaction_count: 1,
					},
				],
			}),
		).toThrow()
		expect(() =>
			parseDashboard({
				...empty,
				recentTransactions: [
					{ ...tx, category: { ...category, description } },
				],
			}),
		).toThrow()
	}
})
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
		description: null,
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
