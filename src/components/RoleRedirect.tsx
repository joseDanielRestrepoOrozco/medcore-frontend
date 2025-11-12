import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RoleRedirect() {
  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase();
<<<<<<< Updated upstream
  if (role === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
  if (role === 'PACIENTE') return <Navigate to="/patient" replace />;
  if (role === 'MEDICO') return <Navigate to="/medico" replace />;
  return <Navigate to="/dashboard" replace />; // fallback por si falta rol
};

export default RoleRedirect;

=======

  if (role === 'ADMINISTRADOR' || role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'MEDICO' || role === 'DOCTOR') return <Navigate to="/medico" replace />;
  if (role === 'ENFERMERA' || role === 'NURSE') return <Navigate to="/enfermera" replace />;
  if (role === 'PACIENTE' || role === 'PATIENT') return <Navigate to="/patient" replace />;

  return <Navigate to="/" replace />;
}
>>>>>>> Stashed changes
