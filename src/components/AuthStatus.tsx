import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthStatus = () => {
  const { token, user, logout } = useAuth();

  if (!token) {
    return (
      <Link
        to="/login"
        aria-label="Iniciar sesión"
        title="Iniciar sesión"
        className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center bg-white"
      >
        <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Link>
    );
  }

  const displayName = user?.fullname || user?.email || 'Usuario';

  // const rawRole = (user as typeof user & { role?: string })?.role || '';
  // const role = rawRole.toUpperCase();
  // const dashboardHref =
  //   role === 'ADMINISTRADOR' ? '/admin' : role === 'PACIENTE' ? '/patient' : role === 'MEDICO' ? '/medico' : '/dashboard';

  return (
    <div className="flex items-center gap-x-2 md:gap-x-3">
      <span className="text-sm text-slate-900 hidden sm:inline">{displayName}</span>

      {/* Icono de perfil removido (ya accesible desde el panel) */}
      {/* Ajustes removido del header (está en el sidebar) */}
      <button
        type="button"
        onClick={logout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white"
      >
        {/* Icono de salida (logout) más intuitivo */}
        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 17l5-5-5-5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 19V5a2 2 0 00-2-2h-6" />
        </svg>
      </button>
    </div>
  );
};

export default AuthStatus;
