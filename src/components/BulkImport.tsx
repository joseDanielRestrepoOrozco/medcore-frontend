import React, { useRef, useState } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/error';

const BulkImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [failedRows, setFailedRows] = useState<Array<{ index: number; error: string }>>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accept = '.csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';

  const handleBrowse = () => inputRef.current?.click();

  const validate = (f: File): string | null => {
    const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxBytes = 60 * 1024 * 1024; // 60MB
    if (f.size > maxBytes) return 'El archivo supera el límite de 60MB';
    const ext = f.name.toLowerCase().split('.').pop();
    if (!(allowed.includes(f.type) || (ext === 'csv' || ext === 'xlsx'))) {
      return 'Formato inválido. Solo CSV o XLSX';
    }
    return null;
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const err = validate(f);
    if (err) {
      setMessage(err);
      e.currentTarget.value = '';
      return;
    }
    setFile(f);
    setMessage(null);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || null;
    if (!f) return;
    const err = validate(f);
    if (err) {
      setMessage(err);
      return;
    }
    setFile(f);
    setMessage(null);
  };

  const onSubmit = async () => {
    if (!file) return;
    setMessage('Procesando archivo...');
    try {
      const form = new FormData();
      // El backend espera el campo 'document' (multer.single('document'))
      form.append('document', file, file.name);
      // Endpoint unificado en Users: acepta cualquier rol (MEDICO/ENFERMERA/PACIENTE/ADMINISTRADOR)
      const res = await api.post('/users/bulkUsers', form);

      // Manejo flexible de respuestas
      const ok = res.data?.summary?.successful ?? res.data?.inserted ?? res.data?.count ?? 0;
      const fail = res.data?.summary?.failed ?? 0;
      const failed = Array.isArray(res.data?.results?.failed) ? (res.data.results.failed as Array<{ index:number; error:string }>) : [];
      setFailedRows(failed);
      let msg = `Importación completada. Éxitos: ${ok}${fail ? `, Fallidos: ${fail}` : ''}`;
      if (fail > 0) msg += '. Revisa el CSV (roles, fechas YYYY-MM-DD).';
      setMessage(msg);
    } catch (err) {
      // Silenciar logs en navegador; solo mostrar mensaje de error amigable
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Sube un CSV o XLSX con columnas: email, fullname, role, current_password, status, specialization, department, license_number, phone, date_of_birth.
      </p>
      <div>
        <button
          type="button"
          className="text-sm text-slate-700 hover:underline"
          onClick={() => {
            const sample = `email,fullname,role,current_password,status,specialization,department,license_number,phone,date_of_birth\n`+
              `doctor1@medcore.com,Dr. Ana María González,MEDICO,TempPass123!,PENDING,CARDIOLOGIA,MEDICINA_INTERNA,12345-MD,+57-300-1234567,1985-03-15\n`+
              `nurse1@medcore.com,María Elena Rodríguez,ENFERMERA,TempPass123!,PENDING,,URGENCIAS,,+57-300-2345678,1990-07-22\n`+
              `admin1@medcore.com,Carlos Alberto Méndez,ADMINISTRADOR,TempPass123!,ACTIVE,,ADMINISTRACION,,+57-300-3456789,1980-11-08\n`+
              `patient1@medcore.com,Luis Fernando Castro,PACIENTE,TempPass123!,PENDING,,,,,1995-09-12`;
            const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_usuarios.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Descargar plantilla CSV de ejemplo
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleBrowse}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBrowse(); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
        onDrop={onDrop}
        className={`cursor-pointer select-none flex flex-col items-center justify-center rounded-xl p-8 text-center transition border-2 outline-none focus:ring-2 focus:ring-slate-400 ${dragOver ? 'border-slate-800 bg-slate-50 border-dashed' : 'border-slate-300 border-dashed'}`}
        aria-label="Arrastra y suelta o selecciona un archivo"
      >
        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8M5 6h14v12H5z" />
        </svg>
        <p className="mt-3 text-sm text-slate-600">Arrastra y suelta o selecciona un archivo</p>
        <p className="text-xs text-slate-400">Solo CSV o XLSX (máx. 60MB)</p>
        <label htmlFor="users-upload" className="mt-4 px-4 py-2 rounded bg-white border border-slate-300 text-sm cursor-pointer inline-block">
          Seleccionar Archivo
        </label>
        <input id="users-upload" ref={inputRef} type="file" accept={accept} onChange={onFileChange} className="sr-only" />
        {file && <div className="mt-3 text-sm text-slate-700">Archivo: {file.name}</div>}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onSubmit} disabled={!file} className={`px-4 py-2 rounded text-white text-sm ${file ? 'bg-slate-800 hover:bg-slate-900' : 'bg-slate-400 cursor-not-allowed'}`}>
          Procesar Importación
        </button>
      </div>

      {message && <div className="text-sm text-slate-600">{message}</div>}

      {failedRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">Errores por fila</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 border">Fila</th>
                  <th className="text-left px-3 py-2 border">Error</th>
                </tr>
              </thead>
              <tbody>
                {failedRows.map((f, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 border">{(f.index ?? 0) + 2}</td>
                    <td className="px-3 py-2 border">{String(f.error || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
