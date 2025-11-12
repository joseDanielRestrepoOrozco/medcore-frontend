import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "./routes";

type CanonicalRole = "doctor" | "patient" | "admin";
type Props = { children: React.ReactNode; allowed?: Array<CanonicalRole> };

function toCanonical(role?: string): CanonicalRole | null {
  const r = String(role || '').toLowerCase();
  if (r.includes('medico') || r === 'doctor') return 'doctor';
  if (r.includes('admin')) return 'admin';
  if (r.includes('paciente') || r === 'patient') return 'patient';
  if (r.includes('enfermer')) return 'doctor'; 
  return null;
}

export default function RequireAuth({ children, allowed }: Props) {
  const { token, user } = useAuth();
  const loc = useLocation();

  if (!token) return <Navigate to={ROUTES.auth.login} state={{ from: loc }} replace />;

  const role = toCanonical(user?.role);
  if (allowed && role && !allowed.includes(role)) {
    // Redirige por rol si no tiene permiso
    const fallback =
      role === "doctor" ? ROUTES.doctor.dashboard :
      role === "admin"  ? ROUTES.admin.dashboard  :
                          ROUTES.patient.dashboard;
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
