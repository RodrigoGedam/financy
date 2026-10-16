import {
	defaultParseSearch,
	defaultStringifySearch,
} from '@tanstack/react-router'

// O parser JSON padrão arredonda uma descrição composta apenas por dígitos grandes.
export function parseAppSearch(search: string): Record<string, unknown> {
	const parsed: Record<string, unknown> = { ...defaultParseSearch(search) }
	const raw = new URLSearchParams(search).get('q')
	if (raw !== null) parsed.q = raw
	return parsed
}
export function stringifyAppSearch(search: Record<string, unknown>): string {
	const { q, ...rest } = search
	const params = new URLSearchParams(defaultStringifySearch(rest))
	if (typeof q === 'string') params.set('q', q)
	const value = params.toString()
	return value ? `?${value}` : ''
}
