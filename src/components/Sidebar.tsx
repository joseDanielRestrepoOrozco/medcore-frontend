import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  open = false,
  onClose,
  collapsed: propCollapsed,
  onToggle,
}) => {
  // Estado local para el colapso si no se provee desde props
  const [localCollapsed, setLocalCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });
  const collapsed = propCollapsed ?? localCollapsed;
  const handleToggle = () => {
    try {
      localStorage.setItem('sidebarCollapsed', (!collapsed).toString());
    } catch {
      // ignore localStorage errors
    }
    if (onToggle) onToggle();
    else setLocalCollapsed(!collapsed);
  };

  // Si no hay sesión, no renderizar
  const { user } = useAuth();
  if (!user) return null;

  const role = String(user?.role || '').toUpperCase();

  const IconFile = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 3h6l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
      />
    </svg>
  );
  const IconHeart = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 21.657 3.172 10.828a4 4 0 010-5.656z"
      />
    </svg>
  );
  const IconPill = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 11a7 7 0 11-14 0 7 7 0 0114 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v8m-4-4h8"
      />
    </svg>
  );
  const IconCalendar = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
  const IconBell = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );

  // Items por rol
  const roleItems: SidebarItem[] = (() => {
    switch (role) {
      case 'ADMINISTRADOR':
        return [
          {
            key: 'admin_panel',
            label: 'Panel Admin',
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-6h6v6M9 7h6M5 21h14V3H5v18z"
                />
              </svg>
            ),
            to: '/admin',
          },
          {
            key: 'admin_users',
            label: 'Usuarios',
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            ),
            to: '/admin/usuarios',
          },
          {
            key: 'admin_pacientes',
            label: 'Pacientes',
            icon: IconFile,
            to: '/admin/pacientes',
          },
          {
            key: 'admin_carga',
            label: 'Carga Masiva',
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 1.343-3 3h6c0-1.657-1.343-3-3-3zM5 10h14v10H5zM8 4h8l1 4H7l1-4z"
                />
              </svg>
            ),
            to: '/admin/carga',
          },
        ];
      case 'MEDICO':
        return [
          {
            key: 'historia',
            label: 'Historia Clínica',
            icon: IconFile,
            to: '/dashboard/medical-history/new',
          },
          {
            key: 'pacientes',
            label: 'Pacientes',
            icon: IconFile,
            to: '/medico/pacientes',
          },
          {
            key: 'calendario',
            label: 'Agenda',
            icon: IconCalendar,
            to: '/dashboard/agenda',
          },
        ];
      case 'ENFERMERA':
        return [
          {
            key: 'pacientes',
            label: 'Pacientes',
            icon: IconFile,
            to: '/medico/pacientes',
          },
          { key: 'signos', label: 'Signos Vitales', icon: IconHeart, to: '#' },
          {
            key: 'medicamentos',
            label: 'Medicamentos',
            icon: IconPill,
            to: '#',
          },
        ];
      case 'PACIENTE':
        return [
          {
            key: 'mihistoria',
            label: 'Mi Historia',
            icon: IconFile,
            to: '/patient/history',
          },
          {
            key: 'calendario',
            label: 'Agenda',
            icon: IconCalendar,
            to: '/dashboard/agenda',
          },
          { key: 'alertas', label: 'Alertas', icon: IconBell, to: '#' },
        ];
      default:
        return [];
    }
  })();

  const widthClass = collapsed ? 'w-12' : 'w-56';

  return (
    <>
      {/* Persistent sidebar */}
      <aside
        className={`${widthClass} sticky top-24 bg-[var(--mc-muted)] border-r border-slate-200 px-2 py-2 h-[calc(100vh-6rem)] overflow-y-auto transition-all`}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          {!collapsed && <span className="font-semibold">Menú</span>}
          <button
            type="button"
            onClick={handleToggle}
            aria-label={collapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
            className="p-1 rounded hover:bg-slate-100"
          >
            {/* simple arrow */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {collapsed ? (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5l8 7-8 7"
                />
              ) : (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 5l-8 7 8 7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="space-y-2 px-1">
          {roleItems.map((item: SidebarItem) => (
            <Link
              key={item.key}
              to={item.to || '#'}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-slate-700 hover:bg-white/70 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="text-slate-500">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay sidebar on mobile when open flag is true (kept for accessibility) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div
            className="flex-1 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* panel */}
          <aside className="w-64 bg-white border-l min-h-full p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Menú</span>
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 border rounded"
                aria-label="Cerrar menú"
              >
                Cerrar
              </button>
            </div>
            <nav className="space-y-2">
              {roleItems.map((item: SidebarItem) => (
                <Link
                  key={item.key}
                  to={item.to || '#'}
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-100"
                >
                  <span className="text-slate-500">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
