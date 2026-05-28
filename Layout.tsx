// app/Layout.tsx
// Shell mobile-first: header fijo arriba, bottom nav fijo abajo, contenido al medio.

import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { OfflineBadge } from '../ui/OfflineBadge'
import { Toast } from '../ui/Toast'

type NavItem = {
  to: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/campanias',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    to: '/captura',
    label: 'Captura',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: '/historial',
    label: 'Historial',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/ajustes',
    label: 'Ajustes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
]

function Header() {
  const location = useLocation()

  // Título simple basado en ruta — expandir con breadcrumb en Fase 1
  const title = location.pathname.startsWith('/campanias') ? 'Campañas'
    : location.pathname.startsWith('/captura')   ? 'Captura'
    : location.pathname.startsWith('/historial') ? 'Historial'
    : location.pathname.startsWith('/ajustes')   ? 'Ajustes'
    : 'Agri Captura'

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 bg-campo-950/95 backdrop-blur border-b border-campo-800">
      <span className="font-sans font-medium text-campo-100 tracking-tight">
        {title}
      </span>
      <OfflineBadge />
    </header>
  )
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex bg-campo-950/95 backdrop-blur border-t border-campo-800 pb-safe">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-sans transition-colors
            ${isActive ? 'text-campo-300' : 'text-campo-600 hover:text-campo-400'}`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-campo-950 text-campo-100 font-sans">
      <Header />
      {/* Padding: 56px header arriba + 64px nav abajo */}
      <main className="pt-14 pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}
