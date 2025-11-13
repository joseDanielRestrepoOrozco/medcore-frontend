import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { getErrorMessage } from "@/utils/error";
import DynamicForm from "@/components/DynamicForm";
import { useAuth } from "@/context/AuthContext";

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
};

type Template = {
  id?: string;
  title?: string;
  description?: string;
  fields: Field[];
};

const MedicalHistoryNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Consulta médica");
  const [description, setDescription] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [observations, setObservations] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templateValues, setTemplateValues] = useState<Record<string, unknown>>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Verificar que el usuario no sea administrador
  useEffect(() => {
    if (user?.role === "ADMINISTRADOR") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("patientId");
    const tId = params.get("templateId");
    if (pid) setPatientId(pid);
    if (tId) setSelectedTemplateId(tId);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/records/templates");
        setTemplates(r.data?.templates || r.data || []);
      } catch (err: unknown) {
        console.debug("error loading templates", String(err));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/records/templates/${selectedTemplateId}`);
        if (!cancelled)
          setSelectedTemplate(res.data?.template || res.data || null);
      } catch (err: unknown) {
        console.debug("error loading template", String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // El backend expone POST /diagnostics/:patientId y espera campos multipart
      // Build FormData accordingly. Si hay template, mapear campos conocidos y serializar el resto en 'observations'.
      const fd = new FormData();
      // Mapear campos básicos
      fd.append("title", selectedTemplate?.title || title);
      fd.append(
        "description",
        selectedTemplate?.description || description || summary
      );

      // Campos que podría contener el template
      const known = [
        "title",
        "description",
        "symptoms",
        "diagnosis",
        "treatment",
        "observations",
        "nextAppointment",
      ];
      const extras: Record<string, unknown> = {};

      if (selectedTemplate) {
        // extraer valores mapeables
        for (const k of Object.keys(templateValues)) {
          const v = (templateValues as Record<string, unknown>)[k];
          if (known.includes(k)) {
            // nextAppointment debe enviarse como string ISO
            if (k === "nextAppointment" && v)
              fd.append("nextAppointment", String(v));
            else fd.append(k, String(v ?? ""));
          } else {
            extras[k] = v as unknown;
          }
        }
      } else {
        // sin template usar campos del formulario
        fd.append("symptoms", symptoms);
        fd.append("diagnosis", diagnosis);
        fd.append("treatment", treatment);
        if (observations) fd.append("observations", observations);
        if (nextAppointment) fd.append("nextAppointment", nextAppointment);
      }

      // Observations: si viene observaciones del template o datos extra, los unimos
      const obsFromTemplate = (templateValues as Record<string, unknown>)
        ?.observations;
      if (obsFromTemplate) {
        fd.append("observations", String(obsFromTemplate));
      } else if (Object.keys(extras).length > 0) {
        // Solo agregar extras si no se ha añadido observations desde el formulario
        if (!observations) {
          fd.append("observations", JSON.stringify(extras));
        }
      }

      // Añadir archivos bajo la clave 'documents' (multer espera 'documents')
      files.forEach((f) => fd.append("documents", f, f.name));

      // POST al endpoint con patientId en la ruta
      await api.post(`/diagnostics/${patientId}`, fd);
      if (patientId) navigate(`/dashboard/medical-history/${patientId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold">Nueva consulta médica</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Usar template EHR</label>
          <div className="mt-2 flex items-center gap-2">
            <select
              title="Seleccionar template"
              value={selectedTemplateId ?? ""}
              onChange={(e) => setSelectedTemplateId(e.target.value || null)}
              className="border rounded px-3 py-2"
            >
              <option value="">-- Ninguno --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title || t.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTemplate ? (
          <div className="mt-4">
            <DynamicForm
              template={selectedTemplate}
              initial={{}}
              onSubmit={async (vals) => {
                setTemplateValues(vals); /* store until final submit */
              }}
            />
            <div className="text-sm text-slate-500 mt-2">
              Completa el template y pulsa "Guardar" en el formulario del
              template para validar los campos; luego haz clic en el botón
              principal "Guardar" para subir archivos y completar la consulta.
            </div>
          </div>
        ) : null}
        <div>
          <label className="block text-sm font-medium">ID Paciente</label>
          <input
            title="ID Paciente"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="ID del paciente"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              title="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha</label>
            <input
              title="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="Descripción de la consulta"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Resumen / Motivo</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Motivo de consulta, hallazgos, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Síntomas</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Síntomas reportados por el paciente"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Diagnóstico</label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej. Dermatitis atópica"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tratamiento</label>
            <input
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Indicaciones, medicamentos"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">
            Observaciones (opcional)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Notas adicionales, observaciones del médico, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Próxima cita (opcional)
          </label>
          <input
            title="Próxima cita"
            type="date"
            value={nextAppointment}
            onChange={(e) => setNextAppointment(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Adjuntar documentos (PDF/JPG/PNG)
          </label>
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              const dropped = Array.from(e.dataTransfer.files || []);
              if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
            }}
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
              dragOver ? "border-slate-800 bg-slate-50" : "border-slate-300"
            }`}
          >
            Arrastra y suelta los archivos aquí o usa el botón para
            seleccionarlos
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-white border rounded"
            >
              Seleccionar archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files || []),
                ])
              }
              className="sr-only"
              title="Seleccionar archivos"
            />
          </div>
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
              {files.map((f, idx) => (
                <li key={idx}>
                  {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-800 text-white rounded"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalHistoryNew;
