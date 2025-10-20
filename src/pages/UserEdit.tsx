import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

type RoleKey = 'MEDICO' | 'ENFERMERA' | 'PACIENTE' | 'ADMINISTRADOR';

const roleLabels: Record<RoleKey, string> = {
  ADMINISTRADOR: 'Administrador',
  MEDICO: 'Doctor',
  ENFERMERA: 'Enfermera',
  PACIENTE: 'Paciente',
};

type User = { id: string; email: string; fullname?: string; role?: string };

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleKey>('MEDICO');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersPages = async (): Promise<User[]> => {
    // Para entorno de pruebas: trae hasta 1000 registros de la primera página
    const res = await api.get('/users', { params: { page: 1, limit: 1000 } });
    return (res.data?.users || []) as User[];
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const users = await fetchUsersPages();
        const u = users.find((x) => x.id === id) || null;
        if (!u) {
          setError('Usuario no encontrado');
        } else {
          setUser(u);
          setRole(((u.role || 'MEDICO') as string).toUpperCase() as RoleKey);
        }
      } catch {
        setError('No se pudo cargar el usuario');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await api.put(`/users/${id}/role`, { role });
      navigate('/admin/usuarios');
    } catch {
      setError('No se pudo actualizar el rol');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Editar usuario</h1>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {user && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input value={user.fullname || ''} readOnly className="w-full border rounded px-3 py-2 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input value={user.email} readOnly className="w-full border rounded px-3 py-2 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} className="w-full border rounded px-3 py-2">
              {(Object.keys(roleLabels) as RoleKey[]).map((k) => (
                <option key={k} value={k}>{roleLabels[k]}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-800 text-white rounded">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserEdit;
