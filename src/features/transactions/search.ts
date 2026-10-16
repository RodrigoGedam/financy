import type { TransactionFilters } from './types'
import { isValidMonth } from '../../lib/dates'

export function parseTransactionSearch(
	raw: Record<string, unknown>,
): TransactionFilters {
	const q =
		typeof raw.q === 'string'
			? raw.q.trim()
			: (typeof raw.q === 'number' && Number.isFinite(raw.q)) ||
				  typeof raw.q === 'boolean'
				? String(raw.q)
				: ''
	const kind = typeof raw.kind === 'string' ? raw.kind.trim() : ''
	const categoryId =
		typeof raw.categoryId === 'string'
			? raw.categoryId.trim().toLowerCase()
			: ''
	const month = typeof raw.month === 'string' ? raw.month.trim() : ''
	const page =
		typeof raw.page === 'string' && /^[0-9]+$/.test(raw.page.trim())
			? Number(raw.page)
			: raw.page
	return {
		q,
		kind: kind === 'income' || kind === 'expense' ? kind : 'all',
		categoryId:
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
				categoryId,
			)
				? categoryId
				: undefined,
		month: isValidMonth(month) ? month : 'all',
		page:
			typeof page === 'number' && Number.isSafeInteger(page) && page > 0
				? page
				: 1,
	}
}

export function updateTransactionFilters(
	current: TransactionFilters,
	patch: Partial<Omit<TransactionFilters, 'page'>>,
): TransactionFilters {
	return parseTransactionSearch({ ...current, ...patch, page: 1 })
}

export function clearTransactionFilters(): TransactionFilters {
	return parseTransactionSearch({})
}

export function pageToPageIndex(page: number): number {
	return Number.isSafeInteger(page) && page > 0 ? page - 1 : 0
}

export function pageIndexToPage(pageIndex: number): number {
	return Number.isSafeInteger(pageIndex) &&
		pageIndex >= 0 &&
		pageIndex < Number.MAX_SAFE_INTEGER
		? pageIndex + 1
		: 1
}
