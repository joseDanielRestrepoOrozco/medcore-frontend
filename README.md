Frontend de MedCore listo para trabajar con el backend monolítico (`./backend`) y, más adelante, con microservicios.

Pasos rápidos:

1. Instalar dependencias del frontend

```bash
cd medcore-frontend
npm install
```

2. (Opcional) instalar tipos para TypeScript

```bash
npm install -D @types/react @types/react-dom @types/react-router-dom
```

2. Iniciar el backend en modo desarrollo (monolito)

```bash
cd ../backend
cp .env.example .env   # si aplica
export PORT=3000
export FRONTEND_ORIGIN=http://localhost:5173
npm install
npm run dev
```

3. Iniciar el frontend en modo desarrollo

```bash
 npm run dev
```

4. Configurar la URL del backend

Edita `.env` si tu backend corre en otro puerto o host. Por defecto está:

```
VITE_API_BASE=http://localhost:3000/api/v1
```

Descripción breve de rutas principales en el frontend:
- Autenticación y navegación: `/signup`, `/verify`, `/login`, `/dashboard`.
- Recuperación de acceso: `/forgot-password` (botón en login; pendiente de endpoint en backend).
- Administración de usuarios:
  - Listado: `/admin/usuarios` (usa `GET /api/v1/users` y `PUT /api/v1/users/:id/role`).
  - Doctores: `/dashboard/users/doctors` (usa `GET /api/v1/users?role=MEDICO`).
  - Enfermeras: `/dashboard/users/nurses` (usa `GET /api/v1/users?role=ENFERMERA`).
  - Alta: `/dashboard/users/new` (usa `POST /api/v1/users` con `currentPassword` y, si rol=MEDICO, `specialization`).
  - Edición (rol): `/dashboard/users/:id/edit` (usa `PUT /api/v1/users/:id/role`).
- Pacientes admin: `/admin/pacientes` (usa `GET /api/v1/patients`).
- Historia clínica (UI lista; endpoints se agregarán luego en backend):
  - Ver: `/dashboard/medical-history/:patientId`
  - Nueva: `/dashboard/medical-history/new`
  - Editar: `/dashboard/medical-history/:id/edit`

Verificación rápida de las vistas (QA manual):
- Si no quieres autenticarte, crea `medcore-frontend/.env.local` con `VITE_DISABLE_AUTH=true` y reinicia `npm run dev`.
- Historia clínica: abre `/dashboard/medical-history/TEST123`, `/dashboard/medical-history/new` y `/dashboard/medical-history/abc/edit`. Verás estados de carga/error si el backend aún no expone esos endpoints.
- Usuarios (requiere rol ADMINISTRADOR a menos que uses `VITE_DISABLE_AUTH=true`):
  - `/dashboard/users/doctors`, `/dashboard/users/nurses` para listados.
  - `/dashboard/users/new` para alta con Rol y Especialización (si Doctor).
  - `/dashboard/users/:id/edit` para cambiar rol.

Notas:
- El backend configura CORS para permitir `FRONTEND_ORIGIN=http://localhost:5173` por defecto.
- El token JWT se guarda en `localStorage` y se envía en `Authorization: Bearer <token>`.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
