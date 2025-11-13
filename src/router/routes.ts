export const ROUTES = {
  auth: {
    login: "/login",
    signup: "/signup",
    request: "/solicitar-registro",
    profile: "/perfil",
  },
  misc: {
    home: "/",
    documents: "/documents",
  },
  doctor: {
    root: "/doctor",
    dashboard: "/doctor",
    agenda: "/doctor/agenda",
    citas: "/doctor/citas",
    disponibilidad: "/doctor/disponibilidad",
    cola: "/doctor/cola",
    ajustes: "/doctor/ajustes",
  },
  patient: {
    root: "/patient",
    dashboard: "/patient",
    citas: "/patient/citas",
    mhNew: "/patient/historia/new",
    mhEdit: (id = ":id") => `/patient/historia/${id}/edit`,
    mhView: (id = ":id") => `/patient/historia/${id}`,
  },
  admin: {
    root: "/admin",
    dashboard: "/admin",
    usuarios: "/admin/usuarios",
    import: "/admin/import",
    userEdit: (id = ":id") => `/admin/usuarios/${id}/edit`,
    userNew: "/admin/usuarios/new",
    doctors: "/admin/doctors",
    nurses: "/admin/nurses",
    status: "/admin/status",
  },
} as const;

export type AppRoute = typeof ROUTES;
