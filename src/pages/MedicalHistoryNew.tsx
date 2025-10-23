import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getErrorMessage } from '../utils/error';

const MedicalHistoryNew = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Consulta médica');
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patientId');
    if (pid) setPatientId(pid);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Construir FormData para /api/v1/diagnostics (alias sin :patientId)
      const fd = new FormData();
      fd.append('patientId', patientId);
      fd.append('title', title);
      fd.append('description', description || summary);
      fd.append('symptoms', symptoms);
      fd.append('diagnosis', diagnosis);
      fd.append('treatment', treatment);
      files.forEach((f) => fd.append('documents', f, f.name));

      await api.post('/diagnostics', fd);
      if (patientId) navigate(`/dashboard/medical-history/${patientId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Nueva consulta médica</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">ID Paciente</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="ID del paciente"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 h-20" placeholder="Descripción de la consulta" />
        </div>
        <div>
          <label className="block text-sm font-medium">Resumen / Motivo</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Motivo de consulta, hallazgos, etc."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Diagnóstico</label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej. Dermatitis atópica"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tratamiento</label>
            <input
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Indicaciones, medicamentos"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Adjuntar documentos (PDF/JPG/PNG)</label>
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
              {files.map((f, idx) => (
                <li key={idx}>{f.name} ({(f.size/1024).toFixed(1)} KB)</li>
              ))}
            </ul>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalHistoryNew;
