% SPEC - MedCore Frontend

Fecha: 24 de octubre de 2025

Este documento adapta la especificación general del proyecto MedCore al repositorio `medcore-frontend`.

## Propósito

Proveer una descripción clara de los requerimientos frontend, criterios de aceptación, mapeo a archivos existentes y una checklist de tareas concretas para llevar la aplicación a un estado coherente con el enunciado provisto.

## Requerimientos clave (resumen)

- Landing page inicial (botón de registro deshabilitado)
- Acceso directo al formulario de login
- Login muestra errores
- Campo contraseña con toggle (mostrar/ocultar)
- Llegada de correo con estilos (templates básicos)
- Vista para ingresar código de verificación
- Dashboards por rol: administrador, paciente, médico
- Sidebar/slide bar con toggle funcional
- Cerrar sesión redirige a landing y limpia Application/Local storage
- Diseño responsive: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

## Criterios de aceptación (Frontend)

1. Login: cuando credenciales inválidas → mensaje de error visible.
2. Toggle de contraseña: alterna entre tipo `password` y `text` sin recargar.
3. Logout: al cerrar sesión se redirige a la landing y se borran las claves de navegación en `localStorage` y `sessionStorage`.
4. Verificación por código: existe una vista para ingresar el código recibido por email, con validación y mensajes de estado.
5. Dashboards: acceso controlado por rol; cada rol ve su dashboard específico después de autenticarse.
6. Responsive: comprobado visualmente en los 3 breakpoints principales.

## Mapeo de archivos existentes (estado actual)

Carpeta: `src/`

- `components/`
  - `AuthStatus.tsx` — estado/Auth UI (revisar logout). 
   - `Navbar.tsx`, `Sidebar.tsx` — elementos de navegación y slide bar.
  - `InputField.tsx` — componentes de formulario (posible lugar para toggle de contraseña).
  - `PatientImport.tsx`, `BulkImport.tsx` — carga masiva (UI). 
  - `ProtectedRoute.tsx`, `GuestRoute.tsx`, `RoleRoute.tsx` — control de acceso; revisar para asegurar redirecciones por rol.

- `context/AuthContext.tsx` — lógica de auth: login, logout, manejo de tokens y storage; aquí limpiar storage en logout.

- `pages/` (rutas/UX)
  - `Login.tsx` — formulario de acceso (mostrar errores, password toggle).
  - `VerifyEmail.tsx` — vista de verificación (ya existe, revisar flujo y mensajes).
  - `PatientDashboard.tsx`, `MedicoDashboard.tsx`, `AdminDashboard.tsx` — dashboards por rol.

## Checklist de implementación (priorizada)

1. SPEC file (este archivo) creado en repo frontend. ✓
2. Password visibility toggle
   - Lugar recomendado: `src/pages/Login.tsx` o `src/components/InputField.tsx` (añadir prop `type='password'` con control de visibility).
   - Criterio: icono/checkbox que alterna el type del input.
3. Logout que limpia storage
   - Implementar y verificar en `AuthContext.tsx` y `AuthStatus.tsx`.
   - Criterio: al hacer logout → `localStorage.clear()` (o eliminar keys específicas) + `sessionStorage.clear()` y redirección a `/`.
4. Login errors
   - Mostrar mensajes de error retornados por API en `Login.tsx`.
5. Verificación de código (email)
   - Revisar `pages/VerifyEmail.tsx`: validar UI y conectar con `services/auth.ts` para reintentos/submit.
6. Sidebar toggle
   - Revisar `Sidebar.tsx` — asegurar estado de open/close persistente opcionalmente en `localStorage`.
7. Dashboards por rol
   - Verificar `ProtectedRoute`, `RoleRoute` y `RoleRedirect.tsx` para garantizar rutas y redirecciones correctas por rol.
8. Responsive
   - Revisar `global.css` y Tailwind config; probar en tamaños 375px, 768px y 1280px.
9. Emails (templates)
   - Proveer templates básicos HTML (inline styles) en `services/auth.ts` o en backend mock. Frontend puede mostrar preview cuando se envía.

## Sugerencias de implementación técnica (rápidas)

- Password toggle: mantener control local en componente de login; no almacenar contraseñas en storage.
- Logout: eliminar sólo las keys de la app (por ejemplo `auth_token`, `user`) en vez de `clear()` total si hay otras apps en el mismo origen. Si es aplicación standalone, `clear()` es aceptable.
- Roles: usar un campo `role` en el payload del token JWT; `AuthContext` debe proveer `user` y `role`.
- Responsive: usar utilidades Tailwind ya presentes; revisar clases en componentes grandes (Sidebar, Navbar, DashboardCards).

## Tareas opcionales a corto plazo (valor alto / bajo riesgo)

- Añadir feedback visual al subir CSVs en `PatientImport.tsx`/`BulkImport.tsx` (progress, resultados por fila).
- Agregar pruebas unitarias simples para `AuthContext` y `Login` (Jest + React Testing Library).

## Cómo verificar localmente (propuesta)

1. Instalar dependencias

```bash
cd "./medcore-frontend"
npm install
```

2. Ejecutar en modo desarrollo

```bash
npm run dev
```

3. Pruebas manuales rápidas
- Abrir http://localhost:5173 (o el puerto que indique Vite)
- Verificar Login: introducir credenciales inválidas → ver mensajes de error.
- Toggle contraseña: comprobar icono/checkbox en el formulario.
- Logout: iniciar sesión (o mock), luego cerrar sesión y comprobar redirección y limpieza de storage.

## Próximos pasos recomendados (elige uno)

1. Implementar los cambios UI esenciales listados en la checklist (password toggle, logout, errores de login). Puedo aplicar los cambios directamente a los archivos señalados.
2. Crear pruebas unitarias mínimas para Login y AuthContext.
3. Preparar pequeñas historias/PRs por cada item de la checklist para revisión.

---

Si quieres, procedo ahora mismo a implementar los cambios de mayor prioridad (password toggle y logout + limpieza de storage) en este repo — dime si doy permiso para editar los archivos y si deseas que los commits sean pequeños y atómicos (recomendado).
