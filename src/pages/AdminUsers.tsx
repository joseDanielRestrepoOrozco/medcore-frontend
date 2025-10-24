import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

type User = {
  id: string;
  email: string;
  fullname: string;
  role: string;
  status: string;
  createdAt?: string;
};

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  MEDICO: 'Médico',
  ENFERMERA: 'Enfermera',
  PACIENTE: 'Paciente',
};

const roleOptions = ['ADMINISTRADOR', 'MEDICO', 'ENFERMERA'] as const;

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDesktop, setSidebarDesktop] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type Filter = 'TODOS' | 'ADMINISTRADOR' | 'MEDICO' | 'ENFERMERA';
  const [filter, setFilter] = useState<Filter>('TODOS');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let list: User[] = [];
      if (filter === 'TODOS') {
        const params: Record<string, unknown> = {};
        if (query.trim()) params.q = query.trim();
        const res = await api.get('/users', { params });
        list = (res.data?.users || []) as User[];
      } else {
        const params: Record<string, unknown> = { role: filter };
        if (query.trim()) params.q = query.trim();
        const res = await api.get('/users/by-role', { params });
        list = (res.data?.users || []) as User[];
      }
      // Filtra fuera pacientes por seguridad cuando es "TODOS"
      const sanitized = filter === 'TODOS'
        ? list.filter((u) => (u.role || '').toUpperCase() !== 'PACIENTE')
        : list;
      setUsers(sanitized);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const changeRole = async (id: string, role: string) => {
    setSavingId(id);
    try {
      await api.put(`/users/${id}/role`, { role });
      await load();
    } catch {
      setError('No fue posible cambiar el rol');
    } finally {
      setSavingId(null);
    }
  };

  const tabs = useMemo(
    () => [
      { key: 'TODOS' as Filter, label: 'Todos' },
      { key: 'ADMINISTRADOR' as Filter, label: 'Administradores' },
      { key: 'MEDICO' as Filter, label: 'Médicos' },
      { key: 'ENFERMERA' as Filter, label: 'Enfermeras' },
    ],
    []
  );

  return (
    <div className="flex">
      {sidebarDesktop && (
        <div className="hidden md:block relative">
          <AdminSidebar active="usuarios" />
        </div>
      )}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="w-72 bg-white border-l min-h-full p-0 shadow-xl">
            <AdminSidebar active="usuarios" />
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        <button type="button" className="md:hidden mb-4 px-3 py-2 rounded border bg-white" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">Menú</button>
        {/* Botón flotante de colapso (escritorio) */}
        <button
          type="button"
          onClick={() => setSidebarDesktop((v) => !v)}
          aria-label={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          title={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          className="hidden md:flex items-center justify-center fixed z-40 top-1/2 -translate-y-1/2 transform w-8 h-8 rounded-full border bg-white shadow"
          style={{ left: sidebarDesktop ? '15.5rem' : '0.5rem' }}
        >
          <span className="text-slate-700 text-lg">{sidebarDesktop ? '⟨' : '⟩'}</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <a href="/dashboard/users/new" className="px-3 py-2 text-sm bg-slate-800 text-white rounded">Nuevo usuario</a>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
            placeholder="Buscar por nombre, correo o identificación..."
            className="w-full md:w-80 border rounded px-3 py-2"
          />
          <button onClick={load} className="px-3 py-2 border rounded bg-white">Buscar</button>
        </div>

        <div className="mt-4 inline-flex bg-white p-1 rounded-full border border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-sm ${filter === t.key ? 'bg-slate-800 text-white' : 'text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
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
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const role = (u.role || '').toUpperCase();
                  return (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-3">{u.fullname || '-'}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{ROLE_LABEL[role] || role}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : u.status === 'INACTIVE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.status === 'ACTIVE' ? 'ACTIVO' : u.status === 'INACTIVE' ? 'INACTIVO' : u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        {(role === 'MEDICO' || role === 'ENFERMERA') && (
                          <button
                            className="text-sm px-3 py-1 border rounded"
                            disabled={savingId === u.id}
                            onClick={async () => {
                              try {
                                setSavingId(u.id);
                                const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                if (role === 'MEDICO') await api.patch(`/users/doctors/status/${u.id}`, { status: newStatus });
                                if (role === 'ENFERMERA') await api.patch(`/users/nurses/status/${u.id}`, { status: newStatus });
                                await load();
                              } finally {
                                setSavingId(null);
                              }
                            }}
                          >
                            {u.status === 'ACTIVE' ? 'Inactivar' : 'Activar'}
                          </button>
                        )}
                        <a href={`/dashboard/users/${u.id}/edit`} className="text-sm px-3 py-1 border rounded inline-block">Editar</a>
                      </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
