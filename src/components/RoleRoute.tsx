import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'admin' | 'patient' | 'medico' | 'ADMINISTRADOR' | 'PACIENTE' | 'MEDICO' | 'ENFERMERA';

const RoleRoute: React.FC<{ allowed: Role[]; children: React.ReactNode }> = ({ allowed, children }) => {
  // Hooks must not be conditional
  const { token, user } = useAuth();
  const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';
  if (isAuthDisabled) return <>{children}</>;
  if (!token) return <Navigate to="/login" replace />;

  const raw = (user as typeof user & { role?: string })?.role;
  const role = raw?.toUpperCase() as Role | undefined;
  if (!role) return <Navigate to="/dashboard" replace />;
  const allowedNorm = allowed.map((r) => (typeof r === 'string' ? (r as string).toUpperCase() : r)) as string[];
  if (!allowedNorm.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default RoleRoute;
