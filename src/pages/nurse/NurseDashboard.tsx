

const NurseDashboard = () => {
  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
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
  );
};

export default NurseDashboard;
