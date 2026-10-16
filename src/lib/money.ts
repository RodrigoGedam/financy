const integerFormatter = new Intl.NumberFormat('pt-BR', {
	maximumFractionDigits: 0,
})

export function parseAmountPtBr(input: string): string | null {
	const value = input.trim()
	if (
		!/^(?:[0-9]+|[1-9][0-9]{0,2}(?:\.[0-9]{3})+)(?:,[0-9]{1,2})?$/.test(
			value,
		)
	) {
		return null
	}
	const decimal = normalizeDecimal(
		value.replaceAll('.', '').replace(',', '.'),
	)
	return decimal === '0.00' ? null : decimal
}

export function normalizeDecimal(decimal: string): string | null {
	const match = /^(-?)([0-9]+)(?:\.([0-9]{1,2}))?$/.exec(decimal.trim())
	if (!match) return null
	const units = match[2].replace(/^0+(?=[0-9])/, '')
	const cents = (match[3] ?? '').padEnd(2, '0')
	const sign = match[1] && (units !== '0' || cents !== '00') ? '-' : ''
	return `${sign}${units}.${cents}`
}

export function formatBrl(decimal: string): string {
	const canonical = normalizeDecimal(decimal)
	if (canonical === null) throw new RangeError('Valor monetário inválido.')
	const negative = canonical.startsWith('-')
	const [units, cents] = canonical.slice(negative ? 1 : 0).split('.')
	return `${negative ? '-' : ''}R$\u00a0${integerFormatter.format(BigInt(units))},${cents}`
}
