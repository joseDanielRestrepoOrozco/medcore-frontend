import { useState } from 'react';
import { useAppointmentsList, useCancelAppointment, useConfirmAppointment, useReschedule } from '../../hooks/useAppointments';
import type { Appointment } from '../../types/appointments';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading } = useAppointmentsList({ tab });
  const confirmMut = useConfirmAppointment();
  const cancelMut = useCancelAppointment();
  const reschedMut = useReschedule();

  const [reId, setReId] = useState<string | null>(null);
  const [dt, setDt] = useState<string>(''); // yyyy-mm-ddThh:mm

  const canReschedule = (a: Appointment) => {
    const d = new Date(`${a.date}T${a.startTime}:00`);
    return d.getTime() - Date.now() >= 24 * 3600_000;
  };
  const canCancel = (a: Appointment) => {
    const d = new Date(`${a.date}T${a.startTime}:00`);
    return d.getTime() - Date.now() >= 4 * 3600_000;
  };

  const onConfirm = async (id: string) => {
    try { await confirmMut.mutateAsync(id); toast.success('Cita confirmada'); } catch { toast.error('No se pudo confirmar'); }
  };
  const onCancel = async (id: string) => {
    try { await cancelMut.mutateAsync(id); toast.success('Cita cancelada'); } catch { toast.error('No se pudo cancelar'); }
  };
  const onResched = async () => {
    if (!reId || !dt) return;
    const [date, timePart] = dt.split('T');
    const startTime = (timePart || '').slice(0,5);
    try { await reschedMut.mutateAsync({ id: reId, dto: { date, startTime } }); toast.success('Cita reprogramada'); setReId(null); setDt(''); } catch { toast.error('No se pudo reprogramar'); }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">Mis citas</h1>
      <div className="flex gap-2 mb-3">
        <button className={`px-3 py-1 border rounded ${tab==='upcoming'?'bg-slate-200':''}`} onClick={() => setTab('upcoming')}>Próximas</button>
        <button className={`px-3 py-1 border rounded ${tab==='past'?'bg-slate-200':''}`} onClick={() => setTab('past')}>Pasadas</button>
      </div>
      {isLoading && <div className="text-sm text-slate-600">Cargando…</div>}
      <div className="space-y-2">
        {(data || []).map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-white border rounded p-3">
            <div>
              <div className="font-medium">{a.patientName || 'Paciente'}</div>
              <div className="text-xs text-slate-600">{a.date} {a.startTime}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => onConfirm(a.id)} disabled={a.status !== 'scheduled' && a.status !== 'confirmed'}>Confirmar</button>
              <button className="px-2 py-1 border rounded" onClick={() => setReId(a.id)} disabled={!canReschedule(a)} title={!canReschedule(a) ? 'Reprogramar ≥ 24h antes' : ''}>Reprogramar</button>
              <button className="px-2 py-1 border rounded" onClick={() => onCancel(a.id)} disabled={!canCancel(a)} title={!canCancel(a) ? 'Cancelar ≥ 4h antes' : ''}>Cancelar</button>
              <a className="px-2 py-1 border rounded" href={`/appointments/${a.id}`}>Detalle</a>
            </div>
          </div>
        ))}
        {(data || []).length === 0 && <div className="text-slate-600">No tienes citas {tab==='upcoming'?'próximas':'pasadas'}. Agenda una nueva.</div>}
      </div>

      <Modal
        open={!!reId}
        onClose={() => { setReId(null); setDt(''); }}
        title="Reprogramar"
        footer={<>
          <button className="px-3 py-1 border rounded" onClick={() => { setReId(null); setDt(''); }}>Cerrar</button>
          <button className="px-3 py-1 border rounded bg-emerald-600 text-white" onClick={onResched} disabled={!dt}>Confirmar</button>
        </>}
      >
        <label className="text-sm block mb-1">Nueva fecha y hora</label>
        <input type="datetime-local" step={1800} className="border rounded px-2 py-1 w-full" value={dt} onChange={(e) => setDt(e.target.value)} />
      </Modal>
    </div>
  );
}

