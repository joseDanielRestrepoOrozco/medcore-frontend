import axios from "axios";

// Lee cualquiera de las dos vars para evitar confusiones (BASE_URL vs BASE)
const rawBase =
  (import.meta as any).env?.VITE_API_BASE_URL ??
  (import.meta as any).env?.VITE_API_BASE ??
  "http://localhost:3000";
const base = String(rawBase).replace(/\/+$/, "");
const timeout = Number((import.meta as any).env?.VITE_CONN_TIMEOUT_MS || 6000);
const withCreds = String((import.meta as any).env?.VITE_HTTP_WITH_CREDENTIALS ?? "false") === "true";

export const http = axios.create({
  baseURL: base,
  withCredentials: withCreds,
  timeout,
});

// Inject Bearer token from localStorage if present
http.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      cfg.headers = cfg.headers ?? {};
      (cfg.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return cfg;
});

if (import.meta.env.VITE_DEBUG_HTTP === "true") {
  http.interceptors.request.use((cfg) => {
    // eslint-disable-next-line no-console
    console.debug("[HTTP]", cfg.method?.toUpperCase(), (cfg.baseURL ?? "") + (cfg.url ?? ""));
    return cfg;
  });
  http.interceptors.response.use(
    (res) => {
      // eslint-disable-next-line no-console
      console.debug("[HTTP:OK]", res.status, res.config.url);
      return res;
    },
    (err) => {
      // eslint-disable-next-line no-console
      console.debug("[HTTP:ERR]", err?.response?.status, err?.config?.url, err?.message);
      return Promise.reject(err);
    }
  );
}
