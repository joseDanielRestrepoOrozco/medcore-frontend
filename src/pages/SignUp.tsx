import { useEffect, useState } from 'react';
import { signUp } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utils/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../components/InputField';
import { z } from 'zod';

// Validaciones mínimas en el frontend (solo requeridos). Las reglas
// de complejidad/edad las aplica el backend y se mostrarán como errores de campo.
const signUpSchema = z.object({
  fullname: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.string().email({ message: 'Correo inválido' }),
  currentPassword: z.string().min(1, { message: 'La contraseña es obligatoria' }).max(100, { message: 'Máximo 100 caracteres' }),
  dateOfBirth: z.string().min(1, { message: 'La fecha es obligatoria' }),
  documentNumber: z.string().min(1, { message: 'El documento es obligatorio' }),
});

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Bloquear acceso directo si no pasó por "Solicitar registro"
  useEffect(() => {
    const allowed = sessionStorage.getItem('signup_access') === 'granted';
    if (!allowed) navigate('/solicitar-registro', { replace: true });
  }, [navigate]);

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      currentPassword: '',
      fullname: '',
      dateOfBirth: '',
      documentNumber: '',
    },
    mode: 'onChange',
  });

  const errors = form.formState.errors as {
    fullname?: { message?: string };
    email?: { message?: string };
    currentPassword?: { message?: string };
    dateOfBirth?: { message?: string };
    documentNumber?: { message?: string };
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Normaliza fecha a YYYY-MM-DD si viene como DD/MM/YYYY (por localización visual)
      const dob = (() => {
        const v = String(data.dateOfBirth || '').trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
          const [dd, mm, yyyy] = v.split('/');
          return `${yyyy}-${mm}-${dd}`;
        }
        return v;
      })();

      // Creación de cuenta solo para ADMINISTRADOR
      await signUp({
        fullname: data.fullname,
        email: data.email,
        current_password: data.currentPassword,
        date_of_birth: dob,
        role: 'ADMINISTRADOR',
        documentNumber: data.documentNumber,
      });
      navigate('/verify', { state: { email: data.email } });
      form.reset();
      sessionStorage.removeItem('signup_access');
    } catch (err: unknown) {
      // Si el backend devolvió detalles de validación por campo (Zod), pintarlos en cada input
      const ax = err as {
        response?: { status?: number; data?: { error?: unknown; details?: Record<string, string[]> } };
      };
      const status = ax?.response?.status;
      const details = ax?.response?.data?.details;
      // const serverMsg = ax?.response?.data?.error as string | undefined;
      if (status === 400 && details && typeof details === 'object') {
        const prettify = (field: string, raw: string): string => {
          const m = String(raw || '').toLowerCase();
          // Mensajes específicos por campo (más claros para usuario)
          const required = (f: string) =>
            f === 'fullname' ? 'El nombre es obligatorio'
            : f === 'email' ? 'El correo es obligatorio'
            : f === 'current_password' ? 'La contraseña es obligatoria'
            : f === 'date_of_birth' ? 'La fecha es obligatoria'
            : 'Campo obligatorio';
          if (m.includes('expected string') || m.includes('received undefined') || m.includes('required')) {
            return required(field);
          }
          if (m.includes('invalid email')) return 'Correo inválido';
          if (m.includes('invalid date')) return 'Fecha inválida';
          if (m.includes('at least 6') || m.includes('al menos 6')) return 'La contraseña debe tener al menos 6 caracteres';
          // Si ya viene en español y entendible, úsalo
          return raw;
        };

        Object.entries(details).forEach(([field, messages]) => {
          const original = Array.isArray(messages) ? messages[0] : String(messages);
          const friendly = prettify(field, original);
          // Mapea nombres del backend -> nombres del formulario
          const map: Record<string, 'fullname' | 'email' | 'currentPassword' | 'dateOfBirth' | 'documentNumber'> = {
            fullname: 'fullname',
            email: 'email',
            current_password: 'currentPassword',
            date_of_birth: 'dateOfBirth',
            documentNumber: 'documentNumber',
          };
          const key = map[field];
          if (key) {
            form.setError(key, { type: 'server', message: friendly });
          }
        });
        // No mostrar mensaje superior técnico; dejamos solo mensajes por campo
        setError(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  });

  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-11rem)] bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Crear cuenta
        </h2>

        {error && (
          <div className="text-red-600 bg-red-100 rounded mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <InputField
            label="Nombre completo"
            name="fullname"
            placeholder="Nombre completo"
            register={form.register}
            error={errors.fullname?.message}
          />
          <InputField
            label="Número de documento"
            name="documentNumber"
            placeholder="Documento"
            register={form.register}
            error={errors.documentNumber?.message}
          />
          <InputField
            label="Correo electrónico"
            name="email"
            placeholder="Correo"
            type="email"
            register={form.register}
            error={errors.email?.message}
          />
          <label className="block mt-4">
            Contraseña
            <div className="relative">
              <input
                {...form.register('currentPassword')}
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                className={
                  'w-full px-4 py-3 pr-20 rounded-lg outline-none transition placeholder:text-left ' +
                  (errors.currentPassword?.message
                    ? 'border border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-300 '
                    : 'border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-400 ')
                }
                aria-invalid={Boolean(errors.currentPassword) || undefined}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-slate-600 hover:text-slate-800"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>
          {errors.currentPassword?.message && (
            <span className="block text-red-600 text-sm mt-1">
              {errors.currentPassword.message}
            </span>
          )}
          <label className="block mt-4">
            Fecha de nacimiento
            <input
              type="date"
              {...form.register('dateOfBirth')}
              className={
                'w-full px-4 py-3 rounded-lg outline-none transition ' +
                (errors.dateOfBirth?.message
                  ? 'border border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-300 '
                  : 'border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-400 ')
              }
              aria-invalid={Boolean(errors.dateOfBirth) || undefined}
            />
            {errors.dateOfBirth?.message && (
              <span className="block text-red-600 text-sm mt-1">
                {errors.dateOfBirth.message}
              </span>
            )}
          </label>
          <button
            type="submit"
            disabled={loading || !form.formState.isValid}
            className="w-full py-3 mt-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition"
          >
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <a
            href="/login"
            className="text-slate-800 font-semibold hover:underline"
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
