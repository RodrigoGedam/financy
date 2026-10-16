import { afterAll, beforeAll, expect, it } from 'vitest'
import { supabase } from '../../src/lib/supabase'
import {
	createTransaction,
	deleteTransaction,
	listTransactions,
	updateTransaction,
} from '../../src/features/transactions/api'
import { parseTransactionSearch } from '../../src/features/transactions/search'
import {
	createCategory,
	listCategories,
	updateCategory,
} from '../../src/features/categories/api'
import {
	createTestClients,
	rows,
	rowId,
	categoryInput,
	transactionInput,
	type Fixtures,
} from '../fixtures/supabase'
import type { TransactionInput } from '../../src/features/transactions/types'

let f: Fixtures
let categoryId: string
beforeAll(async () => {
	f = await createTestClients()
	const session = (await f.alice.auth.getSession()).data.session
	if (!session) throw new Error('Sessão obrigatória')
	await supabase.auth.setSession(session)
	const category = await createCategory({
		name: 'Transações reais',
		color: 'blue',
		icon: 'house',
	})
	categoryId = category.id
	f.track(f.alice, 'categories', categoryId)
})
afterAll(async () => {
	if (f) {
		for (const row of rows(await f.request(f.alice, 'transactions')))
			f.track(f.alice, 'transactions', rowId(row))
		await supabase.auth.signOut({ scope: 'local' })
		await f.cleanup()
	}
})
const filters = (patch = {}) => parseTransactionSearch(patch)
const value = (patch: Partial<TransactionInput> = {}): TransactionInput => ({
	description: 'Transação',
	kind: 'expense',
	amount: '12.34',
	occurred_on: '2024-01-15',
	category_id: categoryId,
	...patch,
})

