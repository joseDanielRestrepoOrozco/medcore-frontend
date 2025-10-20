import { useState } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      // Endpoint previsto; si aún no existe en el backend, mostrará un error amigable
      await api.post('/auth/forgot-password', { email });
      setMessage('Si tu correo existe, enviaremos instrucciones para restablecer tu contraseña.');
    } catch {
      setMessage('Si tu correo existe, enviaremos instrucciones para restablecer tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-11rem)] flex items-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>
        <p className="text-sm text-slate-600 mb-4">Ingresa tu correo y te enviaremos instrucciones.</p>
        {message && <div className="mb-3 p-3 rounded bg-emerald-100 text-emerald-700">{message}</div>}
        {error && <div className="mb-3 p-3 rounded bg-red-100 text-red-700">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full border rounded px-3 py-2"
            required
          />
          <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-slate-800 text-white rounded">
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
