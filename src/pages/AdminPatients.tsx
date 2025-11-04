import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Patient = {
  id: string;
  fullname: string;
  email?: string;
  phone?: string;
  gender?: string;
  age: number;
  status: string;
  createdAt: string;
};

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const { token } = useAuth();

  const loadPatients = useCallback(
    async (searchQuery: string, currentPage: number) => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {
          limit: 10,
          page: currentPage,
        };
        if (searchQuery.trim()) params.q = searchQuery.trim();
        const res = await api.get('/users/patients', { params }).catch(async () => {
          const fallbackParams: Record<string, unknown> = { role: 'PACIENTE', limit: 10, page: currentPage };
          if (searchQuery.trim()) fallbackParams.q = searchQuery.trim();
          return api.get('/users/by-role', { params: fallbackParams });
        });

        const data = res.data as {
          patients?: Patient[];
          users?: Patient[];
          pagination?: { total?: number; totalPages?: number };
        };
        const list = (data.patients ?? data.users ?? []) as Patient[];
        const uniq: Record<string, Patient> = {};
        for (const p of list) uniq[p.id] = p;
        setPatients(Object.values(uniq));
        const pag = data.pagination;
        if (pag?.totalPages) setTotalPages(pag.totalPages);
        else if (pag?.total) setTotalPages(Math.ceil(pag.total / 10));
        else setTotalPages(1);
      } catch {
        setError('No se pudieron cargar los pacientes');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!token) return;
    loadPatients(query, page);
  }, [query, token, page, loadPatients]);

  const handleSearch = () => {
    setPage(1);
    loadPatients(query, 1);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-background min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Pacientes</h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Buscar por nombre o documento..."
          className="w-full md:w-80 border rounded px-3 py-2"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2 border rounded bg-white"
        >
          Buscar
        </button>
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
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{p.fullname}</td>
                  <td className="px-4 py-3">{p.email || '-'}</td>
                  <td className="px-4 py-3">{p.phone || '-'}</td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs
                        ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-slate-200 text-slate-700'
                        }
                      `}
                    >
                      {p.status === 'ACTIVE'
                        ? 'ACTIVO'
                        : p.status === 'PENDING'
                        ? 'PENDIENTE'
                        : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        onClick={() =>
                          navigate(`/dashboard/medical-history/${p.id}`)
                        }
                      >
                        Ver historial
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
                        onClick={() => navigate(`/admin/usuarios/${p.id}/edit`)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center gap-2 py-4 bg-white">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
