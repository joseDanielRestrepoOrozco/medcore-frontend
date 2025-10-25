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

type User = {
  id: string;
  email: string;
  fullname?: string;
  phone?: string;
  role?: string;
  status?: string;
  specialization?: string;
  department?: string;
  license_number?: string;
};

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleKey>('MEDICO');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE'|'INACTIVE'|'PENDING'>('ACTIVE');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/${id}`);
        const u = (res.data || null) as User | null;
        if (!u) {
          setError('Usuario no encontrado');
        } else {
          setUser(u);
          const r = ((u.role || 'MEDICO') as string).toUpperCase() as RoleKey;
          setRole(r);
          setEmail(u.email || '');
          setFullname(u.fullname || '');
          setPhone(u.phone || '');
          const st = ((u.status || 'ACTIVE') as string).toUpperCase();
          setStatus((st as 'ACTIVE' | 'INACTIVE' | 'PENDING'));
          setSpecialization(u.specialization || '');
          setDepartment(u.department || '');
          setLicense(u.license_number || '');
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
      if (role === 'MEDICO') {
        await api.put(`/users/doctors/${id}`, {
          email,
          fullname,
          phone,
          specialization,
          department,
          license_number: license,
        });
      } else if (role === 'ENFERMERA') {
        await api.put(`/users/nurses/${id}`, {
          email,
          fullname,
          phone,
          department,
        });
      } else {
        await api.put(`/users/${id}`, {
          email,
          fullname,
          phone,
          status,
        });
      }
      navigate('/admin/usuarios');
    } catch {
      setError('No se pudo actualizar el usuario');
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
            <input value={fullname} onChange={(e) => setFullname(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} className="w-full border rounded px-3 py-2">
              {(Object.keys(roleLabels) as RoleKey[]).map((k) => (
                <option key={k} value={k}>{roleLabels[k]}</option>
              ))}
            </select>
          </div>
          {role === 'MEDICO' && (
            <>
              <div>
                <label className="block text-sm font-medium">Especialización</label>
                <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Departamento</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Licencia</label>
                <input value={license} onChange={(e) => setLicense(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
            </>
          )}
          {role === 'ENFERMERA' && (
            <div>
              <label className="block text-sm font-medium">Departamento</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ACTIVE">ACTIVO</option>
              <option value="INACTIVE">INACTIVO</option>
              <option value="PENDING">PENDIENTE</option>
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
