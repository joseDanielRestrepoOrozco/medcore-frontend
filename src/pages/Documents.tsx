import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

type Doc = { id: string; filename: string; storedFilename?: string; fileType?: string; mimeType?: string; fileSize?: number; createdAt?: string };

const Documents = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [list, setList] = useState<Doc[]>([]);
  const [preview, setPreview] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/documents/patient/${patientId}`);
      const docs = (res.data?.documents || res.data || []) as Doc[];
      setList(docs);
    } catch {
      setError('No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  // load depends on patientId; keep as-is but silence exhaustive-deps which would require
  // wrapping load in useCallback or moving it inside the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [patientId]);

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      setList((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // ignore
    }
  };

  const fileUrl = (id: string) => `${location.origin.replace(/:\d+$/, ':3000')}/api/v1/documents/${id}`;
  const download = (id: string) => window.open(fileUrl(id), '_blank');

  return (
    <>
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Documentos del paciente</h1>
      {loading && <div className="mt-4">Cargando...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="mt-4 bg-white border rounded-xl overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">Archivo</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Tamaño</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3">{d.filename}</td>
                  <td className="px-4 py-3">{d.mimeType || d.fileType || '-'}</td>
                  <td className="px-4 py-3">{d.fileSize ? `${(d.fileSize/1024).toFixed(1)} KB` : '-'}</td>
                  <td className="px-4 py-3">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => setPreview(d)} className="px-3 py-1 border rounded">Ver</button>
                    <button onClick={() => download(d.id)} className="px-3 py-1 border rounded">Descargar</button>
                    <button onClick={() => onDelete(d.id)} className="px-3 py-1 border rounded text-rose-600">Eliminar</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-600">Sin documentos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    {/* Modal visor */}
    {preview && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setPreview(null)}>
        <div className="bg-white rounded-lg w-[90vw] h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">{preview.filename}</div>
            <button className="px-3 py-1 border rounded" onClick={() => setPreview(null)}>Cerrar</button>
          </div>
          <div className="w-full h-full border">
            <object data={fileUrl(preview.id)} type={preview.mimeType || 'application/pdf'} className="w-full h-full">
              <iframe src={fileUrl(preview.id)} title="preview" className="w-full h-full" />
            </object>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Documents;
