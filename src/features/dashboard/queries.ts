import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/auth-context'
import { getDashboard } from './api'

export function useDashboard(month: string) {
	const { session } = useAuth()
	return useQuery({
		queryKey: ['finance', session?.user.id, 'dashboard', month],
		enabled: Boolean(session),
		queryFn: ({ signal }) => getDashboard(month, signal),
	})
}
