import { expect, it } from 'vitest'
import { getCategoryOverview } from './summary'
import type { CategorySummary } from './types'

const category = (transaction_count: number, id = 'a'): CategorySummary => ({
	id,
	name: id,
	description: null,
	color: 'green',
	icon: 'utensils',
	transaction_count,
})
it('summarizes complete history and keeps stable order on ties', () => {
	expect(getCategoryOverview([])).toEqual({
		categoryCount: 0,
		transactionCount: 0,
		mostUsed: null,
	})
	const rows = [
		category(12),
		category(2, 'b'),
		category(1, 'c'),
		category(3, 'd'),
	]
	expect(getCategoryOverview(rows)).toEqual({
		categoryCount: 4,
		transactionCount: 18,
		mostUsed: rows[0],
	})
	expect(getCategoryOverview([category(0)]).mostUsed).toBeNull()
	expect(
		getCategoryOverview([category(2, 'first'), category(2, 'second')])
			.mostUsed?.id,
	).toBe('first')
})
it('refuses unsafe or invalid counts', () => {
	for (const rows of [
		[category(Number.MAX_SAFE_INTEGER), category(1)],
		[category(-1)],
		[category(1.5)],
	]) {
		expect(() => getCategoryOverview(rows)).toThrow('Contagem')
	}
})
