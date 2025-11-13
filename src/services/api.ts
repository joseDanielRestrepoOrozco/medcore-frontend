import { http } from "@/lib/http";
const api = http;

// Adjunta el token si existe y ajusta Content-Type para FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
  }
  // Si se envía FormData, deja que el navegador ponga el boundary
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData && config.headers) {
    // Axios/browsers establecerán multipart/form-data con boundary automáticamente
    delete (config.headers as Record<string, string>)["Content-Type"];
  }
  return config;
});

export default api;
