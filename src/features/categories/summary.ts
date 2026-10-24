import type { CategorySummary } from './types'

export function getCategoryOverview(categories: readonly CategorySummary[]): {
	categoryCount: number
	transactionCount: number
	mostUsed: CategorySummary | null
} {
	let transactionCount = 0
	let mostUsed: CategorySummary | null = null
	for (const category of categories) {
		const count = category.transaction_count
		transactionCount += count
		if (
			!Number.isSafeInteger(count) ||
			count < 0 ||
			!Number.isSafeInteger(transactionCount)
		)
			throw new Error('Contagem de transações inválida. Tente novamente.')
		if (count > (mostUsed?.transaction_count ?? 0)) mostUsed = category
	}
	return { categoryCount: categories.length, transactionCount, mostUsed }
}
