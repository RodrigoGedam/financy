import { supabase } from '../../lib/supabase'
import { formatDateBr, monthBounds } from '../../lib/dates'
import { normalizeDecimal } from '../../lib/money'
import { isCategoryColor, isCategoryIcon } from '../../config/category-options'
import type { Category } from '../categories/types'
import type { Transaction } from '../transactions/types'
import type { DashboardSummary } from './types'

const invalid = () =>
	new Error(
		'Resposta do dashboard inválida. Atualize os dados e tente novamente.',
	)
function record(value: unknown): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value))
		throw invalid()
	return value as Record<string, unknown>
}
function text(value: unknown): string {
	if (typeof value !== 'string' || !value.trim()) throw invalid()
	return value
}
function amount(value: unknown, positive = false, signed = false): string {
	if (typeof value !== 'string') throw invalid()
	const result = normalizeDecimal(value)
	if (
		!result ||
		(!signed && result.startsWith('-')) ||
		(positive && result === '0.00')
	)
		throw invalid()
	return result
}
function category(value: unknown): Category {
	const r = record(value)
	if (
		typeof r.color !== 'string' ||
		typeof r.icon !== 'string' ||
		!isCategoryColor(r.color) ||
		!isCategoryIcon(r.icon)
	)
		throw invalid()
	return { id: text(r.id), name: text(r.name), color: r.color, icon: r.icon }
}
function limitedList(value: unknown): unknown[] {
	if (!Array.isArray(value) || value.length > 5) throw invalid()
	return value
}
function transaction(value: unknown): Transaction {
	const r = record(value)
	if (r.kind !== 'income' && r.kind !== 'expense') throw invalid()
	const occurred_on = text(r.occurred_on)
	try {
		formatDateBr(occurred_on)
	} catch {
		throw invalid()
	}
	const linked = category(r.category)
	const category_id = text(r.category_id)
	if (linked.id !== category_id) throw invalid()
	return {
		id: text(r.id),
		description: text(r.description),
		kind: r.kind,
		amount: amount(r.amount, true),
		occurred_on,
		created_at: text(r.created_at),
		category_id,
		category: linked,
	}
}
export function parseDashboard(value: unknown): DashboardSummary {
	const r = record(value)
	return {
		balance: amount(r.balance, false, true),
		income: amount(r.income),
		expenses: amount(r.expenses),
		topCategories: limitedList(r.topCategories).map((value) => {
			const row = record(value)
			if (
				typeof row.transaction_count !== 'number' ||
				!Number.isSafeInteger(row.transaction_count) ||
				row.transaction_count < 1
			)
				throw invalid()
			return {
				...category(row),
				amount: amount(row.amount, true),
				transaction_count: row.transaction_count,
			}
		}),
		recentTransactions: limitedList(r.recentTransactions).map(transaction),
	}
}
export async function getDashboard(
	month: string,
	signal?: AbortSignal,
): Promise<DashboardSummary> {
	const { start } = monthBounds(month)
	let query = supabase.rpc('get_dashboard', { p_month: start })
	if (signal) query = query.abortSignal(signal)
	const { data, error } = await query
	if (error)
		throw new Error(
			'Não foi possível carregar o dashboard. Verifique a conexão e tente novamente.',
		)
	return parseDashboard(data)
}
