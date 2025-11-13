import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AppointmentStatus } from '@/components/StatusBadge';
import { useDoctorStore } from '@/store/useDoctorStore';
import AppointmentRow from '@/components/AppointmentRow';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullname || user?.email || 'Médico';

  const { appointments, loadingAppointments, fetchAppointments } =
    useDoctorStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const kpis = useMemo(() => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const todays = appointments.filter(a => {
      const t = new Date(a.date).getTime();
      return t >= start && t < end;
    });
    const count = (s: AppointmentStatus) =>
      todays.filter(a => a.status === s).length;

    return {
      scheduled: count('SCHEDULED') + count('CONFIRMED'),
      inProgress: count('IN_PROGRESS'),
      completed: count('COMPLETED'),
      cancelled: count('CANCELLED'),
      noShow: count('NO_SHOW'),
    };
  }, [appointments]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter(a => new Date(a.date).getTime() >= now)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 3);
  }, [appointments]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight">
        Hola, {name}
      </h1>
      <p className="text-slate-600">Resumen de tu jornada para hoy</p>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <div className="card">
          <div className="text-xs text-slate-500">Programadas</div>
          <div className="text-2xl font-bold">{kpis.scheduled}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">En curso</div>
          <div className="text-2xl font-bold">{kpis.inProgress}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">Completadas</div>
          <div className="text-2xl font-bold">{kpis.completed}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">Canceladas / No-show</div>
          <div className="text-2xl font-bold">
            {kpis.cancelled + kpis.noShow}
          </div>
        </div>
      </div>

      {/* Próximas 3 */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">Próximas 3 citas</h3>
          <a className="btn-secondary h-9 px-3" href="/medico/cola">
            Ir a sala
          </a>
        </div>
        <div className="space-y-2">
          {loadingAppointments ? (
            <>
              <div className="text-slate-600">Cargando citas...</div>
            </>
          ) : upcoming.length === 0 ? (
            <div className="text-slate-600">No hay próximas citas</div>
          ) : (
            upcoming.map(a => <AppointmentRow key={a.id} appointment={a} />)
          )}
        </div>
      </div>

      {/* Alertas */}
      <div className="mt-6 border rounded-lg p-4">
        <h3 className="text-base font-semibold mb-2">Alertas</h3>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>No hay alertas por el momento.</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorDashboard;
