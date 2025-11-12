import type React from "react";
import {
  CalendarDays,
  Users,
  ClipboardList,
  Home,
  Clock,
  UsersRound,
  ActivitySquare,
} from "lucide-react";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};
export type RoleKey = "ADMINISTRADOR" | "MEDICO" | "ENFERMERA" | "PACIENTE";

export const SIDEBAR: Record<RoleKey, Item[]> = {
  ADMINISTRADOR: [
    { label: "Inicio", to: "/admin", icon: Home, exact: true },
    { label: "Usuarios", to: "/admin/usuarios", icon: Users },
    { label: "Pacientes", to: "/admin/pacientes", icon: UsersRound },
    { label: "Documentos", to: "/dashboard/documents", icon: ClipboardList },
  ],
  MEDICO: [
    { label: "Inicio", to: "/medico", icon: Home, exact: true },
    { label: "Agenda", to: "/medico/agenda", icon: CalendarDays },
    { label: "Citas", to: "/medico/citas", icon: ClipboardList },
    { label: "Pacientes", to: "/medico/pacientes", icon: UsersRound },
    { label: "Disponibilidad", to: "/medico/disponibilidad", icon: Clock },
    { label: "Sala de espera", to: "/medico/cola", icon: ActivitySquare },
  ],
  ENFERMERA: [
    { label: "Inicio", to: "/enfermera", icon: Home, exact: true },
    { label: "Agenda", to: "/enfermera/agenda", icon: CalendarDays },
    { label: "Pacientes", to: "/enfermera/pacientes", icon: UsersRound },
    { label: "Sala de espera", to: "/enfermera/cola", icon: ActivitySquare },
  ],
  PACIENTE: [
    { label: "Inicio", to: "/patient", icon: Home, exact: true },
    { label: "Citas", to: "/patient/appointments", icon: CalendarDays },
    { label: "Historia clínica", to: "/patient/history", icon: ClipboardList },
  ],
};

