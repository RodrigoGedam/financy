import { expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }))
vi.mock('../../lib/supabase', () => ({ supabase: mock }))
import { escapeDescriptionSearch, validateTransactionInput, updateTransaction, listTransactions } from './api'
import { parseTransactionSearch } from './search'
import type { Transaction } from './types'
import { createTransaction } from './api'

it('escapa curingas sem modificar texto literal', () => {
	expect(escapeDescriptionSearch('a%_\\*')).toBe('a%_\\\\\\*')
})
it('corrects legacy title without changing the concurrent snapshot or money', async () => {
  const original: Transaction = { id: 'tx', description: 'x'.repeat(80), kind: 'expense', amount: '9007199254740993.01', occurred_on: '2024-01-01', created_at: '2024-01-01T00:00:00Z', category_id: 'cat', category: { id: 'cat', name: 'Legacy'.repeat(10), description: null, color: 'green', icon: 'house' } }
  mock.rpc.mockResolvedValue({ error: null })
  await expect(updateTransaction(original, original)).rejects.toThrow('20')
  expect(mock.rpc).not.toHaveBeenCalled()
  await updateTransaction(original, { ...original, description: ' Corrigida ' })
  expect(mock.rpc).toHaveBeenCalledWith('change_transaction', expect.objectContaining({ p_description: 'Corrigida', p_amount: original.amount, p_expected: { description: original.description, amount: original.amount, kind: original.kind, occurred_on: original.occurred_on, category_id: original.category_id } }))
  expect(original.description).toBe('x'.repeat(80))
})

it('reads legacy titles and optional category description without constraining reads', async () => {
  const linked = { id: 'cat', name: 'Categoria'.repeat(10), description: 'Descrição integral acima de vinte caracteres', color: 'green', icon: 'house' }
  const row = { id: 'tx', description: 'x'.repeat(80), kind: 'income', amount: '9007199254740993.01', occurred_on: '2024-01-01', created_at: '2024-01-01T00:00:00Z', category_id: 'cat', categories: linked }
  const q: Record<string, ReturnType<typeof vi.fn>> = {}
  for (const key of ['select', 'limit', 'order', 'range']) q[key] = vi.fn(() => q)
  q.then = vi.fn(resolve => Promise.resolve({ data: [row], error: null, count: 1 }).then(resolve))
  mock.from.mockReturnValue(q)
  const result = await listTransactions(parseTransactionSearch({}))
  expect(result.rows[0]).toMatchObject({ description: row.description, amount: row.amount, category: linked })
  expect(q.select).toHaveBeenCalledWith(expect.stringContaining('categories(id,name,description,color,icon)'), { count: 'exact' })
  row.categories.description = null as unknown as string
  expect((await listTransactions(parseTransactionSearch({}))).rows[0].category.description).toBeNull()
  row.categories.description = 42 as unknown as string
  await expect(listTransactions(parseTransactionSearch({}))).rejects.toThrow('Resposta financeira inválida')
})
it('valida dinheiro textual, calendário, tipo e categoria', () => {
	const input = {
		description: '  Almoço  ',
		kind: 'expense' as const,
		amount: '9007199254740993.01',
		occurred_on: '2024-02-29',
		category_id: 'abc',
	}
	expect(validateTransactionInput(input).description).toBe('Almoço')
	expect(validateTransactionInput(input).amount).toBe('9007199254740993.01')
	for (const amount of ['0', '-1', '1.001', '1e2', 'NaN'])
		expect(() => validateTransactionInput({ ...input, amount })).toThrow()
	for (const occurred_on of ['2023-02-29', '9999-01-01', ''])
		expect(() =>
			validateTransactionInput({ ...input, occurred_on }),
		).toThrow()
	expect(() =>
		validateTransactionInput({ ...input, category_id: '' }),
	).toThrow()
})
it('does not misclassify an unidentified CHECK as only a title error', async () => {
  mock.rpc.mockResolvedValue({ error: { code: '23514' } })
  const value = { description: 'Almoço', kind: 'expense' as const, amount: '1.00', occurred_on: '2024-01-01', category_id: 'cat' }
  await expect(createTransaction(value)).rejects.toThrow('20')
  await expect(createTransaction(value)).rejects.toThrow('valor')
})
