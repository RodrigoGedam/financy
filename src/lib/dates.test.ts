import { describe, expect, it } from 'vitest'
import {
	formatDateBr,
	isValidMonth,
	monthBounds,
	todayInSaoPaulo,
} from './dates'

describe('hoje em São Paulo', () => {
	it.each([
		['2026-10-15T01:30:00Z', '2026-10-14'],
		['2026-10-15T03:00:00Z', '2026-10-15'],
		['2027-01-01T01:30:00Z', '2026-12-31'],
		['2024-03-01T01:30:00Z', '2024-02-29'],
	])('considera o instante %s', (instant, day) => {
		expect(todayInSaoPaulo(new Date(instant))).toBe(day)
	})
	it('recusa um instante inválido', () => {
		expect(() => todayInSaoPaulo(new Date('inválido'))).toThrow(RangeError)
	})
	it('não apresenta um ano anterior à era comum como ano positivo', () => {
		expect(() => todayInSaoPaulo(new Date('0000-10-15T12:00:00Z'))).toThrow(
			RangeError,
		)
	})
})

describe('mês civil e intervalo semiaberto', () => {
	it.each([
		['2026-12', '2026-12-01', '2027-01-01'],
		['2024-02', '2024-02-01', '2024-03-01'],
		['0001-01', '0001-01-01', '0001-02-01'],
		['9999-12', '9999-12-01', '10000-01-01'],
	])('delimita %s', (month, start, endExclusive) => {
		expect(isValidMonth(month)).toBe(true)
		expect(monthBounds(month)).toEqual({ start, endExclusive })
	})
	it.each([
		'all',
		'',
		'2026-00',
		'2026-13',
		'2026-2',
		'0000-01',
		'10000-01',
		'2026-01-01',
		'2026-01\n',
	])('recusa mês inválido %s', (month) => {
		expect(isValidMonth(month)).toBe(false)
		expect(() => monthBounds(month)).toThrow(RangeError)
	})
})

describe('formatDateBr', () => {
	it.each([
		['2026-10-14', '14/10/2026'],
		['2024-02-29', '29/02/2024'],
		['2000-02-29', '29/02/2000'],
		['0001-01-01', '01/01/0001'],
		['9999-12-31', '31/12/9999'],
	])('exibe o calendário de %s sem converter fuso', (input, expected) => {
		expect(formatDateBr(input)).toBe(expected)
	})
	it.each([
		'2025-02-29',
		'1900-02-29',
		'2100-02-29',
		'2024-02-30',
		'2026-04-31',
		'2026-00-10',
		'2026-13-01',
		'2026-01-00',
		'2026-01-32',
		'0000-01-01',
		'2026-1-1',
		'2026-10-14T00:00:00Z',
		' 2026-10-14',
		'2026-10-14\n',
		'',
	])('recusa data inexistente ou fora do contrato: %s', (input) => {
		expect(() => formatDateBr(input)).toThrow(RangeError)
	})
})
