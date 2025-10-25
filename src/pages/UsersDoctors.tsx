import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type User = {
  id: string;
  fullname?: string;
  email: string;
  role?: string;
  specialization?: string;
};

const UsersDoctors = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return; // espere a tener token
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/users/by-role', { params: { role: 'MEDICO' } });
        setUsers(res.data?.users || []);
      } catch {
        setError('No se pudieron cargar los médicos');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Doctores</h1>
          <Link to="/dashboard/users/new" className="px-3 py-2 text-sm bg-slate-800 text-white rounded">
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
                  <th className="text-left px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">{u.fullname || '-'}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.specialization || '-'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/users/${u.id}/edit`} className="text-sm px-3 py-1 border rounded">
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
