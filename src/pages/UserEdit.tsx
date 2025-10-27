import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import type { Specialty, Department } from '../types';

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
  documentNumber?: string;
  date_of_birth?: string;
  gender?: string;
  medico?: {
    specialtyId?: string;
    license_number?: string;
  };
  enfermera?: {
    departmentId?: string;
  };
  paciente?: {
    address?: string;
  };
};

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleKey>('MEDICO');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [license, setLicense] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para especialidades y departamentos
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Cargar especialidades cuando el rol es MEDICO
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (role !== 'MEDICO') {
        setSpecialties([]);
        return;
      }
      setLoadingSpecialties(true);
      try {
        const response = await api.get<Specialty[]>('/specialties');
        const specialtiesList = Array.isArray(response.data)
          ? response.data
          : [];
        setSpecialties(specialtiesList);
      } catch (err) {
        console.error('Error cargando especialidades:', err);
        setSpecialties([]);
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, [role]);

  // Cargar departamentos cuando el rol es ENFERMERA
  useEffect(() => {
    const fetchDepartments = async () => {
      if (role !== 'ENFERMERA') {
        setDepartments([]);
        return;
      }
      setLoadingDepartments(true);
      try {
        const response = await api.get<Department[]>('/departments');
        const departmentsList = Array.isArray(response.data)
          ? response.data
          : [];
        setDepartments(departmentsList);
      } catch (err) {
        console.error('Error cargando departamentos:', err);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [role]);

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
          setDocumentNumber(u.documentNumber || '');
          setGender(u.gender || '');

          // Convertir date_of_birth a formato YYYY-MM-DD para input type="date"
          if (u.date_of_birth) {
            const date = new Date(u.date_of_birth);
            const formattedDate = date.toISOString().split('T')[0];
            setDateOfBirth(formattedDate);
          }

          // Cargar datos según el rol
          if (r === 'MEDICO' && u.medico) {
            setSpecialization(u.medico.specialtyId || '');
            setLicense(u.medico.license_number || '');
          } else if (r === 'ENFERMERA' && u.enfermera) {
            setDepartment(u.enfermera.departmentId || '');
          } else if (r === 'PACIENTE' && u.paciente) {
            setAddress(u.paciente.address || '');
          }
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
      // Construir payload solo con campos que tienen valor
      const payload: Record<string, unknown> = {};

      // Campos básicos (solo si tienen valor)
      if (email && email !== user?.email) payload.email = email;
      if (fullname && fullname !== user?.fullname) payload.fullname = fullname;
      if (phone && phone !== user?.phone) payload.phone = phone;
      if (documentNumber && documentNumber !== user?.documentNumber)
        payload.documentNumber = documentNumber;
      if (gender && gender !== user?.gender) payload.gender = gender;
      if (dateOfBirth && dateOfBirth !== user?.date_of_birth) {
        // Convertir la fecha a formato ISO DateTime
        payload.date_of_birth = new Date(dateOfBirth).toISOString();
      }

      if (role === 'MEDICO') {
        // Solo agregar objeto medico si hay cambios con valores válidos
        const medicoData: Record<string, string> = {};

        if (specialization && specialization.trim()) {
          medicoData.specialtyId = specialization.trim();
        }
        if (license && license.trim()) {
          medicoData.license_number = license.trim();
        }

        // Solo agregar medico si tiene al menos un campo
        if (Object.keys(medicoData).length > 0) {
          payload.medico = medicoData;
        }

        await api.put(`/users/doctors/${id}`, payload);
      } else if (role === 'ENFERMERA') {
        // Solo agregar enfermera si hay departamento válido
        if (department && department.trim()) {
          payload.enfermera = {
            departmentId: department.trim(),
          };
        }

        await api.put(`/users/nurses/${id}`, payload);
      } else if (role === 'PACIENTE') {
        // Para pacientes, agregar dirección si existe
        if (address && address.trim()) {
          payload.paciente = {
            address: address.trim(),
          };
        }
        await api.put(`/users/patients/${id}`, payload);
      } else {
        // Para administradores
        await api.put(`/users/${id}`, payload);
      }

      navigate('/admin/usuarios');
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message ||
        'No se pudo actualizar el usuario';
      setError(errorMsg);
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
            <input
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Número de documento
            </label>
            <input
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Número de identificación"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Género</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as RoleKey)}
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              disabled
            >
              {(Object.keys(roleLabels) as RoleKey[]).map(k => (
                <option key={k} value={k}>
                  {roleLabels[k]}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              El rol no se puede modificar una vez creado el usuario
            </p>
          </div>
          {role === 'MEDICO' && (
            <>
              <div>
                <label className="block text-sm font-medium">
                  Especialización
                </label>
                {loadingSpecialties ? (
                  <div className="text-sm text-gray-500 py-2">
                    Cargando especialidades...
                  </div>
                ) : (
                  <select
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Seleccione una especialidad...</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Licencia</label>
                <input
                  value={license}
                  onChange={e => setLicense(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Número de licencia médica"
                />
              </div>
            </>
          )}
          {role === 'ENFERMERA' && (
            <div>
              <label className="block text-sm font-medium">Departamento</label>
              {loadingDepartments ? (
                <div className="text-sm text-gray-500 py-2">
                  Cargando departamentos...
                </div>
              ) : (
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccione un departamento...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {role === 'PACIENTE' && (
            <div>
              <label className="block text-sm font-medium">Dirección</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="Dirección del paciente"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-slate-800 text-white rounded"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserEdit;
