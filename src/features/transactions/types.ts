export type TransactionKind = 'income' | 'expense'
export type TransactionFilters = {
	q: string
	kind: TransactionKind | 'all'
	categoryId?: string
	month: string | 'all'
	page: number
}
import type { Category } from '../categories/types'

export type TransactionInput = {
	description: string
	kind: TransactionKind
	amount: string
	occurred_on: string
	category_id: string
}
export type Transaction = TransactionInput & {
	id: string
	created_at: string
	category: Category
}
export type TransactionPage = {
	rows: Transaction[]
	count: number
	page: number
}
