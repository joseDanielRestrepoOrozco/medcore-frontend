import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type Entry = { id: string; when?: string; title?: string; diagnosis?: string; treatment?: string };

const PatientHistory = () => {
  const { user } = useAuth();
  const patientId = String(user?.id || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!patientId) return;
        setLoading(true);
        setError(null);
        const res = await api.get('/diagnostics/search', { params: { patientId } });
        const raw = (res.data?.diagnostics || []) as Array<Record<string, unknown>>;
        const arr = raw.map((d) => ({
          id: String(d['id'] || ''),
          when: String(d['diagnosticDate'] || d['createdAt'] || ''),
          title: String(d['title'] || ''),
          diagnosis: String(d['diagnosis'] || ''),
          treatment: String(d['treatment'] || ''),
        }));
        setList(arr);
      } catch {
        setError('No se pudo cargar tu historia clínica');
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Mi Historia Clínica</h1>
      {loading && <div className="mt-6">Cargando…</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="mt-6 space-y-3">
          {list.length === 0 && <div className="bg-white border rounded p-4 text-slate-600">Sin registros</div>}
          {list.map((e) => (
            <div key={e.id} className="bg-white border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{e.title || 'Consulta'}</div>
                <div className="text-sm text-slate-500">{e.when ? new Date(e.when).toLocaleString() : '-'}</div>
              </div>
              <div className="mt-2 grid md:grid-cols-2 gap-3">
                <div className="border rounded p-3 bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Diagnóstico</div>
                  <div className="text-sm">{e.diagnosis || '-'}</div>
                </div>
                <div className="border rounded p-3 bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Tratamiento</div>
                  <div className="text-sm">{e.treatment || '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;

