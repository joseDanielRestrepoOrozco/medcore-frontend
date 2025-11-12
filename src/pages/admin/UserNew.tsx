import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Specialty, Department } from '@/types';

type RoleKey = 'MEDICO' | 'ENFERMERA' | 'PACIENTE';

const roleLabels: Record<RoleKey, string> = {
  MEDICO: 'Médico',
  ENFERMERA: 'Enfermera',
  PACIENTE: 'Paciente',
};

const UserNew = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [role, setRole] = useState<RoleKey>('MEDICO');
  const [specialty, setSpecialty] = useState('');
  const [department, setDepartment] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Construir payload base (campos comunes para todos los roles)
      const payload: Record<string, unknown> = {
        fullname,
        email,
        documentNumber,
        current_password: currentPassword,
        date_of_birth: dateOfBirth,
        role: role, // Agregar el rol al payload
      };

      // Agregar campos opcionales si tienen valor
      if (phone) payload.phone = phone;
      if (gender) payload.gender = gender;

      // Determinar endpoint y agregar datos específicos según el rol
      let endpoint = '';

      if (role === 'MEDICO') {
        endpoint = '/users/doctors';
        // Solo agregar medico si hay valores válidos
        const medicoData: Record<string, string> = {};
        if (specialty) medicoData.specialty = specialty;
        if (licenseNumber) medicoData.license_number = licenseNumber;

        // Solo agregar el objeto medico si tiene al menos un campo
        if (Object.keys(medicoData).length > 0) {
          payload.medico = medicoData;
        }
      } else if (role === 'ENFERMERA') {
        endpoint = '/users/nurses';
        // Solo agregar enfermera si hay departamento válido
        if (department) {
          payload.enfermera = {
            department: department,
          };
        }
      } else if (role === 'PACIENTE') {
        endpoint = '/users/patients';
        // Agregar datos opcionales de paciente
        const pacienteData: Record<string, string> = {};
        if (address) pacienteData.address = address;

        // Solo agregar el objeto paciente si tiene campos
        if (Object.keys(pacienteData).length > 0) {
          payload.paciente = pacienteData;
        }
      }

      // Enviar al endpoint correcto
      await api.post(endpoint, payload);
      setSuccess(
        'Usuario creado exitosamente. Se ha enviado un código de verificación al correo.'
      );
      // Redirigir después de 2 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message ||
        'No se pudo crear el usuario';
      setError(errorMsg);
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
            onChange={e => setFullname(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre y apellido"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Número de documento *
          </label>
          <input
            value={documentNumber}
            onChange={e => setDocumentNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Cédula o documento de identidad"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Contraseña temporal
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Mínimo 6 caracteres con al menos 1 número"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Género</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required={role === 'PACIENTE'}
          >
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as RoleKey)}
            className="w-full border rounded px-3 py-2"
          >
            {(Object.keys(roleLabels) as RoleKey[]).map(k => (
              <option key={k} value={k}>
                {roleLabels[k]}
              </option>
            ))}
          </select>
        </div>

        {role === 'MEDICO' && (
          <>
            <div>
              <label className="block text-sm font-medium">
                Especialidad *
              </label>
              {loadingSpecialties ? (
                <div className="text-sm text-gray-500 py-2">
                  Cargando especialidades...
                </div>
              ) : (
                <>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Seleccione una especialidad...</option>
                    {specialties.map(spec => {
                      return (
                        <option key={spec.id} value={spec.name}>
                          {spec.name}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Número de licencia médica *
              </label>
              <input
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: 12345"
                required
              />
            </div>
          </>
        )}

        {role === 'ENFERMERA' && (
          <div>
            <label className="block text-sm font-medium">Departamento *</label>
            {loadingDepartments ? (
              <div className="text-sm text-gray-500 py-2">
                Cargando departamentos...
              </div>
            ) : (
              <>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccione un departamento...</option>
                  {departments.map(dept => {
                    return (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </div>
        )}

        {role === 'PACIENTE' && (
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Calle 123 #45-67"
            />
          </div>
        )}

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600 font-medium">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white rounded"
        >
          {loading ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
};

export default UserNew;
