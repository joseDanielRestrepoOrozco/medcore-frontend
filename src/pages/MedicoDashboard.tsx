import Sidebar from '../components/Sidebar';
import ProfileHeader from '../components/ProfileHeader';
import { StatCard } from '../components/DashboardCards';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MedicoDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullname || user?.email || 'Médico';
  const [specialty, setSpecialty] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [treatments, setTreatments] = useState<Array<{ id: string; patient?: string; treatment?: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/diagnostics/search');
        const list = ((res.data?.diagnostics || []) as Array<any>).slice(0, 4).map((d) => ({ id: d.id, patient: d.patientId, treatment: d.treatment }));
        setTreatments(list);
      } catch {
        setTreatments([]);
      }
      try {
        if (user?.id) {
          const r = await api.get(`/users/${user.id}`);
          const u = r.data || {};
          if (typeof u.specialization === 'string') setSpecialty(u.specialization);
          if (typeof u.department === 'string') setDepartment(u.department);
        }
      } catch {
        // ignore
      }
    })();
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDesktop, setSidebarDesktop] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      {sidebarDesktop && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        {/* mobile toggle */}
        <button
          type="button"
          className="md:hidden mb-4 px-3 py-2 rounded border bg-white"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          Menú
        </button>

        {/* Botón flotante para colapsar sidebar (escritorio) */}
        <button
          type="button"
          onClick={() => setSidebarDesktop((v) => !v)}
          aria-label={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          title={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          className="hidden md:flex items-center justify-center fixed z-40 top-1/2 -translate-y-1/2 transform w-8 h-8 rounded-full border bg-white shadow"
          style={{ left: sidebarDesktop ? '15.5rem' : '0.5rem' }}
        >
          <span className="text-slate-700 text-lg">{sidebarDesktop ? '⟨' : '⟩'}</span>
        </button>

        <ProfileHeader name={name} role={specialty || department || 'Médico'} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Pacientes Hoy" value={8} />
          <StatCard title="Citas Completadas" value={5} />
          <StatCard title="Alertas" value={1} />
        </div>

        <section className="mt-8 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Agenda</h3>
          <p className="text-sm text-slate-600">Tu agenda del día con próximas consultas.</p>
        </section>

        <section className="mt-6 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Tratamientos recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {treatments.map((t) => (
              <div key={t.id} className="border rounded p-3 bg-slate-50">
                <div className="text-xs text-slate-500 mb-1">Paciente</div>
                <div className="text-sm">{t.patient || '-'}</div>
                <div className="text-xs text-slate-500 mt-2 mb-1">Tratamiento</div>
                <div className="text-sm">{t.treatment || '-'}</div>
              </div>
            ))}
            {treatments.length === 0 && <div className="text-slate-600">Sin tratamientos recientes</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MedicoDashboard;
