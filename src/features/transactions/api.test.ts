import { expect, it } from 'vitest'
import { escapeDescriptionSearch, validateTransactionInput } from './api'

it('escapa curingas sem modificar texto literal', () => {
	expect(escapeDescriptionSearch('a%_\\*')).toBe('a%_\\\\\\*')
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
