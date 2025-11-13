import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import MiniCalendar from '@/components/MiniCalendar';
import { StatCard } from '@/components/DashboardCards';
import PatientSummaryCards from '@/components/PatientSummaryCards';
import { usePatientStore } from '@/store/usePatientStore';
import PatientAppointmentRow from '@/components/PatientAppointmentRow';

const PatientDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullname || user?.email || 'Paciente';

  const { appointments, loadingAppointments, fetchAppointments } =
    usePatientStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const now = Date.now();
    const upcomingAppointments = appointments.filter(
      a =>
        new Date(a.date).getTime() >= now &&
        (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
    );

    return {
      pending: upcomingAppointments.length,
      total: appointments.length,
    };
  }, [appointments]);

  // Próximas citas (máximo 5)
  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter(a => new Date(a.date).getTime() >= now)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 5);
  }, [appointments]);

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
      <ProfileHeader name={name} role="Paciente" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Citas Pendientes" value={stats.pending} />
        <StatCard title="Total de Citas" value={stats.total} />
        <StatCard title="Resultados" value={0} />
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Próximas Citas</h3>
            <p className="text-sm text-slate-500 mb-4">
              Revisa tus próximas citas médicas
            </p>
            {loadingAppointments ? (
              <p className="text-sm text-slate-500">Cargando citas...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tienes citas programadas
              </p>
            ) : (
              <ul className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <PatientAppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">
              Historia Clínica Electrónica
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Accede a tu historia clínica aquí
            </p>
            <button className="px-4 py-2 bg-slate-800 text-white rounded">
              Ver Historia
            </button>
          </section>

          <section className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Mensajes a mi Médico</h3>
            <form className="space-y-3">
              <input
                placeholder="Asunto"
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Mensaje"
                className="w-full border p-2 rounded h-24"
              />
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 text-white rounded"
              >
                Enviar Mensaje
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <PatientSummaryCards />
          <div className="bg-white p-4 rounded shadow">
            <MiniCalendar />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientDashboard;
