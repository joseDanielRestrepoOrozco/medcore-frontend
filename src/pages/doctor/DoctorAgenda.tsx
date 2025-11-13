import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import AgendaGrid from '@/components/agenda/AgendaGrid';
import { useDoctorAppointments } from '@/hooks/useDoctorAppointments';

type View = 'day' | 'week';

type Block = {
  id: string;
  date: string;
  start: string;
  end: string;
  label: string;
};

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const DoctorAgenda = () => {
  const [view, setView] = useState<View>('day');
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [blocks, setBlocks] = useState<Block[]>([]);
  // const [available, setAvailable] = useState<string[]>([]);
  // const { user } = useAuth();
  // const doctorId = String(user?.id || '');

  // Usar el hook para obtener las citas del doctor
  const { appointments, loading } = useDoctorAppointments(date);

  const addQuickBlock = (label: string) => {
    const noon = { start: '12:00', end: '13:00' };
    setBlocks(prev =>
      prev.concat({
        id: Math.random().toString(36).slice(2),
        date,
        label,
        ...noon,
      })
    );
  };

  const isBlocked = (t: string) =>
    blocks.some(b => b.date === date && t >= b.start && t < b.end);

  // Comentado: ya no usamos disponibilidad, mostramos solo citas reales
  // const isAvailable = (t: string) => {
  //   // check if slot HH:mm exists in available slots for current date
  //   return available.some(iso => {
  //     const d = new Date(iso);
  //     const hh = String(d.getHours()).padStart(2, '0');
  //     const mm = String(d.getMinutes()).padStart(2, '0');
  //     return `${hh}:${mm}` === t;
  //   });
  // };

  // Función para verificar si hay una cita en un slot de tiempo
  const getAppointmentAtTime = (t: string) => {
    return appointments.find(apt => {
      const startDate = new Date(apt.startAt);
      const hh = String(startDate.getHours()).padStart(2, '0');
      const mm = String(startDate.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}` === t;
    });
  };

  // Comentado: ya no necesitamos cargar disponibilidad
  // useEffect(() => {
  //   const loadAvailability = async () => {
  //     if (!doctorId || !date) return;
  //     try {
  //       const res = await api.get('/appointments/disponibilidad', {
  //         params: { doctor_id: doctorId, fecha: date },
  //       });
  //       setAvailable(Array.isArray(res.data?.slots) ? res.data.slots : []);
  //     } catch {
  //       toast.error('No se pudo cargar la disponibilidad');
  //       setAvailable([]);
  //     }
  //   };
  //   loadAvailability();
  // }, [doctorId, date]);

  const weekDays = useMemo(() => {
    if (view !== 'week') return [] as string[];
    const current = new Date(date);
    const day = current.getDay();
    const monday = new Date(current);
    monday.setDate(current.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [date, view]);

  return (
    <div className="p-4 md:p-6">
      {/* Heading + toolbar estilizados */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="min-w-72">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Mi Agenda
          </h1>
          <p className="text-slate-600 text-sm">
            Vista de {view === 'day' ? 'día' : 'semana'} · intervalos de 30
            minutos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1">
            <label className="flex cursor-pointer h-full items-center justify-center rounded-md px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm text-slate-500">
              <span className="truncate">Día</span>
              <input
                checked={view === 'day'}
                onChange={() => setView('day')}
                className="invisible w-0"
                name="view-toggle"
                type="radio"
                value="day"
              />
            </label>
            <label className="flex cursor-pointer h-full items-center justify-center rounded-md px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm text-slate-500">
              <span className="truncate">Semana</span>
              <input
                checked={view === 'week'}
                onChange={() => setView('week')}
                className="invisible w-0"
                name="view-toggle"
                type="radio"
                value="week"
              />
            </label>
          </div>
          <button
            className="inline-flex items-center justify-center rounded h-9 w-9 text-sm text-slate-600 hover:bg-slate-100"
            onClick={() => setDate(new Date().toISOString().slice(0, 10))}
            title="Hoy"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded h-9 px-2"
          />
          <button
            className="inline-flex items-center gap-2 rounded-lg h-9 px-3 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => addQuickBlock('Almuerzo')}
          >
            <span className="material-symbols-outlined text-base">block</span>
            Bloquear almuerzo
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {view === 'day' && (
            <div className="border rounded overflow-hidden">
              {timeSlots.map(t => {
                const appointment = getAppointmentAtTime(t);
                const hasAppointment = !!appointment;

                return (
                  <div
                    key={t}
                    className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 ${
                      isBlocked(t)
                        ? 'bg-rose-50'
                        : hasAppointment
                        ? 'bg-blue-100 border-l-4 border-l-blue-600'
                        : 'bg-white'
                    }`}
                  >
                    <div className="text-xs text-slate-600 w-16">{t}</div>
                    {hasAppointment ? (
                      <div className="flex-1 mx-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-900">
                            {appointment.reason || 'Cita médica'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                            {appointment.status}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 mt-0.5">
                          {appointment.duration} minutos
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 h-6 mx-3 rounded border bg-slate-50" />
                    )}
                    {isBlocked(t) && (
                      <div className="ml-3 text-xs text-rose-700">
                        Bloqueado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {view === 'week' && (
            <div className="overflow-auto">
              <AgendaGrid
                weekDays={weekDays}
                timeSlots={timeSlots}
                available={[]}
                blocks={blocks}
              />
            </div>
          )}
        </div>
        {/* Upcoming sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-6 sticky top-8">
            <h3 className="text-lg font-semibold">Próximas citas</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
              Hoy,{' '}
              {new Date(date).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                  Cargando citas...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.map(appointment => {
                    const startDate = new Date(appointment.startAt);
                    const endDate = new Date(appointment.endAt);
                    const hh = String(startDate.getHours()).padStart(2, '0');
                    const mm = String(startDate.getMinutes()).padStart(2, '0');
                    const hhEnd = String(endDate.getHours()).padStart(2, '0');
                    const mmEnd = String(endDate.getMinutes()).padStart(2, '0');

                    // Colores basados en estado
                    const statusColors: Record<string, string> = {
                      SCHEDULED: 'bg-blue-500',
                      CONFIRMED: 'bg-green-500',
                      IN_PROGRESS: 'bg-amber-500',
                      COMPLETED: 'bg-gray-400',
                      CANCELLED: 'bg-red-500',
                      NO_SHOW: 'bg-purple-500',
                    };

                    const statusLabels: Record<string, string> = {
                      SCHEDULED: 'Agendada',
                      CONFIRMED: 'Confirmada',
                      IN_PROGRESS: 'En curso',
                      COMPLETED: 'Completada',
                      CANCELLED: 'Cancelada',
                      NO_SHOW: 'No asistió',
                    };

                    return (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-gray-700 relative group"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`shrink-0 w-1.5 h-10 rounded-full ${
                              statusColors[appointment.status] || 'bg-slate-500'
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">
                                Paciente
                              </p>
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                {statusLabels[appointment.status] ||
                                  appointment.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                              {hh}:{mm} - {hhEnd}:{mmEnd} (
                              {appointment.duration} min)
                            </p>
                            {appointment.reason && (
                              <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                                {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                      📅
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                      Sin citas para este día.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DoctorAgenda;
