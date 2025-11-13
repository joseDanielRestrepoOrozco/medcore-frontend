import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

type User = {
  id: string;
  fullname?: string;
  email: string;
  role?: string;
  status?: string;
  specialization?: string;
};

const UsersDoctors = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { token } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users/by-role', {
        params: { role: 'MEDICO' },
      });
      setUsers(res.data?.users || []);
    } catch {
      setError('No se pudieron cargar los médicos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, load]);

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctores</h1>
        <Link
          to="/dashboard/users/new"
          className="px-3 py-2 text-sm bg-slate-800 text-white rounded"
        >
          Nuevo usuario
        </Link>
      </div>

      {loading && <div className="mt-6">Cargando...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-6 bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Correo</th>
                <th className="text-left px-4 py-3">Especialidad</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{u.fullname || '-'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.specialization || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : u.status === 'INACTIVE'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {u.status === 'ACTIVE'
                        ? 'ACTIVO'
                        : u.status === 'INACTIVE'
                        ? 'INACTIVO'
                        : u.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="text-sm px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                      disabled={savingId === u.id}
                      onClick={async () => {
                        try {
                          setSavingId(u.id);
                          await api.patch(`/users/doctors/status/${u.id}`);
                          await load();
                        } catch (err) {
                          console.error('Error al cambiar estado:', err);
                          setError('No se pudo cambiar el estado del médico');
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    >
                      {savingId === u.id
                        ? 'Cambiando...'
                        : u.status === 'ACTIVE'
                        ? 'Desactivar'
                        : 'Activar'}
                    </button>
                    <Link
                      to={`/dashboard/users/${u.id}/edit`}
                      className="text-sm px-3 py-1 border rounded inline-block hover:bg-slate-50"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersDoctors;
