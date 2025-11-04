import { Link } from 'react-router-dom';
import AuthStatus from './AuthStatus';
import logo from '../assets/LogoMedCore .png';
import { useAuth } from '../context/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const menu = ['Home', 'Solution', 'About Us', 'Contact'];
  const { token } = useAuth();

  return (
    <header className="w-full sticky top-0 z-50 border-b" style={{ background: 'var(--navbar-bg)' }}>
      {/* contenido: logo, menú (píldora) y acciones */}
      <div className="w-full px-4 md:px-10 flex items-center justify-between h-28 md:h-32 gap-x-4 md:gap-x-8">
          {/* Bloque 1: Trigger + Logo */}
          <div className="flex items-center gap-3">
            {token && <SidebarTrigger className="md:hidden" />}
            {/* Logo: si hay sesión, lleva al dashboard */}
            <Link to={token ? '/dashboard' : '/'}>
              <img src={logo} alt="MedCore" className="h-24 md:h-28 lg:h-32 w-auto object-contain" />
            </Link>
          </div>

          {/* Bloque 2: Píldora de navegación (solo si no hay sesión) */}
          <div className="flex-1 flex justify-center">
            {!token && (
              <div className="rounded-[40px] border border-slate-300 px-3 py-2 flex items-center gap-2 bg-white shadow-[0_6px_0_rgba(0,0,0,0.06)] mx-16">
                <nav className="flex items-center -space-x-2">
                  {menu.map((m, i) => (
                    <Link
                      key={m}
                      to={m === 'Home' ? '/' : '#'}
                      className={`relative px-6 py-2 rounded-3xl text-sm ${i === 0 ? 'text-white z-10 shadow-md border-2' : 'bg-white text-slate-600 z-0 border border-slate-200'}`}
                      style={i === 0 ? { backgroundColor: 'var(--mc-secondary)', borderColor: 'var(--mc-secondary)' } : undefined}
                    >
                      {m}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Bloque 3: Iconos de acción y usuario */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" aria-label="Buscar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 4a7 7 0 100 14 7 7 0 000-14z"></path>
              </svg>
            </Button>
            <Button variant="outline" size="icon" aria-label="Notificaciones">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </Button>
            {/* Estado de autenticación: Login o [Nombre][Dashboard][Salir] */}
            <AuthStatus />
          </div>
        </div>
    </header>
  );
};

export default Navbar;
