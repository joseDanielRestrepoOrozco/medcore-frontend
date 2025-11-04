import { useState } from 'react';
import { login } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/error';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
        <Card className="w-full rounded-xl lg:grid lg:grid-cols-2 lg:shadow-2xl overflow-hidden">
          {/* Panel izquierdo (branding) */}
          <div className="relative hidden items-center justify-center bg-[#005A9C]/10 p-12 lg:flex">
            <div
              className="absolute inset-0 z-0 opacity-10 bg-cover"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2O98oOG9-D2QnAYpXcLYjjrSVmWFZcwzVfbofzUdof4Bb3UGX-y8zmNs_oYuSggP4P9-ARpv7OkF0tajFROii9LTSFJTCyjXdEto40fOZ4HbyFHAbtlJwETsBUyUZflDPg-tS_ZZNJ2kcgniVDgUQ55IkExw3pCcEa9E9PKLakflANiYjAp4E4Vi2DVDN4DySA6ku2YCEPiit-z29jAofAov77C2Ej7bBXQWREsz7DVxmF2n3igZ4NR59mIfHFZUMKy2-gqyx1fE')",
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
          <CardContent className="flex w-full flex-col justify-center p-8 sm:p-12">
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-bold tracking-tight text-slate-900">Inicia sesión en Medcore</p>
              <p className="text-base text-slate-600">Accede de forma segura a tu panel.</p>
            </div>

            {error && (
              <div className="mt-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
              <label className="block">
                <span className="text-sm font-medium text-slate-900">Correo electrónico</span>
                <Input
                  {...form.register('email')}
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  aria-invalid={Boolean(errors.email) || undefined}
                />
                {errors.email?.message && (
                  <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span>
                )}
              </label>

              <label className="block">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-900">Contraseña</span>
                  <Link to="/forgot-password" className="text-sm font-medium text-[#005A9C] hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative mt-2">
                  <Input
                    {...form.register('currentPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    aria-invalid={Boolean(errors.currentPassword) || undefined}
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 my-1 mr-1"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}  
                  </Button>
                </div>
                {errors.currentPassword?.message && (
                  <span className="mt-1 block text-sm text-red-600">{errors.currentPassword.message}</span>
                )}
              </label>

              <Button type="submit" disabled={loading || !form.formState.isValid} className="w-full font-bold">
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link to="/solicitar-registro" className="font-medium text-[#005A9C] hover:underline">Solicitar acceso</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
