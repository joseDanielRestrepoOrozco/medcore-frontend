import { useEffect, useState } from 'react';
import Sidebar from '../components/AdminSidebar';
import api from '../services/api';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  age: number;
  state: string;
  createdAt: string;
};

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sidebarDesktop, setSidebarDesktop] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const params: Record<string, unknown> = { limit: 20, page: 1 };
        if (query.trim()) params.q = query.trim();
        const res = await api.get('/patients', { params });
        const list = (res.data.patients || []) as Patient[];
        // deduplicar por id si el backend devolviera duplicados
        const uniq: Record<string, Patient> = {};
        for (const p of list) uniq[p.id] = p;
        setPatients(Object.values(uniq));
      } catch {
        setError('No se pudieron cargar los pacientes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex">
      {sidebarDesktop && (
        <div className="hidden md:block relative">
          <Sidebar active="pacientes" />
        </div>
      )}
      <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        {/* botón flotante para colapsar sidebar (escritorio) */}
        <button
          type="button"
          onClick={() => setSidebarDesktop((v) => !v)}
          aria-label={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          title={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          className="hidden md:flex items-center justify-center fixed z-40 top-1/2 -translate-y-1/2 transform w-8 h-8 rounded-full border bg-white shadow"
          style={{ left: sidebarDesktop ? '13.5rem' : '0.5rem' }}
        >
          <span className="text-slate-700 text-lg">{sidebarDesktop ? '⟨' : '⟩'}</span>
        </button>

        <h1 className="text-2xl font-bold mb-4">Pacientes</h1>
        <div className="mb-4 flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (async () => { setLoading(true); await (async () => { try { const params: Record<string, unknown> = { limit: 20, page: 1 }; if (query.trim()) params.q = query.trim(); const res = await api.get('/patients', { params }); const list = (res.data.patients || []) as Patient[]; const uniq: Record<string, Patient> = {}; for (const p of list) uniq[p.id] = p; setPatients(Object.values(uniq)); } catch { setError('No se pudieron cargar los pacientes'); } finally { setLoading(false); } })(); })(); }}
            placeholder="Buscar por nombre, correo o identificación..."
            className="w-full md:w-80 border rounded px-3 py-2"
          />
          <button onClick={() => { (async () => { setLoading(true); try { const params: Record<string, unknown> = { limit: 20, page: 1 }; if (query.trim()) params.q = query.trim(); const res = await api.get('/patients', { params }); const list = (res.data.patients || []) as Patient[]; const uniq: Record<string, Patient> = {}; for (const p of list) uniq[p.id] = p; setPatients(Object.values(uniq)); } catch { setError('No se pudieron cargar los pacientes'); } finally { setLoading(false); } })(); }} className="px-3 py-2 border rounded bg-white">Buscar</button>
        </div>
        {loading && <div>Cargando...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Teléfono</th>
                  <th className="text-left px-4 py-3">Edad</th>
                  <th className="text-left px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3">{p.email || '-'}</td>
                    <td className="px-4 py-3">{p.phone || '-'}</td>
                    <td className="px-4 py-3">{p.age}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${p.state === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                        {p.state === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatients;
