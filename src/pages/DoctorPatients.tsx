import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

type Patient = { id: string; firstName: string; lastName: string; email?: string };

const DoctorPatients = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [latest, setLatest] = useState<Record<string, { diagnosis?: string; treatment?: string }>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { limit: 50, page: 1 };
      if (q.trim()) params.q = q.trim();
      const res = await api.get('/patients', { params });
      const list = (res.data?.patients || []) as Patient[];
      setPatients(list);
      // cargar último diagnóstico por paciente (mejorable: endpoint batch)
      const map: Record<string, { diagnosis?: string; treatment?: string }> = {};
      for (const p of list) {
        try {
          const r = await api.get('/diagnostics/search', { params: { patientId: p.id } });
          const arr = (r.data?.diagnostics || []) as Array<any>;
          const last = arr[0] || null;
          map[p.id] = last ? { diagnosis: last.diagnosis, treatment: last.treatment } : {};
        } catch {
          // ignore
        }
      }
      setLatest(map);
    } catch {
      setError('No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') load(); }} placeholder="Buscar paciente…" className="border rounded px-3 py-2" />
          <button onClick={load} className="px-3 py-2 border rounded bg-white">Buscar</button>
        </div>
      </div>
      {loading && <div>Cargando…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.firstName} {p.lastName}</div>
                  <div className="text-sm text-slate-600">{p.email || '-'}</div>
                </div>
                <Link to={`/dashboard/medical-history/${p.id}`} className="px-3 py-1 border rounded text-sm">Ver historia</Link>
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="border rounded p-3 bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Último diagnóstico</div>
                  <div className="text-sm">{latest[p.id]?.diagnosis || '-'}</div>
                </div>
                <div className="border rounded p-3 bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Último tratamiento</div>
                  <div className="text-sm">{latest[p.id]?.treatment || '-'}</div>
                </div>
              </div>
            </div>
          ))}
          {patients.length === 0 && <div className="text-slate-600">Sin pacientes</div>}
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;

