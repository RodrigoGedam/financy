export function countTitleCharacters(value: string): number {
	return Array.from(value.trim()).length
}

export function normalizeFinancialTitle(
	value: string,
	field: 'category' | 'transaction',
): string {
	const title = value.trim()
	if (!title)
		throw new Error(
			field === 'category'
				? 'Informe o nome da categoria.'
				: 'Informe a descrição.',
		)
	if (countTitleCharacters(title) > 20)
		throw new Error(
			field === 'category'
				? 'Use até 20 caracteres no nome da categoria.'
				: 'Use até 20 caracteres na descrição da transação.',
		)
	return title
}
