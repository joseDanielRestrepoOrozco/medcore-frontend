import axios from 'axios';

// Base URL de la API. Preferimos VITE_API_BASE; si no existe, caemos a "/api/v1"
// que está proxied a http://localhost:3000 en vite.config.ts (dev) y funciona como
// path relativo en producción detrás del mismo dominio.
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const fromEnv = env?.VITE_API_BASE;
const API_BASE = fromEnv && fromEnv !== 'undefined' ? fromEnv : '/api/v1';

if (!fromEnv || fromEnv === 'undefined') {
  // Ayuda en dev para detectar configuración faltante
  console.warn('[medcore] VITE_API_BASE no está definido. Usando fallback "/api/v1".');
}

const api = axios.create({ baseURL: API_BASE });

// Adjunta el token si existe y ajusta Content-Type para FormData
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)[
      'Authorization'
    ] = `Bearer ${token}`;
  }
  // Si se envía FormData, deja que el navegador ponga el boundary
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    // Axios/browsers establecerán multipart/form-data con boundary automáticamente
    delete (config.headers as Record<string, string>)['Content-Type'];
  }
  return config;
});

export default api;
