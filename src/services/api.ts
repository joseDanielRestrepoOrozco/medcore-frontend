<<<<<<< Updated upstream
import axios from 'axios';

// Garantizar que el frontend SIEMPRE apunte al API Gateway en :3000
// y use el prefijo unificado "/api/v1/<prefijo>/..." (auth, users, patients, diagnostics)
const API_BASE = 'http://localhost:3000/api/v1' as const;

const api = axios.create({ baseURL: API_BASE });
=======
import { http } from '@/lib/http';
const api = http;
>>>>>>> Stashed changes

// Adjunta el token si existe y ajusta Content-Type para FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // Si se envía FormData, deja que el navegador ponga el boundary
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    // Axios/browsers establecerán multipart/form-data con boundary automáticamente
    delete (config.headers as Record<string, string>)['Content-Type'];
  }
  return config;
});

export default api;
