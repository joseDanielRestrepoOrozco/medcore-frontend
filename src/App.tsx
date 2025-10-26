import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import Home from './pages/Home';
// import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPatients from './pages/AdminPatients';
import AdminImport from './pages/AdminImport';
import AdminUsers from './pages/AdminUsers';
import MedicoDashboard from './pages/MedicoDashboard';
import SolicitarRegistro from './pages/SolicitarRegistro';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import RoleRoute from './components/RoleRoute';
import RoleRedirect from './components/RoleRedirect';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import MedicalHistoryView from './pages/MedicalHistoryView';
import MedicalHistoryNew from './pages/MedicalHistoryNew';
import MedicalHistoryEdit from './pages/MedicalHistoryEdit';
import UsersDoctors from './pages/UsersDoctors';
import UsersNurses from './pages/UsersNurses';
import UserNew from './pages/UserNew';
import UserEdit from './pages/UserEdit';
import ForgotPassword from './pages/ForgotPassword';
import Documents from './pages/Documents';
import Agenda from './pages/Agenda';
import DoctorPatients from './pages/DoctorPatients';
import PatientHistory from './pages/PatientHistory';
import NurseDashboard from './pages/NurseDashboard';

const App = () => {
  const MainLayout: React.FC = () => {
    const { token } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
      try {
        return localStorage.getItem('sidebarCollapsed') === 'true';
      } catch {
        return false;
      }
    });
    // Control global para el overlay en móvil
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          {token && (
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => {
                setSidebarCollapsed(prev => {
                  const next = !prev;
                  try {
                    localStorage.setItem('sidebarCollapsed', String(next));
                  } catch {
                    // ignore storage errors
                  }
                  return next;
                });
              }}
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          <main className="flex-1 pt-0 pb-8">
            {/* Botón global móvil para abrir el sidebar cuando existe token */}
            {token && (
              <div className="md:hidden px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="mb-4 px-3 py-2 rounded border bg-white"
                  aria-label="Abrir menú"
                >
                  Menú
                </button>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/signup"
                element={
                  <GuestRoute redirectTo="/dashboard">
                    <SignUp />
                  </GuestRoute>
                }
              />
              <Route
                path="/solicitar-registro"
                element={
                  <GuestRoute redirectTo="/dashboard">
                    <SolicitarRegistro />
                  </GuestRoute>
                }
              />
              <Route
                path="/verify"
                element={
                  <GuestRoute redirectTo="/dashboard">
                    <VerifyEmail />
                  </GuestRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <GuestRoute redirectTo="/dashboard">
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute redirectTo="/dashboard">
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleRedirect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient"
                element={
                  <RoleRoute allowed={['PACIENTE', 'patient']}>
                    <PatientDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/enfermera"
                element={
                  <RoleRoute allowed={['ENFERMERA']}>
                    <NurseDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <AdminUsers />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/pacientes"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <AdminPatients />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/carga"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <AdminImport />
                  </RoleRoute>
                }
              />
              <Route
                path="/medico"
                element={
                  <RoleRoute allowed={['MEDICO', 'medico']}>
                    <MedicoDashboard />
                  </RoleRoute>
                }
              />
              {/* Vistas de Historia Clínica */}
              <Route
                path="/dashboard/medical-history/:patientId"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <MedicalHistoryView />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/medical-history/new"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <MedicalHistoryNew />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/medical-history/:id/edit"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <MedicalHistoryEdit />
                  </RoleRoute>
                }
              />
              {/* Vistas de gestión de usuarios */}
              <Route
                path="/dashboard/users/doctors"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UsersDoctors />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/users/nurses"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UsersNurses />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/users/new"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UserNew />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/users/:id/edit"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UserEdit />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/documents/:patientId"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'MEDICO', 'ENFERMERA']}>
                    <Documents />
                  </RoleRoute>
                }
              />
              <Route
                path="/dashboard/agenda"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <Agenda />
                  </RoleRoute>
                }
              />
              <Route
                path="/medico/pacientes"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <DoctorPatients />
                  </RoleRoute>
                }
              />
              <Route
                path="/patient/history"
                element={
                  <RoleRoute allowed={['PACIENTE', 'patient']}>
                    <PatientHistory />
                  </RoleRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true, // Para actualizaciones de estado
          v7_relativeSplatPath: true, // La resolución de rutas relativas en Splat
        }}
      >
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