it('consulta remota: 12 linhas, desempate estável, mês, filtros combinados, busca literal e precisão', async () => {
	const batch = Array.from({ length: 12 }, (_, i) =>
		value({
			description: `Linha ${i}`,
			kind: i % 2 ? 'income' : 'expense',
			occurred_on:
				i === 0
					? '2023-12-31'
					: i === 11
						? '2024-02-01'
						: i === 1
							? '2024-01-01'
							: '2024-01-15',
			amount: i === 2 ? '9007199254740993.01' : '0.01',
		}),
	)
	expect(
		(await f.request(f.alice, 'transactions', 'POST', batch)).status,
	).toBe(201)
	const foreign = rowId(
		rows(
			await f.request(f.bob, 'categories', 'POST', categoryInput('Bob')),
		)[0],
	)
	await f.request(f.bob, 'transactions', 'POST', transactionInput(foreign))
	const first = await listTransactions(filters())
	const second = await listTransactions(filters({ page: 2 }))
	expect(first.count).toBe(12)
	expect(first.rows).toHaveLength(10)
	expect(second.rows).toHaveLength(2)
	expect(new Set([...first.rows, ...second.rows].map((r) => r.id)).size).toBe(
		12,
	)
	const expected = rows(await f.request(f.alice, 'transactions')).sort(
		(a, b) =>
			String(b.occurred_on).localeCompare(String(a.occurred_on)) ||
			String(b.created_at).localeCompare(String(a.created_at)) ||
			String(b.id).localeCompare(String(a.id)),
	)
	expect([...first.rows, ...second.rows].map((r) => r.id)).toEqual(
		expected.map(rowId),
	)
	expect((await listTransactions(filters({ month: '2024-01' }))).count).toBe(
		10,
	)
	expect(
		(
			await listTransactions(
				filters({
					month: '2024-01',
					kind: 'income',
					categoryId,
					q: 'Linha',
				}),
			)
		).count,
	).toBe(5)
	expect(
		(await listTransactions(filters({ page: Number.MAX_SAFE_INTEGER })))
			.page,
	).toBe(2)
	expect(
		[...first.rows, ...second.rows].find((r) => r.description === 'Linha 2')
			?.amount,
	).toBe('9007199254740993.01')
	for (const text of [
		'Almoço 100%',
		'Sinal_a',
		'Barra\\x',
		'Estrela*',
		'Vírgula,("x")',
	]) {
		await createTransaction(value({ description: text }))
		expect(
			(await listTransactions(filters({ q: text }))).rows.map(
				(r) => r.description,
			),
		).toEqual([text])
	}
	for (const q of ['%', '_', '\\', '*'])
		expect((await listTransactions(filters({ q }))).count).toBe(1)
	await createTransaction(
		value({ description: 'Escrita exata', amount: '9007199254740993.01' }),
	)
	expect(
		(await listTransactions(filters({ q: 'Escrita exata' }))).rows[0]
			.amount,
	).toBe('9007199254740993.01')
})
it('CRUD, categoria atual, contagens, conflitos atômicos e isolamento por RLS', async () => {
	await createTransaction(
		value({ description: 'Editar esta', amount: '1.20' }),
	)
	const original = (await listTransactions(filters({ q: 'Editar esta' })))
		.rows[0]
	const before = (await listCategories()).find(
		(c) => c.id === categoryId,
	)!.transaction_count
	await updateTransaction(
		original,
		value({
			description: 'Editada',
			kind: 'income',
			amount: '0.01',
			occurred_on: '2024-02-29',
		}),
	)
	await expect(
		updateTransaction(original, value({ description: 'Perda' })),
	).rejects.toThrow('alterada')
	await expect(deleteTransaction(original)).rejects.toThrow('alterada')
	let latest = (await listTransactions(filters({ q: 'Editada' }))).rows[0]
	expect(latest).toMatchObject({
		kind: 'income',
		amount: '0.01',
		occurred_on: '2024-02-29',
	})
	await updateCategory(categoryId, {
		name: 'Renomeada',
		color: 'pink',
		icon: 'gift',
	})
	latest = (await listTransactions(filters({ q: 'Editada' }))).rows[0]
	expect(latest.category).toMatchObject({
		name: 'Renomeada',
		color: 'pink',
		icon: 'gift',
	})
	const bobSession = (await f.bob.auth.getSession()).data.session!
	await supabase.auth.setSession(bobSession)
	await expect(deleteTransaction(latest)).rejects.toThrow('removida')
	await expect(updateTransaction(latest, value())).rejects.toThrow()
	expect((await listTransactions(filters({ q: 'Editada' }))).count).toBe(0)
	await supabase.auth.setSession(
		(await f.alice.auth.getSession()).data.session!,
	)
	expect((await listTransactions(filters({ q: 'Editada' }))).rows[0]).toEqual(
		latest,
	)
	await deleteTransaction(latest)
	await expect(deleteTransaction(latest)).rejects.toThrow('removida')
	expect(
		(await listCategories()).find((c) => c.id === categoryId)
			?.transaction_count,
	).toBe(before - 1)
})
it('duas edições simultâneas não perdem alterações; exclusão concorrente e anônimo são recusados', async () => {
	await createTransaction(value({ description: 'Corrida real' }))
	const original = (await listTransactions(filters({ q: 'Corrida real' })))
		.rows[0]
	const results = await Promise.allSettled([
		updateTransaction(original, value({ description: 'Vencedor A' })),
		updateTransaction(original, value({ description: 'Vencedor B' })),
	])
	expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
	expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1)
	const latest = (await listTransactions(filters({ q: 'Vencedor' }))).rows[0]
	expect(['Vencedor A', 'Vencedor B']).toContain(latest.description)
	expect(
		(
			await f.anon.rpc('change_transaction', {
				p_id: latest.id,
				p_expected: {},
				p_delete: true,
			})
		).error?.code,
	).toBe('42501')
	const deletes = await Promise.allSettled([
		deleteTransaction(latest),
		deleteTransaction(latest),
	])
	expect(deletes.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
	expect(deletes.filter((r) => r.status === 'rejected')).toHaveLength(1)
	expect((await listTransactions(filters({ q: 'Vencedor' }))).count).toBe(0)
})
