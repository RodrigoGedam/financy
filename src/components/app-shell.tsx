import { Link, Outlet } from '@tanstack/react-router'
import { Logo } from './logo'
import { useAuth } from '../features/auth/auth-context'

export function AppShell() {
  const { session } = useAuth()
  const name = typeof session?.user.user_metadata.full_name === 'string' ? session.user.user_metadata.full_name : ''
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toLocaleUpperCase('pt-BR') || 'U'
  return <>
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <header className="navbar">
      <Link to="/" aria-label="Financy — início"><Logo compact /></Link>
      <nav aria-label="Navegação principal"><Link to="/" activeOptions={{ exact: true }}>Dashboard</Link><Link to="/transacoes">Transações</Link><Link to="/categorias">Categorias</Link></nav>
      <Link className="avatar" to="/perfil" aria-label="Meu perfil">{initials}</Link>
    </header>
    <main id="main-content"><Outlet /></main>
  </>
}
