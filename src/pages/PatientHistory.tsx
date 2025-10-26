import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type Document = {
  id: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
};

type Entry = {
  id: string;
  when?: string;
  title?: string;
  diagnosis?: string;
  treatment?: string;
  symptoms?: string;
  notes?: string;
  documents?: Document[];
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const PatientHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Entry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMedicalHistory = useCallback(
    async (page: number) => {
      try {
        if (!user) return;
        setLoading(true);
        setError(null);
        const res = await api.get('/diagnostics/my-medical-history', {
          params: { page, limit: 5 },
        });
        const raw = (res.data?.data || []) as Array<Record<string, unknown>>;
        const arr = raw.map(d => ({
          id: String(d['id'] || ''),
          when: String(d['diagnosticDate'] || d['createdAt'] || ''),
          title: String(d['title'] || ''),
          diagnosis: String(d['diagnosis'] || ''),
          treatment: String(d['treatment'] || ''),
          symptoms: String(d['symptoms'] || ''),
          notes: String(d['notes'] || ''),
          documents: (
            (d['documents'] as Array<Record<string, unknown>>) || []
          ).map(doc => ({
            id: String(doc['id'] || ''),
            filename: String(doc['filename'] || ''),
            fileType: String(doc['fileType'] || ''),
            uploadedAt: String(doc['uploadedAt'] || ''),
          })),
        }));
        setList(arr);

        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Error al cargar historia clínica:', err);
        setError('No se pudo cargar tu historia clínica');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchMedicalHistory(currentPage);
  }, [currentPage, fetchMedicalHistory]);

  const handleDownloadDocument = async (
    documentId: string,
    filename: string
  ) => {
    try {
      const response = await api.get(`/diagnostics/documents/${documentId}`, {
        responseType: 'blob',
      });

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar documento:', err);
      alert('No se pudo descargar el documento');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mi Historia Clínica
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Aquí puedes ver todos tus registros médicos y documentos asociados
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando historia clínica...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {list.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                No tienes registros médicos aún
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Tus consultas médicas aparecerán aquí
              </p>
            </div>
          )}

          {list.map(entry => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {entry.title || 'Consulta médica'}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {entry.when
                        ? new Date(entry.when).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={
                      expandedId === entry.id ? 'Contraer' : 'Expandir'
                    }
                  >
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        expandedId === entry.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Síntomas */}
                  {entry.symptoms && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-blue-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-700">
                          Síntomas
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700">{entry.symptoms}</p>
                    </div>
                  )}

                  {/* Diagnóstico */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Diagnóstico
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {entry.diagnosis || '-'}
                    </p>
                  </div>

                  {/* Tratamiento */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 text-purple-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Tratamiento
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {entry.treatment || '-'}
                    </p>
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedId === entry.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Notas adicionales */}
                    {entry.notes && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <svg
                            className="w-5 h-5 text-yellow-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <h4 className="text-sm font-semibold text-gray-700">
                            Notas adicionales
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}

                    {/* Documentos */}
                    {entry.documents && entry.documents.length > 0 && (
                      <div>
                        <div className="flex items-center mb-3">
                          <svg
                            className="w-5 h-5 text-gray-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <h4 className="text-sm font-semibold text-gray-700">
                            Documentos adjuntos ({entry.documents.length})
                          </h4>
                        </div>
                        <div className="grid gap-2">
                          {entry.documents.map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <svg
                                  className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {doc.filename}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.fileType} •{' '}
                                    {new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleDownloadDocument(doc.id, doc.filename)
                                }
                                className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center flex-shrink-0"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Descargar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!entry.notes &&
                      (!entry.documents || entry.documents.length === 0) && (
                        <p className="text-sm text-gray-500 italic">
                          No hay información adicional disponible
                        </p>
                      )}
                  </div>
                )}
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

                {/* Botones de páginas */}
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map(pageNum => {
                  // Mostrar solo algunas páginas alrededor de la página actual
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
    </div>
  );
};

export default PatientHistory;
