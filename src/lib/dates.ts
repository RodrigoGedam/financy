const saoPauloFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'America/Sao_Paulo',
	year: 'numeric',
	era: 'short',
	month: '2-digit',
	day: '2-digit',
})

export function todayInSaoPaulo(now = new Date()): string {
	const parts = Object.fromEntries(
		saoPauloFormatter
			.formatToParts(now)
			.map((part) => [part.type, part.value]),
	)
	if (parts.era !== 'AD') throw new RangeError('Data inválida.')
	const date = `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}`
	formatDateBr(date)
	return date
}

export function isValidMonth(month: string): boolean {
	return (
		month.length === 7 &&
		/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month) &&
		!month.startsWith('0000')
	)
}

export function monthBounds(month: string): {
	start: string
	endExclusive: string
} {
	if (!isValidMonth(month)) throw new RangeError('Mês inválido.')
	const year = Number(month.slice(0, 4))
	const currentMonth = Number(month.slice(5, 7))
	const nextYear = currentMonth === 12 ? year + 1 : year
	const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
	return {
		start: `${month}-01`,
		endExclusive: `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-01`,
	}
}

export function formatDateBr(isoDate: string): string {
	if (
		isoDate.length !== 10 ||
		!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(isoDate) ||
		!isValidMonth(isoDate.slice(0, 7))
	) {
		throw new RangeError('Data inválida.')
	}
	const year = Number(isoDate.slice(0, 4))
	const month = Number(isoDate.slice(5, 7))
	const day = Number(isoDate.slice(8, 10))
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
	const daysInMonth = [
		31,
		leapYear ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31,
	][month - 1]
	if (day < 1 || day > daysInMonth) throw new RangeError('Data inválida.')
	return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`
}
