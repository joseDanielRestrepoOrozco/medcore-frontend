import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Diagnostic } from '../types/Diagnostic';

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const MedicalHistoryView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Diagnostic[]>([]);
  const [preview, setPreview] = useState<{
    id: string;
    filename: string;
    mimeType?: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
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
  const { token, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const load = useCallback(
    async (page: number = 1) => {
      if (!token) return;
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/diagnostics/documents/patient/${patientId}`,
          {
            params: { page, limit: 5 },
          }
        );
        setEntries(res.data?.data || []);

        if (res.data?.pagination) {
          setPagination(res.data.pagination);
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
        } catch {
          // muestra un mensaje suave si falla
        }
      } catch {
        setError('No se pudo cargar la historia clínica');
      } finally {
        setLoading(false);
      }
    },
    [patientId, token]
  );

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

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
          {user?.role !== 'ADMINISTRADOR' && (
            <Link
              to={`/dashboard/medical-history/new${
                patientId ? `?patientId=${patientId}` : ''
              }`}
              className="px-3 py-2 text-sm bg-slate-800 text-white rounded"
            >
              Nueva consulta
            </Link>
          )}
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
                          : patient.state === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {patient.state === 'ACTIVE'
                        ? 'ACTIVO'
                        : patient.state === 'PENDING'
                        ? 'PENDIENTE'
                        : 'INACTIVO'}
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
                  <div className="text-sm text-slate-500">
                    {e.diagnosticDate
                      ? new Date(e.diagnosticDate).toLocaleDateString()
                      : '-'}
                  </div>
                  <div className="font-semibold">
                    {e.title || 'Consulta médica'}
                  </div>
                </div>
                {user?.role !== 'ADMINISTRADOR' && (
                  <Link
                    to={`/dashboard/medical-history/${e.id}/edit`}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Editar
                  </Link>
                )}
              </div>
              {e.description && (
                <p className="mt-2 text-slate-700">{e.description}</p>
              )}
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
              {/* Documentos del diagnóstico */}
              <div className="mt-4">
                <div className="font-semibold mb-2 text-sm">Documentos</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {e.documents && e.documents.length > 0 ? (
                    e.documents.map(d => (
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
                                await api.delete(
                                  `/diagnostics/documents/${d.id}`
                                );
                                // Recargar la página actual
                                await load(currentPage);
                              } catch {
                                // Error al eliminar documento
                              }
                            }}
                            className="text-sm px-3 py-1 border rounded text-rose-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600">Sin documentos</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPreviousPage}
              className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                pagination.hasPreviousPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentPage(prev =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={!pagination.hasNextPage}
              className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                pagination.hasNextPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span>{' '}
                registros
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                    pagination.hasPreviousPage
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map(pageNum => {
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 &&
                      pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === pagination.page
                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage(prev =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                    pagination.hasNextPage
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
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
