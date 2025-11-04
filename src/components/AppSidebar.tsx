import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar as UISidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Calendar as CalendarIcon, Bell, FileText, HeartPulse, Pill, Users, LayoutDashboard } from 'lucide-react';
import logo from '@/assets/LogoMedCore .png';

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const role = String(user?.role || '').toUpperCase();

  const items = useMemo(() => {
    switch (role) {
      case 'ADMINISTRADOR':
        return [
          { key: 'admin_panel', label: 'Panel Admin', icon: <LayoutDashboard className="size-5" />, to: '/admin' },
          { key: 'admin_users', label: 'Usuarios', icon: <Users className="size-5" />, to: '/admin/usuarios' },
          { key: 'admin_pacientes', label: 'Pacientes', icon: <FileText className="size-5" />, to: '/admin/pacientes' },
          { key: 'admin_carga', label: 'Carga Masiva', icon: <FileText className="size-5" />, to: '/admin/carga' },
        ];
      case 'MEDICO':
        return [
          { key: 'historia', label: 'Historia Clínica', icon: <FileText className="size-5" />, to: '/dashboard/medical-history/new' },
          { key: 'pacientes', label: 'Pacientes', icon: <Users className="size-5" />, to: '/medico/pacientes' },
          { key: 'calendario', label: 'Agenda', icon: <CalendarIcon className="size-5" />, to: '/dashboard/agenda' },
          { key: 'disponibilidad', label: 'Disponibilidad', icon: <CalendarIcon className="size-5" />, to: '/medico/disponibilidad' },
          { key: 'citas', label: 'Citas', icon: <CalendarIcon className="size-5" />, to: '/medico/citas' },
        ];
      case 'ENFERMERA':
        return [
          { key: 'pacientes', label: 'Pacientes', icon: <Users className="size-5" />, to: '/medico/pacientes' },
          { key: 'signos', label: 'Signos Vitales', icon: <HeartPulse className="size-5" />, to: '#' },
          { key: 'medicamentos', label: 'Medicamentos', icon: <Pill className="size-5" />, to: '#' },
        ];
      case 'PACIENTE':
        return [
          { key: 'mihistoria', label: 'Mi Historia', icon: <FileText className="size-5" />, to: '/patient/history' },
          { key: 'calendario', label: 'Agenda', icon: <CalendarIcon className="size-5" />, to: '/dashboard/agenda' },
          { key: 'alertas', label: 'Alertas', icon: <Bell className="size-5" />, to: '#' },
        ];
      default:
        return [] as Array<{ key: string; label: string; icon: React.ReactNode; to: string }>;
    }
  }, [role]);

  if (!user || items.length === 0) return null;

  return (
    <UISidebar
      side="left"
      variant="inset"
      collapsible="icon"
      className="top-28 md:top-32 h-[calc(100svh-7rem)] md:h-[calc(100svh-8rem)]"
    >
      <SidebarHeader className="px-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <img src={logo} alt="MedCore" className="h-14 md:h-16 w-auto object-contain group-data-[collapsible=icon]:hidden" />
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="text-base">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.to} tooltip={item.label} size="lg" className="text-base">
                    <Link to={item.to}>
                      {item.icon}
                      <span className="leading-none group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </UISidebar>
  );
};

export default AppSidebar;
