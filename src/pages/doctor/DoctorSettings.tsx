import { useState } from 'react';

const DoctorSettings = () => {
  const [slot, setSlot] = useState<number>(30);
  const [alerts, setAlerts] = useState<{ cancellations: boolean; confirmations: boolean; reminders: boolean }>({
    cancellations: true,
    confirmations: true,
    reminders: false,
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold">Ajustes</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Preferencias de calendario</h2>
          <label className="text-sm block mb-1">Duración de slot (minutos)</label>
          <select value={slot} onChange={(e) => setSlot(Number(e.target.value))} className="border rounded px-2 py-1">
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
            <option value={60}>60</option>
          </select>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Notificaciones</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={alerts.cancellations} onChange={(e) => setAlerts({ ...alerts, cancellations: e.target.checked })} />
            Cancelaciones
          </label>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" checked={alerts.confirmations} onChange={(e) => setAlerts({ ...alerts, confirmations: e.target.checked })} />
            Confirmaciones
          </label>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" checked={alerts.reminders} onChange={(e) => setAlerts({ ...alerts, reminders: e.target.checked })} />
            Recordatorios
          </label>
        </div>
      </div>
      <div className="mt-4">
        <button className="btn-primary">Guardar cambios</button>
      </div>
    </div>
  );
};

export default DoctorSettings;

