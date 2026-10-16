export type TransactionKind = 'income' | 'expense'
export type TransactionFilters = {
	q: string
	kind: TransactionKind | 'all'
	categoryId?: string
	month: string | 'all'
	page: number
}
