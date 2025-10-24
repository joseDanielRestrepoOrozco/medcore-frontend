import Sidebar from '../components/Sidebar';
import { useState } from 'react';

const NurseDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
        <button type="button" className="md:hidden mb-4 px-3 py-2 rounded border bg-white" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">Menú</button>
        <h1 className="text-2xl font-bold">Panel de Enfermería</h1>
        {/* Secciones simples del dashboard */}
        <section className="mt-6 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Agenda</h3>
          <p className="text-sm text-slate-600">Calendario y próximas actividades.</p>
        </section>
        <section className="mt-6 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Notas</h3>
          <p className="text-sm text-slate-600">Resumen de tareas e indicaciones internas.</p>
        </section>
      </div>
    </div>
  );
};

export default NurseDashboard;
