import { useState } from 'react';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { useSchedules } from '../../hooks/useSchedules';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function NewAppointmentPage() {
  useAuth();
  const [doctorId, setDoctorId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [time, setTime] = useState<string>('');
  const { data: schedules } = useSchedules(doctorId, date);
  const createMut = useCreateAppointment();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date || !time) return;
    // Validaciones básicas UI
    const dt = new Date(`${date}T${time}:00`);
    if (dt.getTime() < Date.now()) {
      toast.error('No puedes seleccionar una hora pasada');
      return;
    }
    const mm = dt.getMinutes();
    if (!(mm === 0 || mm === 30)) {
      toast.error('Solo intervalos de 30 minutos');
      return;
    }
    try {
      await createMut.mutateAsync({ doctorId, date, startTime: time });
      toast.success('Cita creada');
    } catch {
      toast.error('No se pudo crear la cita');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">Nueva cita</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-md">
        <label className="block">
          <span className="text-sm">ID del médico</span>
          <input className="border rounded px-2 py-1 w-full" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} placeholder="id-medico" />
        </label>
        <label className="block">
          <span className="text-sm">Fecha</span>
          <input type="date" className="border rounded px-2 py-1 w-full" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Hora</span>
          <select className="border rounded px-2 py-1 w-full" value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Selecciona...</option>
            {(schedules || []).flatMap(s => {
              const out: string[] = [];
              const [sh] = s.startTime.split(':').map(Number);
              const [eh] = s.endTime.split(':').map(Number);
              for (let h = sh; h <= eh; h++) {
                for (const m of [0, 30]) {
                  const hh = String(h).padStart(2, '0');
                  const mm = String(m).padStart(2, '0');
                  const val = `${hh}:${mm}`;
                  if (val >= s.startTime && val <= s.endTime) out.push(val);
                }
              }
              return out;
            }).map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </label>
        <button type="submit" className="btn-primary" disabled={createMut.isPending}>Crear cita</button>
      </form>
    </div>
  );
}
