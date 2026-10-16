import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Navigate, Outlet, useRouterState, type SearchSchemaInput } from '@tanstack/react-router'
import { useAuth } from './features/auth/auth-context'
import { AppShell } from './components/app-shell'
import { parseTransactionSearch } from './features/transactions/search'
import { parseAppSearch, stringifyAppSearch } from './features/transactions/router-search'
import { Button } from './components/ui/button'

function Root() {
  const { session, loading, error } = useAuth()
  const path = useRouterState({ select: state => state.location.pathname })
  if (loading) return <div className="auth-page" role="status" aria-live="polite"><div className="auth-card animate-pulse"><div className="h-6 rounded bg-gray-200" /><div className="h-12 rounded bg-gray-100" /><p>Carregando sua conta…</p></div></div>
  if (error) return <main className="auth-page"><div className="auth-card"><p role="alert">Não foi possível restaurar sua sessão. Verifique a conexão e tente novamente.</p><Button onClick={() => window.location.reload()}>Tentar novamente</Button></div></main>
  const publicPage = path === '/login' || path === '/cadastro'
  if (!session && !publicPage) return <Navigate to="/login" replace />
  if (session && publicPage) return <Navigate to="/" replace />
  return <Outlet />
}

const root = createRootRoute({ component: Root, notFoundComponent: () => <div className="page-content"><h1>Página não encontrada</h1><a href="/">Voltar ao início</a></div> })
const login = createRoute({ getParentRoute: () => root, path: '/login', component: lazyRouteComponent(() => import('./features/auth/login-page'), 'LoginPage') })
const signup = createRoute({ getParentRoute: () => root, path: '/cadastro', component: lazyRouteComponent(() => import('./features/auth/signup-page'), 'SignupPage') })
const app = createRoute({ getParentRoute: () => root, id: 'app', component: AppShell })
const dashboard = createRoute({ getParentRoute: () => app, path: '/', component: () => <FeaturePending title="Dashboard" /> })
const categories = createRoute({ getParentRoute: () => app, path: '/categorias', component: lazyRouteComponent(() => import('./features/categories/categories-page'), 'CategoriesPage') })
const transactions = createRoute({ getParentRoute: () => app, path: '/transacoes', validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) => parseTransactionSearch(raw), component: lazyRouteComponent(() => import('./features/transactions/transactions-page'), 'TransactionsPage') })
const profile = createRoute({ getParentRoute: () => app, path: '/perfil', component: lazyRouteComponent(() => import('./features/auth/profile-page'), 'ProfilePage') })
function FeaturePending({ title }: { title: string }) { return <div className="page-content"><h1>{title}</h1><p className="mt-4 text-gray-600">Seu acesso está pronto. Esta área será disponibilizada nas próximas entregas.</p></div> }
export const router = createRouter({ routeTree: root.addChildren([login, signup, app.addChildren([dashboard, categories, transactions, profile])]), defaultPreload: 'intent', parseSearch: parseAppSearch, stringifySearch: stringifyAppSearch })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
