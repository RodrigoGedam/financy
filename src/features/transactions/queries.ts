import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/auth-context'
import {
	createTransaction,
	deleteTransaction,
	listTransactions,
	updateTransaction,
} from './api'
import type { Transaction, TransactionFilters, TransactionInput } from './types'

export function useTransactions(filters: TransactionFilters) {
	const { session } = useAuth()
	return useQuery({
		queryKey: ['finance', session?.user.id, 'transactions', filters],
		enabled: Boolean(session),
		queryFn: ({ signal }) => listTransactions(filters, signal),
	})
}
export function useTransactionMutations() {
	const { session } = useAuth()
	const client = useQueryClient()
	const userId = session?.user.id
	const onSuccess = () =>
		client.invalidateQueries({ queryKey: ['finance', userId] })
	return {
		create: useMutation({ mutationFn: createTransaction, onSuccess }),
		update: useMutation({
			mutationFn: ({
				original,
				value,
			}: {
				original: Transaction
				value: TransactionInput
			}) => updateTransaction(original, value),
			onSuccess,
		}),
		remove: useMutation({ mutationFn: deleteTransaction, onSuccess }),
	}
}
