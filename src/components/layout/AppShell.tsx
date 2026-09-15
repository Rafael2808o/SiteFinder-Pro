import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Users,
  KanbanSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../ui/Logo'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/buscar', label: 'Buscar empresas', icon: Search },
  { to: '/leads', label: 'Meus Leads', icon: Users },
  { to: '/crm', label: 'CRM', icon: KanbanSquare },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900 px-4 py-6">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700">
            <Logo size={18} className="text-white" accent="#0f766e" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">SiteFinder</p>
            <p className="text-xs leading-tight text-slate-400">Pro</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-teal-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 pt-4">
          <p className="truncate px-2 text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
