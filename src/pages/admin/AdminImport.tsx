import BulkImport from '@/components/BulkImport';
const AdminImport = () => {
  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 min-h-screen">
      <section className="bg-white p-6 rounded-xl border">
          <h1 className="text-2xl font-bold mb-2">Carga Masiva</h1>
          <p className="text-sm text-slate-600 mb-4">Sube CSV/XLSX con usuarios de cualquier rol (MEDICO, ENFERMERA, PACIENTE, ADMINISTRADOR). Columnas: email, fullname, role, current_password, status, specialization, department, license_number, phone, date_of_birth.</p>
          <BulkImport />
        </section>
    </div>
  );
};

export default AdminImport;
