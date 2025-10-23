import AdminSidebar from '../components/AdminSidebar';
import BulkImport from '../components/BulkImport';
import { useState } from 'react';

const AdminImport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDesktop, setSidebarDesktop] = useState(true);
  return (
    <div className="flex">
      {sidebarDesktop && (
        <div className="hidden md:block relative">
          <AdminSidebar active="carga" />
        </div>
      )}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="w-72 bg-white border-l min-h-full p-0 shadow-xl">
            <AdminSidebar active="carga" />
          </div>
        </div>
      )}
      <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        <button type="button" className="md:hidden mb-4 px-3 py-2 rounded border bg-white" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">Menú</button>
        {/* Botón flotante de colapso (escritorio) */}
        <button
          type="button"
          onClick={() => setSidebarDesktop((v) => !v)}
          aria-label={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          title={sidebarDesktop ? 'Ocultar menú' : 'Mostrar menú'}
          className="hidden md:flex items-center justify-center fixed z-40 top-1/2 -translate-y-1/2 transform w-8 h-8 rounded-full border bg-white shadow"
          style={{ left: sidebarDesktop ? '15.5rem' : '0.5rem' }}
        >
          <span className="text-slate-700 text-lg">{sidebarDesktop ? '⟨' : '⟩'}</span>
        </button>
        <section className="bg-white p-6 rounded-xl border">
          <h1 className="text-2xl font-bold mb-2">Carga Masiva</h1>
          <p className="text-sm text-slate-600 mb-4">Sube CSV/XLSX con usuarios de cualquier rol (MEDICO, ENFERMERA, PACIENTE, ADMINISTRADOR). Columnas: email, fullname, role, current_password, status, specialization, department, license_number, phone, date_of_birth.</p>
          <BulkImport />
        </section>
      </div>
    </div>
  );
};

export default AdminImport;
