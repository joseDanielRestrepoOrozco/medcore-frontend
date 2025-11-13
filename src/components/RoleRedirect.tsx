import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RoleRedirect() {
  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase();

  if (role === 'ADMINISTRADOR' || role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'MEDICO' || role === 'DOCTOR') return <Navigate to="/medico" replace />;
  if (role === 'ENFERMERA' || role === 'NURSE') return <Navigate to="/enfermera" replace />;
  if (role === 'PACIENTE' || role === 'PATIENT') return <Navigate to="/patient" replace />;

  return <Navigate to="/" replace />;
}
