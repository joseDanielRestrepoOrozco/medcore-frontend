import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import Login from './pages/auth/Login';
import Home from './pages/misc/Home';
// import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPatients from './pages/admin/AdminPatients';
import AdminImport from './pages/admin/AdminImport';
import AdminUsers from './pages/admin/AdminUsers';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import SolicitarRegistro from './pages/auth/SolicitarRegistro';
import Profile from './pages/auth/Profile';
import Settings from './pages/doctor/Settings';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import RoleRoute from './components/RoleRoute';
import RoleRedirect from './components/RoleRedirect';
import Navbar from './components/Navbar';
<<<<<<< Updated upstream
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

const App = () => {
=======
import AppSidebar from './components/AppSidebar';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import MedicalHistoryView from './pages/patient/MedicalHistoryView';
import MedicalHistoryNew from './pages/patient/MedicalHistoryNew';
import MedicalHistoryEdit from './pages/patient/MedicalHistoryEdit';
import UsersDoctors from './pages/admin/UsersDoctors';
import UsersNurses from './pages/admin/UsersNurses';
import UserNew from './pages/admin/UserNew';
import UserEdit from './pages/admin/UserEdit';
import ForgotPassword from './pages/auth/ForgotPassword';
import Documents from './pages/misc/Documents';
import DoctorAgenda from './pages/doctor/DoctorAgenda';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PatientHistory from './pages/patient/PatientHistory';
import NurseDashboard from './pages/nurse/NurseDashboard';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorQueue from './pages/doctor/DoctorQueue';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientNewAppointment from './pages/patient/PatientNewAppointment';
import Status from './pages/auth/Status';
import { useMediaQuery, useTheme } from '@mui/material';

const App = () => {
  const MainLayout: React.FC = () => {
    const { token } = useAuth();
    const [collapsed, setCollapsed] = useState<boolean>(() => {
      try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
    });

    // persist collapsed (desktop)
    useEffect(() => {
      try { localStorage.setItem('sidebarCollapsed', String(collapsed)); } catch  (e){console.error(e);}
    }, [collapsed]);  

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="fixed inset-x-0 top-0 z-40 h-16 border-b bg-white">
          <div className="h-16">
            <Navbar onMenuClick={() => setCollapsed(true)} />
          </div>
        </header>
        <div className="flex pt-16">
          {token && (
              <AppSidebar
                variant={isMobile ? "mobile" : "desktop"}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(v => !v)}
              />
          )}
          <main
            className={[
              'flex-1 min-w-0 transition-[margin] duration-200',
              token
                ? (collapsed
                    ? 'md:ml-[var(--sidebar-w-icon)]'
                    : 'md:ml-64 xl:ml-[var(--sidebar-w)]')
                : 'ml-0',
              'ml-0', // mobile overlay doesn't push content
            ].join(' ')}
          >
            <div className="py-6">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/status" element={<Status />} />
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
                path="/admin/usuarios/new"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UserNew />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/usuarios/:id/edit"
                element={
                  <RoleRoute allowed={['ADMINISTRADOR', 'admin']}>
                    <UserEdit />
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
                    <DoctorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/medico/citas"
                element={
                  <RoleRoute allowed={['MEDICO', 'medico']}>
                    <DoctorAppointments />
                  </RoleRoute>
                }
              />
              <Route
                path="/medico/disponibilidad"
                element={
                  <RoleRoute allowed={['MEDICO', 'medico']}>
                    <DoctorAvailability />
                  </RoleRoute>
                }
              />
              <Route
                path="/medico/cola"
                element={
                  <RoleRoute allowed={['MEDICO', 'medico']}>
                    <DoctorQueue />
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
                path="/medico/agenda"
                element={
                  <RoleRoute allowed={['MEDICO', 'ADMINISTRADOR']}>
                    <DoctorAgenda />
                  </RoleRoute>
                }
              />
              {/* Rutas de enfermería */}
              <Route
                path="/enfermera/agenda"
                element={
                  <RoleRoute allowed={['ENFERMERA']}>
                    <div className="p-6">Agenda enfermería</div>
                  </RoleRoute>
                }
              />
              <Route
                path="/enfermera/pacientes"
                element={
                  <RoleRoute allowed={['ENFERMERA']}>
                    <div className="p-6">Pacientes</div>
                  </RoleRoute>
                }
              />
              <Route
                path="/enfermera/cola"
                element={
                  <RoleRoute allowed={['ENFERMERA']}>
                    <div className="p-6">Sala de espera</div>
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
              <Route
                path="/patient/appointments"
                element={
                  <RoleRoute allowed={['PACIENTE', 'patient']}>
                    <PatientAppointments />
                  </RoleRoute>
                }
              />
              <Route
                path="/patient/appointments/new"
                element={
                  <RoleRoute allowed={['PACIENTE', 'patient']}>
                    <PatientNewAppointment />
                  </RoleRoute>
                }
              />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    );
  };

>>>>>>> Stashed changes
  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

    <main className="flex-1 pt-0 pb-8">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<GuestRoute redirectTo="/dashboard"><SignUp /></GuestRoute>} />
            <Route path="/solicitar-registro" element={<GuestRoute redirectTo="/dashboard"><SolicitarRegistro /></GuestRoute>} />
            <Route path="/verify" element={<GuestRoute redirectTo="/dashboard"><VerifyEmail /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute redirectTo="/dashboard"><Login /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute redirectTo="/dashboard"><ForgotPassword /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/patient" element={<RoleRoute allowed={['PACIENTE','patient']}><PatientDashboard /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/usuarios" element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><AdminUsers /></RoleRoute>} />
            <Route path="/admin/pacientes" element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><AdminPatients /></RoleRoute>} />
            <Route path="/admin/carga" element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><AdminImport /></RoleRoute>} />
            <Route path="/medico" element={<RoleRoute allowed={['MEDICO','medico']}><MedicoDashboard /></RoleRoute>} />
            {/* Vistas de Historia Clínica */}
            <Route
              path="/dashboard/medical-history/:patientId"
              element={<RoleRoute allowed={['MEDICO','ADMINISTRADOR']}><MedicalHistoryView /></RoleRoute>}
            />
            <Route
              path="/dashboard/medical-history/new"
              element={<RoleRoute allowed={['MEDICO','ADMINISTRADOR']}><MedicalHistoryNew /></RoleRoute>}
            />
            <Route
              path="/dashboard/medical-history/:id/edit"
              element={<RoleRoute allowed={['MEDICO','ADMINISTRADOR']}><MedicalHistoryEdit /></RoleRoute>}
            />
            {/* Vistas de gestión de usuarios */}
            <Route
              path="/dashboard/users/doctors"
              element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><UsersDoctors /></RoleRoute>}
            />
            <Route
              path="/dashboard/users/nurses"
              element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><UsersNurses /></RoleRoute>}
            />
            <Route
              path="/dashboard/users/new"
              element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><UserNew /></RoleRoute>}
            />
            <Route
              path="/dashboard/users/:id/edit"
              element={<RoleRoute allowed={['ADMINISTRADOR','admin']}><UserEdit /></RoleRoute>}
            />
            <Route
              path="/dashboard/documents/:patientId"
              element={<RoleRoute allowed={['ADMINISTRADOR','MEDICO','ENFERMERA']}><Documents /></RoleRoute>}
            />
            <Route
              path="/dashboard/agenda"
              element={<RoleRoute allowed={['MEDICO','ADMINISTRADOR']}><Agenda /></RoleRoute>}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
