import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import AgendaGrid from '@/components/agenda/AgendaGrid';
import { toast } from 'sonner';

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
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const { user } = useAuth();
  const doctorId = String(user?.id || '');

  const addQuickBlock = (label: string) => {
    const noon = { start: '12:00', end: '13:00' };
    setBlocks((prev) => prev.concat({ id: Math.random().toString(36).slice(2), date, label, ...noon }));
  };

  const isBlocked = (t: string) => blocks.some((b) => b.date === date && t >= b.start && t < b.end);
  const isAvailable = (t: string) => {
    // check if slot HH:mm exists in available slots for current date
    return available.some((iso) => {
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}` === t;
    });
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (!doctorId || !date) return;
      try {
        const res = await api.get('/appointments/disponibilidad', { params: { doctor_id: doctorId, fecha: date } });
        setAvailable(Array.isArray(res.data?.slots) ? res.data.slots : []);
      } catch (err) {
        toast.error('No se pudo cargar la disponibilidad');
        setAvailable([]);
      }
    };
    loadAvailability();
  }, [doctorId, date]);

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
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Mi Agenda</h1>
          <p className="text-slate-600 text-sm">Vista de {view === 'day' ? 'día' : 'semana'} · intervalos de 30 minutos</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1">
            <label className="flex cursor-pointer h-full items-center justify-center rounded-md px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm text-slate-500">
              <span className="truncate">Día</span>
              <input checked={view==='day'} onChange={() => setView('day')} className="invisible w-0" name="view-toggle" type="radio" value="day" />
            </label>
            <label className="flex cursor-pointer h-full items-center justify-center rounded-md px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm text-slate-500">
              <span className="truncate">Semana</span>
              <input checked={view==='week'} onChange={() => setView('week')} className="invisible w-0" name="view-toggle" type="radio" value="week" />
            </label>
          </div>
          <button className="inline-flex items-center justify-center rounded h-9 w-9 text-sm text-slate-600 hover:bg-slate-100" onClick={() => setDate(new Date().toISOString().slice(0,10))} title="Hoy">
            <CalendarIcon className="h-5 w-5" />
          </button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded h-9 px-2" />
          <button className="inline-flex items-center gap-2 rounded-lg h-9 px-3 bg-blue-600 text-white hover:bg-blue-700" onClick={() => addQuickBlock('Almuerzo')}>
            <span className="material-symbols-outlined text-base">block</span>
            Bloquear almuerzo
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {view === 'day' && (
            <div className="border rounded overflow-hidden">
              {timeSlots.map((t) => (
                <div key={t} className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 ${isBlocked(t) ? 'bg-rose-50' : isAvailable(t) ? 'bg-emerald-50' : 'bg-white'}`}>
                  <div className="text-xs text-slate-600 w-16">{t}</div>
                  <div className="flex-1 h-6 rounded border bg-slate-50" />
                  {isBlocked(t) && <div className="ml-3 text-xs text-rose-700">Bloqueado</div>}
                  {!isBlocked(t) && isAvailable(t) && <div className="ml-3 text-xs text-emerald-700">Disponible</div>}
                </div>
              ))}
            </div>
          )}
          {view === 'week' && (
            <div className="overflow-auto">
              <AgendaGrid weekDays={weekDays} timeSlots={timeSlots} available={available} blocks={blocks} />
            </div>
          )}
        </div>
        {/* Upcoming sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-6 sticky top-8">
            <h3 className="text-lg font-semibold">Próximas citas</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Hoy, {new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <div className="space-y-4">
              {/* Ejemplos simples usando disponibles como mock */}
              {available.filter(iso => iso.startsWith(date)).slice(0,3).map((iso, idx) => {
                const d = new Date(iso);
                const hh = String(d.getHours()).padStart(2,'0');
                const mm = String(d.getMinutes()).padStart(2,'0');
                const colors = ['bg-green-500','bg-amber-500','bg-red-500'];
                return (
                  <div key={iso} className="p-4 rounded-lg border border-slate-200 dark:border-gray-700 relative group">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-1.5 h-10 rounded-full ${colors[idx % colors.length]}`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">Paciente #{idx+1}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{hh}:{mm} - {hh}:{mm}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Motivo</p>
                      </div>
                      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Acciones</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {available.filter(iso => iso.startsWith(date)).length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">📅</div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Sin más citas para hoy.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DoctorAgenda;
