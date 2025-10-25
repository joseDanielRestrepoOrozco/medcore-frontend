import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { getErrorMessage } from '../utils/error';
import { useAuth } from '../context/AuthContext';

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
  const [docs, setDocs] = useState<
    Array<{
      id: string;
      filename: string;
      mimeType?: string;
      fileSize?: number;
      createdAt?: string;
    }>
  >([]);
  const [preview, setPreview] = useState<{
    id: string;
    filename: string;
    mimeType?: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [msgDoc, setMsgDoc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [patient, setPatient] = useState<{
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    age?: number;
    state?: string;
  } | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        // Nueva fuente: /api/v1/diagnostics/search?patientId=...
        const res = await api.get(
          `/diagnostics/documents/patient/${patientId}`
        );
        const rawList = (res.data?.data || []) as Array<
          Record<string, unknown>
        >;
        const list = rawList.map(d => ({
          id: String(d['id'] || ''),
          date: String(d['diagnosticDate'] || d['createdAt'] || ''),
          doctorName: 'Médico',
          summary: String(d['description'] || ''),
          diagnosis: String(d['diagnosis'] || ''),
          treatment: String(d['treatment'] || ''),
        }));
        setEntries(list);
        // documentos adjuntos del paciente - mapear desde diagnosticDocuments
        try {
          // Extraer todos los documentos de los diagnósticos
          const allDocs: Array<Record<string, unknown>> = [];
          rawList.forEach(diagnostic => {
            const diagnosticDocs = diagnostic['documents'] as
              | Array<Record<string, unknown>>
              | undefined;
            if (diagnosticDocs && Array.isArray(diagnosticDocs)) {
              allDocs.push(...diagnosticDocs);
            }
          });

          setDocs(
            allDocs.map(d => ({
              id: String(d.id || ''),
              filename: String(d.filename || d.fileName || ''),
              mimeType: String(d.mimeType || d.fileType || ''),
              fileSize: Number(d.fileSize || 0),
              createdAt: d.createdAt ? String(d.createdAt) : undefined,
            }))
          );
        } catch (err) {
          console.debug(err);
        }
        // datos del paciente (nombre, edad, etc.)
        try {
          const rp = await api.get(`/users/patients/${patientId}`);
          const pdataRaw = (rp.data?.patient || rp.data) as Record<
            string,
            unknown
          > | null;
          const pdata = pdataRaw
            ? {
                id: String(pdataRaw['id'] || ''),
                firstName: String(
                  pdataRaw['firstName'] || pdataRaw['first_name'] || ''
                ),
                lastName: String(
                  pdataRaw['lastName'] || pdataRaw['last_name'] || ''
                ),
                email: String(pdataRaw['email'] || ''),
                phone: String(pdataRaw['phone'] || ''),
                gender: String(pdataRaw['gender'] || ''),
                age:
                  typeof pdataRaw['age'] === 'number'
                    ? (pdataRaw['age'] as number)
                    : pdataRaw['age']
                    ? Number(pdataRaw['age'])
                    : undefined,
                state: String(pdataRaw['state'] || ''),
              }
            : null;
          setPatient(pdata || null);
        } catch (err) {
          // muestra un mensaje suave si falla
          setMsgDoc(getErrorMessage(err as unknown));
        }
      } catch {
        setError('No se pudo cargar la historia clínica');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, token]);

  // Función para cargar el documento como blob
  const handlePreview = async (doc: {
    id: string;
    filename: string;
    mimeType?: string;
  }) => {
    try {
      setLoadingPreview(true);
      setPreview(doc);
      setPreviewUrl(null);

      // Descargar el archivo como blob con autenticación
      const response = await api.get(`/diagnostics/documents/${doc.id}`, {
        responseType: 'blob',
      });

      // Crear URL del blob
      const blob = new Blob([response.data], {
        type: doc.mimeType || 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error al cargar el documento:', err);
      setMsgDoc(getErrorMessage(err));
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Limpiar URL del blob cuando se cierra el modal
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex-1 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historia Clínica</h1>
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/medical-history/new${
              patientId ? `?patientId=${patientId}` : ''
            }`}
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
          {/* Encabezado con datos del paciente */}
          {patient && (
            <div className="bg-white border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-sm text-slate-600">
                    {patient.email || '-'}
                    {patient.phone ? ` • ${patient.phone}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {typeof patient.age === 'number' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border">
                      {patient.age} años
                    </span>
                  )}
                  {patient.gender && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border">
                      {patient.gender}
                    </span>
                  )}
                  {patient.state && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        patient.state === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {patient.state === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {entries.length === 0 && (
            <div className="bg-white border rounded p-4 text-slate-600">
              No hay registros para este paciente.
            </div>
          )}
          {entries.map(e => (
            <div key={e.id} className="bg-white border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{e.date || '-'}</div>
                  <div className="font-semibold">
                    {e.doctorName || 'Médico'}
                  </div>
                </div>
                <Link
                  to={`/dashboard/medical-history/${e.id}/edit`}
                  className="text-sm px-3 py-1 border rounded"
                >
                  Editar
                </Link>
              </div>
              {e.summary && <p className="mt-2 text-slate-700">{e.summary}</p>}
              {/* Cards de diagnóstico y tratamientos */}
              <div className="mt-3 grid md:grid-cols-2 gap-3">
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
          {/* Gestor de documentos adjuntos */}
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Documentos adjuntos</h3>
              <Link
                to={`/dashboard/documents/${patientId}`}
                className="text-sm px-3 py-1 border rounded"
              >
                Gestionar
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {docs.map(d => (
                <div
                  key={d.id}
                  className="border rounded p-3 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium truncate"
                      title={d.filename}
                    >
                      {d.filename}
                    </div>
                    <div className="text-xs text-slate-500">
                      {d.mimeType || ''}{' '}
                      {d.fileSize
                        ? `• ${(d.fileSize / 1024).toFixed(1)} KB`
                        : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePreview({
                          id: d.id,
                          filename: d.filename,
                          mimeType: d.mimeType,
                        })
                      }
                      className="text-sm px-3 py-1 border rounded"
                    >
                      Ver
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/diagnostics/documents/${d.id}`);
                          // Recargar documentos
                          const res = await api.get(
                            `/diagnostics/documents/patient/${patientId}`
                          );
                          const rawList = (res.data?.data || []) as Array<
                            Record<string, unknown>
                          >;
                          const allDocs: Array<Record<string, unknown>> = [];
                          rawList.forEach(diagnostic => {
                            const diagnosticDocs = diagnostic['documents'] as
                              | Array<Record<string, unknown>>
                              | undefined;
                            if (
                              diagnosticDocs &&
                              Array.isArray(diagnosticDocs)
                            ) {
                              allDocs.push(...diagnosticDocs);
                            }
                          });
                          setDocs(
                            allDocs.map(dd => ({
                              id: String(dd['id'] || ''),
                              filename: String(
                                dd['filename'] || dd['fileName'] || ''
                              ),
                              mimeType: String(
                                dd['mimeType'] || dd['fileType'] || ''
                              ),
                              fileSize: Number(dd['fileSize'] || 0),
                              createdAt: dd['createdAt']
                                ? String(dd['createdAt'])
                                : undefined,
                            }))
                          );
                        } catch (err) {
                          console.debug(err);
                          setMsgDoc(getErrorMessage(err));
                        }
                      }}
                      className="text-sm px-3 py-1 border rounded text-rose-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {docs.length === 0 && (
                <div className="text-slate-600">Sin documentos</div>
              )}
            </div>
            {/* Uploader rápido */}
            <div className="mt-4">
              <div
                role="button"
                tabIndex={0}
                onDragEnter={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'copy';
                  setDragOver(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                  const dropped = Array.from(e.dataTransfer.files || []);
                  if (dropped.length)
                    setNewFiles(prev => [...prev, ...dropped]);
                }}
                className={`mt-2 border-2 border-dashed rounded p-4 text-center transition ${
                  dragOver ? 'border-slate-800 bg-slate-50' : 'border-slate-300'
                }`}
              >
                Arrastra y suelta archivos aquí, o selecciona
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e =>
                    setNewFiles(prev => [
                      ...prev,
                      ...Array.from(e.target.files || []),
                    ])
                  }
                  className="sr-only"
                />
              </div>
              {newFiles.length > 0 && (
                <div className="mt-2">
                  <ul className="text-sm text-slate-600 list-disc list-inside">
                    {newFiles.map((f, i) => (
                      <li key={i}>
                        {f.name} ({(f.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={uploading}
                    onClick={async () => {
                      try {
                        setUploading(true);
                        setMsgDoc(null);
                        const fd = new FormData();
                        fd.append('patientId', patientId!);
                        newFiles.forEach(f =>
                          fd.append('documents', f, f.name)
                        );
                        await api.post('/diagnostics/documents/upload', fd);
                        setNewFiles([]);
                        // Recargar documentos
                        const res = await api.get(
                          `/diagnostics/documents/patient/${patientId}`
                        );
                        const rawList = (res.data?.data || []) as Array<
                          Record<string, unknown>
                        >;
                        const allDocs: Array<Record<string, unknown>> = [];
                        rawList.forEach(diagnostic => {
                          const diagnosticDocs = diagnostic['documents'] as
                            | Array<Record<string, unknown>>
                            | undefined;
                          if (diagnosticDocs && Array.isArray(diagnosticDocs)) {
                            allDocs.push(...diagnosticDocs);
                          }
                        });
                        setDocs(
                          allDocs.map(d => ({
                            id: String(d.id || ''),
                            filename: String(d.filename || d.fileName || ''),
                            mimeType: String(d.mimeType || d.fileType || ''),
                            fileSize: Number(d.fileSize || 0),
                            createdAt: d.createdAt
                              ? String(d.createdAt)
                              : undefined,
                          }))
                        );
                        setMsgDoc('Documentos subidos');
                      } catch (err) {
                        setMsgDoc(getErrorMessage(err));
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="mt-2 px-3 py-2 bg-slate-800 text-white rounded"
                  >
                    {uploading ? 'Subiendo…' : 'Subir'}
                  </button>
                  {msgDoc && (
                    <div className="mt-2 text-sm text-slate-600">{msgDoc}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal visor de documentos */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => {
            setPreview(null);
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
          }}
        >
          <div
            className="bg-white rounded-lg w-[90vw] h-[90vh] p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold truncate" title={preview.filename}>
                {preview.filename}
              </div>
              <button
                className="px-3 py-1 border rounded hover:bg-slate-100"
                onClick={() => {
                  setPreview(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
              >
                Cerrar
              </button>
            </div>
            {loadingPreview && (
              <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                <div className="text-slate-600">Cargando documento...</div>
              </div>
            )}
            {!loadingPreview && previewUrl && (
              <iframe
                src={previewUrl}
                title={preview.filename}
                className="w-full h-[calc(100%-3rem)] border rounded"
              />
            )}
            {!loadingPreview && !previewUrl && (
              <div className="flex items-center justify-center h-[calc(100%-3rem)]">
                <div className="text-red-600">
                  No se pudo cargar el documento
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryView;
