import { describe, expect, it } from 'vitest'
import { formatBrl, normalizeDecimal, parseAmountPtBr } from './money'

describe('parseAmountPtBr', () => {
	it.each([
		['1.234,56', '1234.56'],
		['1234,56', '1234.56'],
		['1.234', '1234.00'],
		['1234', '1234.00'],
		['1,2', '1.20'],
		['0,01', '0.01'],
		['  0001,20  ', '1.20'],
		['9.007.199.254.740.993,01', '9007199254740993.01'],
		['9007199254740993,01', '9007199254740993.01'],
		[
			'123456789012345678901234567890,99',
			'123456789012345678901234567890.99',
		],
	])('converte %s sem perder dígitos', (input, expected) => {
		expect(parseAmountPtBr(input)).toBe(expected)
	})

	it.each([
		'',
		' ',
		'0',
		'0,00',
		'000,0',
		'-1',
		'-0,01',
		'+1',
		'1,001',
		'1,000',
		'1.23,45',
		'12.34.567,89',
		'1234.567,89',
		'1..234,56',
		'0.123,45',
		'.123,45',
		'1.2345,67',
		'1,234.56',
		'1.23',
		'1e3',
		'1E+3',
		'0x10',
		'Infinity',
		'NaN',
		'R$ 1,00',
		'1 234,56',
		'1,',
		',50',
		'1\n2',
	])('recusa %s', (input) => {
		expect(parseAmountPtBr(input)).toBeNull()
	})
})

describe('decimal textual da API', () => {
	it.each([
		['1', '1.00'],
		['1.2', '1.20'],
		['0.01', '0.01'],
		['0001.20', '1.20'],
		['-0001.2', '-1.20'],
		['-0.00', '0.00'],
		['9007199254740993.01', '9007199254740993.01'],
	])('normaliza %s sem arredondar', (input, expected) => {
		expect(normalizeDecimal(input)).toBe(expected)
	})

	it.each([
		'',
		'NaN',
		'Infinity',
		'-Infinity',
		'1.001',
		'1.000',
		'1e3',
		'1,20',
		'1.',
		'.2',
		'+1',
		'--1',
	])('recusa resposta inválida %s', (input) => {
		expect(normalizeDecimal(input)).toBeNull()
		expect(() => formatBrl(input)).toThrow(RangeError)
	})
})

describe('formatBrl', () => {
	it.each([
		['0.10', 'R$ 0,10'],
		['0', 'R$ 0,00'],
		['-0.01', '-R$ 0,01'],
		['-0.00', 'R$ 0,00'],
		['1', 'R$ 1,00'],
		['1.2', 'R$ 1,20'],
		['1234.56', 'R$ 1.234,56'],
		['9007199254740993.01', 'R$ 9.007.199.254.740.993,01'],
		['-9007199254740993.01', '-R$ 9.007.199.254.740.993,01'],
		[
			'123456789012345678901234567890.99',
			'R$ 123.456.789.012.345.678.901.234.567.890,99',
		],
	])('formata %s exatamente', (input, expected) => {
		expect(formatBrl(input).replace(/\s/g, ' ')).toBe(expected)
	})
})
