import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR, type RoleKey } from '@/config/sidebar';
import { X } from 'lucide-react';

type Props = {
  variant: 'mobile' | 'desktop';
  collapsed?: boolean;       // solo desktop
  onToggleCollapse?: () => void;
};

export default function AppSidebar({
  variant,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const { user } = useAuth();
  const role = (user?.role ?? '').toUpperCase() as RoleKey;
  const items = SIDEBAR[role] ?? [];
  const { pathname } = useLocation();

  if (!user || items.length === 0) return null;

  const panelBase = 'fixed z-50 top-[var(--header-h)] bottom-0 bg-white border-r shadow-sm overflow-y-auto';

  console.log(variant)

  if (variant === 'mobile') {
    console.log(variant);
    return (
      <>
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onToggleCollapse}
        />
        <aside
          className={`${panelBase} md:hidden transition-transform w-[var(--sidebar-w)] left-0 ${collapsed ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-12 px-3 flex items-center justify-between border-b">
            <span className="text-sm text-slate-500">Menú</span>
            <button className="h-8 w-8 inline-flex items-center justify-center hover:bg-slate-100 rounded" onClick={onToggleCollapse} aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="p-2 space-y-1">
            {items.map(({ label, to, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onToggleCollapse}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
      </>
    );
  }

  return (
    <aside className={`${panelBase}  hidden md:block left-0 ${collapsed ? 'w-[var(--sidebar-w-icon)]' : 'md:w-64 xl:w-[var(--sidebar-w)]'}`} >
      <div className="h-12 px-3 flex items-center border-b">
        <button
          aria-label="Colapsar"
          className="ml-auto h-8 w-8 inline-flex items-center justify-center rounded hover:bg-slate-100"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {items.map(({ label, to, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={`transition-all ${collapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-100'} overflow-hidden`}>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
