import type React from 'react';
import { Calendar, Stethoscope, ClipboardList, Users2, Settings, ListChecks } from 'lucide-react';

export type MenuItem = {
  key: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: RegExp;
};

export const DOCTOR_MENU: MenuItem[] = [
  { key: 'doctor.dashboard', to: '/medico', label: 'Inicio', icon: Stethoscope, match: /^\/medico$/ },
  { key: 'doctor.agenda', to: '/dashboard/agenda', label: 'Agenda', icon: Calendar, match: /^\/dashboard\/agenda/ },
  { key: 'doctor.citas', to: '/medico/citas', label: 'Citas', icon: ClipboardList, match: /^\/medico\/citas/ },
  { key: 'doctor.pacientes', to: '/medico/pacientes', label: 'Pacientes', icon: Users2, match: /^\/medico\/pacientes/ },
  { key: 'doctor.disponibilidad', to: '/medico/disponibilidad', label: 'Disponibilidad', icon: Settings, match: /^\/medico\/disponibilidad/ },
  { key: 'doctor.cola', to: '/medico/cola', label: 'Sala de espera', icon: ListChecks, match: /^\/medico\/cola/ },
];

export const ADMIN_MENU: MenuItem[] = [
  { key: 'admin.dashboard', to: '/admin', label: 'Panel Admin', icon: Stethoscope, match: /^\/admin$/ },
  { key: 'admin.users', to: '/admin/usuarios', label: 'Usuarios', icon: Users2, match: /^\/admin\/usuarios/ },
  { key: 'admin.pacientes', to: '/admin/pacientes', label: 'Pacientes', icon: ClipboardList, match: /^\/admin\/pacientes/ },
  { key: 'admin.carga', to: '/admin/carga', label: 'Carga Masiva', icon: Settings, match: /^\/admin\/carga/ },
];

export const PATIENT_MENU: MenuItem[] = [
  { key: 'patient.dashboard', to: '/patient', label: 'Inicio', icon: Stethoscope, match: /^\/patient$/ },
  { key: 'patient.history', to: '/patient/history', label: 'Mi Historia', icon: ClipboardList, match: /^\/patient\/history/ },
  { key: 'patient.appointments', to: '/patient/appointments', label: 'Citas', icon: Calendar, match: /^\/patient\/appointments/ },
];
