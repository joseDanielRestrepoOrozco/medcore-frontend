import { useState } from 'react';
import { login } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/error';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../components/InputField';

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();

  const schema = z.object({
    email: z.email({ message: 'Correo inválido' }),
    // La validación del backend solo requiere un string; relajamos la validación
    // para permitir contraseñas de pacientes/enfermeras que no cumplan el patrón.
    currentPassword: z.string().min(1, { message: 'Contraseña requerida' }).max(100, { message: 'Máximo 100 caracteres' }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', currentPassword: '' },
    mode: 'onChange',
  });

  const errors = form.formState.errors as {
    email?: { message?: string };
    currentPassword?: { message?: string };
  };

  const onSubmit = form.handleSubmit(async data => {
    setLoading(true);
    setError(null);
    try {
      const res = await login({
        email: data.email,
        current_password: data.currentPassword,
      });
      const token = res.data.token;
      const user = res.data.user;
      doLogin(token, user);
      const role = user.role;
      switch (role) {
        case 'ADMINISTRADOR':
          navigate('/admin');
          break;
        case 'PACIENTE':
          navigate('/patient');
          break;
        case 'MEDICO':
          navigate('/medico');
          break;
        default:
          navigate('/dashboard');
          break;
      }
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { error?: unknown } };
      };
      const status = ax?.response?.status;
      const raw = String(ax?.response?.data?.error || '');
      const msg = raw.toLowerCase();
      if (status === 401) {
        if (msg.includes('email no verificado')) {
          setError('Debes verificar tu correo antes de iniciar sesión.');
          form.setError('email', {
            type: 'server',
            message: 'Correo pendiente por verificación',
          });
        } else {
          setError('Correo o contraseña incorrectos.');
          form.setError('email', {
            type: 'server',
            message: 'Revisa tu correo',
          });
          form.setError('currentPassword', {
            type: 'server',
            message: 'Revisa tu contraseña',
          });
        }
      } else if (status === 400) {
        setError('Revisa los campos marcados.');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="relative flex min-h-[calc(100vh-11rem)] w-full items-center justify-center bg-[#F4F7FA]">
      <div className="w-full max-w-6xl px-4 lg:py-12">
        <div className="w-full rounded-xl bg-white lg:grid lg:grid-cols-2 lg:shadow-2xl">
          {/* Panel izquierdo (branding) */}
          <div className="relative hidden items-center justify-center overflow-hidden rounded-l-xl bg-[#005A9C]/10 p-12 lg:flex">
            <div
              className="absolute inset-0 z-0 opacity-10"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2O98oOG9-D2QnAYpXcLYjjrSVmWFZcwzVfbofzUdof4Bb3UGX-y8zmNs_oYuSggP4P9-ARpv7OkF0tajFROii9LTSFJTCyjXdEto40fOZ4HbyFHAbtlJwETsBUyUZflDPg-tS_ZZNJ2kcgniVDgUQ55IkExw3pCcEa9E9PKLakflANiYjAp4E4Vi2DVDN4DySA6ku2YCEPiit-z29jAofAov77C2Ej7bBXQWREsz7DVxmF2n3igZ4NR59mIfHFZUMKy2-gqyx1fE')",
                backgroundSize: 'cover',
              }}
            />
            <div className="z-10 flex flex-col items-center text-center">
              <svg className="h-12 w-auto text-[#005A9C]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM11 11H5V9H11V11ZM11 15H5V13H11V15ZM19 15H13V13H19V15ZM19 11H13V9H19V11Z" />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-slate-900">Medcore Sistemas de Salud</h2>
              <p className="mt-2 text-slate-600">Potenciamos a los profesionales de la salud con datos.</p>
            </div>
          </div>

          {/* Panel derecho (formulario) */}
          <div className="flex w-full flex-col justify-center p-8 sm:p-12">
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-bold tracking-tight text-slate-900">Inicia sesión en Medcore</p>
              <p className="text-base text-slate-600">Accede de forma segura a tu panel.</p>
            </div>
            {/* Nota removida por requerimiento */}

            {error && (
              <div className="mt-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
              <InputField
                label="Correo electrónico"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                register={form.register}
                error={errors.email?.message}
              />

              <label className="block">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-900">Contraseña</span>
                  <a href="/forgot-password" className="text-sm font-medium text-[#005A9C] hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative mt-2">
                  <input
                    {...form.register('currentPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    className={`w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:ring-2 ${
                      errors.currentPassword?.message ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-[#005A9C]/30'
                    }`}
                    aria-invalid={Boolean(errors.currentPassword) || undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-4 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {/* Mensaje de error real aparecerá arriba si aplica */}
              </label>

              <button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="flex w-full items-center justify-center rounded-lg bg-[#005A9C] px-5 py-3 text-base font-bold text-white hover:bg-[#005A9C]/90 focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:ring-offset-2"
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿No tienes cuenta?{' '}
              <a href="/solicitar-registro" className="font-medium text-[#005A9C] hover:underline">Solicitar acceso</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
