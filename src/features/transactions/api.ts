import { supabase } from '../../lib/supabase'
import { formatDateBr, monthBounds, todayInSaoPaulo } from '../../lib/dates'
import { normalizeDecimal } from '../../lib/money'
import { isCategoryColor, isCategoryIcon } from '../../config/category-options'
import type {
	Transaction,
	TransactionFilters,
	TransactionInput,
	TransactionPage,
} from './types'

// imatch evita o alias '*' de ILIKE do PostgREST. Escapar todos os metacaracteres
// produz uma expressão literal; % e _ já são literais neste operador.
export const escapeDescriptionSearch = (text: string) =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export function validateTransactionInput(
	value: TransactionInput,
): TransactionInput {
	const amount = normalizeDecimal(value.amount)
	if (!amount || amount === '0.00' || amount.startsWith('-'))
		throw new Error(
			'Informe um valor positivo com até duas casas decimais.',
		)
	try {
		formatDateBr(value.occurred_on)
	} catch {
		throw new Error('Informe uma data válida.')
	}
	if (value.occurred_on > todayInSaoPaulo())
		throw new Error('A data não pode ser futura.')
	if (!value.description.trim()) throw new Error('Informe a descrição.')
	if (!['income', 'expense'].includes(value.kind))
		throw new Error('Selecione o tipo.')
	if (!value.category_id) throw new Error('Selecione uma categoria.')
	return { ...value, amount, description: value.description.trim() }
}
function failure(error: { code?: string }): Error {
	if (error.code === 'P0002' || error.code === 'P0001')
		return new Error(
			'Transação removida ou alterada em outro contexto. Feche este diálogo e atualize a lista antes de tentar novamente.',
		)
	if (error.code === '23503')
		return new Error(
			'Categoria indisponível. Atualize a lista e selecione outra categoria.',
		)
	if (error.code === '23514' || error.code === '22007')
		return new Error('Confira o valor, a data e os campos obrigatórios.')
	return new Error(
		'Não foi possível concluir a operação. Verifique a conexão e tente novamente.',
	)
}
export async function listTransactions(
	filters: TransactionFilters,
	signal?: AbortSignal,
): Promise<TransactionPage> {
	// Contagem antes do intervalo permite normalizar inclusive páginas maiores que um offset seguro.
	const filtered = () => {
		let q = supabase
			.from('transactions')
			.select(
				'id,description,kind,amount::text,occurred_on,category_id,created_at,categories(id,name,color,icon)',
				{ count: 'exact' },
			)
		if (filters.q)
			q = q.filter(
				'description',
				'imatch',
				escapeDescriptionSearch(filters.q),
			)
		if (filters.kind !== 'all') q = q.eq('kind', filters.kind)
		if (filters.categoryId) q = q.eq('category_id', filters.categoryId)
		if (filters.month !== 'all') {
			const bounds = monthBounds(filters.month)
			q = q
				.gte('occurred_on', bounds.start)
				.lt('occurred_on', bounds.endExclusive)
		}
		return signal ? q.abortSignal(signal) : q
	}
	const countResult = await filtered().limit(0)
	if (countResult.error) throw failure(countResult.error)
	const count = countResult.count ?? 0
	if (!Number.isSafeInteger(count) || count < 0)
		throw new Error('Contagem inválida.')
	const page = Math.min(filters.page, Math.max(1, Math.ceil(count / 10)))
	const start = (page - 1) * 10
	const {
		data,
		error,
		count: currentCount,
	} = await filtered()
		.order('occurred_on', { ascending: false })
		.order('created_at', { ascending: false })
		.order('id', { ascending: false })
		.range(start, start + 9)
	if (error) throw failure(error)
	const total = currentCount ?? count
	const currentPage = Math.min(page, Math.max(1, Math.ceil(total / 10)))
	if (currentPage !== page)
		return listTransactions({ ...filters, page: currentPage }, signal)
	const rows = data.map((row): Transaction => {
		const category = row.categories
		const amount = normalizeDecimal(row.amount)
		if (
			!category ||
			!isCategoryColor(category.color) ||
			!isCategoryIcon(category.icon) ||
			!amount ||
			(row.kind !== 'income' && row.kind !== 'expense')
		)
			throw new Error('Resposta financeira inválida. Atualize a lista.')
		return {
			id: row.id,
			description: row.description,
			kind: row.kind,
			amount,
			occurred_on: row.occurred_on,
			category_id: row.category_id,
			created_at: row.created_at,
			category: {
				...category,
				color: category.color,
				icon: category.icon,
			},
		}
	})
	return { rows, count: total, page }
}
export async function createTransaction(
	value: TransactionInput,
): Promise<void> {
	const v = validateTransactionInput(value)
	const { error } = await supabase.rpc('save_transaction', {
		p_description: v.description,
		p_kind: v.kind,
		p_amount: v.amount,
		p_occurred_on: v.occurred_on,
		p_category_id: v.category_id,
	})
	if (error) throw failure(error)
}
function snapshot(row: Transaction) {
	return {
		description: row.description,
		kind: row.kind,
		amount: row.amount,
		occurred_on: row.occurred_on,
		category_id: row.category_id,
	}
}
export async function updateTransaction(
	original: Transaction,
	value: TransactionInput,
): Promise<void> {
	const v = validateTransactionInput(value)
	const { error } = await supabase.rpc('change_transaction', {
		p_id: original.id,
		p_expected: snapshot(original),
		p_description: v.description,
		p_kind: v.kind,
		p_amount: v.amount,
		p_occurred_on: v.occurred_on,
		p_category_id: v.category_id,
	})
	if (error) throw failure(error)
}
export async function deleteTransaction(original: Transaction): Promise<void> {
	const { error } = await supabase.rpc('change_transaction', {
		p_id: original.id,
		p_expected: snapshot(original),
		p_delete: true,
	})
	if (error) throw failure(error)
}
