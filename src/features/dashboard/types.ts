import type { Category } from '../categories/types'
import type { Transaction } from '../transactions/types'

export type DashboardSummary = {
	balance: string
	income: string
	expenses: string
	topCategories: (Category & { amount: string; transaction_count: number })[]
	recentTransactions: Transaction[]
}
