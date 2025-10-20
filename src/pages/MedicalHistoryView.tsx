import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

type HistoryEntry = {
  id: string;
  date?: string;
  doctorName?: string;
  summary?: string;
  diagnosis?: string;
  treatment?: string;
};

const MedicalHistoryView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/medical-history/patient/${patientId}`);
        const list = (res.data?.history || res.data?.entries || []) as HistoryEntry[];
        setEntries(list);
      } catch {
        setError('No se pudo cargar la historia clínica');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historia Clínica</h1>
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/medical-history/new${patientId ? `?patientId=${patientId}` : ''}`}
            className="px-3 py-2 text-sm bg-slate-800 text-white rounded"
          >
            Nueva consulta
          </Link>
        </div>
      </div>

      {loading && <div className="mt-6">Cargando...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {entries.length === 0 && (
            <div className="bg-white border rounded p-4 text-slate-600">
              No hay registros para este paciente.
            </div>
          )}
          {entries.map((e) => (
            <div key={e.id} className="bg-white border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{e.date || '-'}</div>
                  <div className="font-semibold">{e.doctorName || 'Médico'}</div>
                </div>
                <Link
                  to={`/dashboard/medical-history/${e.id}/edit`}
                  className="text-sm px-3 py-1 border rounded"
                >
                  Editar
                </Link>
              </div>
              {e.summary && <p className="mt-2 text-slate-700">{e.summary}</p>}
              {(e.diagnosis || e.treatment) && (
                <div className="mt-2 text-sm text-slate-600">
                  {e.diagnosis && <div><span className="font-medium">Dx:</span> {e.diagnosis}</div>}
                  {e.treatment && <div><span className="font-medium">Tx:</span> {e.treatment}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryView;
