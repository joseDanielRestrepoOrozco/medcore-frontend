import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type RoleKey = 'MEDICO' | 'ENFERMERA' | 'PACIENTE';

const roleLabels: Record<RoleKey, string> = {
  MEDICO: 'Doctor',
  ENFERMERA: 'Enfermera',
  PACIENTE: 'Paciente',
};

const UserNew = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleKey>('MEDICO');
  const [specialization, setSpecialization] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        fullname,
        email,
        role,
        current_password: currentPassword,
        date_of_birth: dateOfBirth,
      };
      if (role === 'MEDICO') payload.specialization = specialization;
      await api.post('/users', payload);
      navigate('/admin/usuarios');
    } catch {
      setError('No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Registrar nuevo usuario</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre y apellido"
            required
          />
        </div>
      <div>
        <label className="block text-sm font-medium">Contraseña temporal</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Contraseña inicial del usuario"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Fecha de nacimiento</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleKey)}
            className="w-full border rounded px-3 py-2"
          >
            {(Object.keys(roleLabels) as RoleKey[]).map((k) => (
              <option key={k} value={k}>{roleLabels[k]}</option>
            ))}
          </select>
        </div>
        {role === 'MEDICO' && (
          <div>
            <label className="block text-sm font-medium">Especialización</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccione...</option>
              <option value="MEDICINA_GENERAL">Medicina General</option>
              <option value="CARDIOLOGIA">Cardiología</option>
              <option value="DERMATOLOGIA">Dermatología</option>
              <option value="PEDIATRIA">Pediatría</option>
              <option value="GINECOLOGIA">Ginecología</option>
              <option value="NEUROLOGIA">Neurología</option>
            </select>
          </div>
        )}
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded">
          {loading ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
};

export default UserNew;
