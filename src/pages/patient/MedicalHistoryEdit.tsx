import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import type { Diagnostic } from "@/types/Diagnostic";
import { useAuth } from "@/context/AuthContext";

const MedicalHistoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosisText, setDiagnosisText] = useState("");
  const [treatment, setTreatment] = useState("");
  const [observations, setObservations] = useState("");
  const [diagnosticDate, setDiagnosticDate] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");

  // Para agregar documentos
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Verificar que el usuario no sea administrador
  useEffect(() => {
    if (user?.role === "ADMINISTRADOR") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loadDiagnostic = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/diagnostics/${id}`);
      const data: Diagnostic = res.data?.data || res.data;
      setDiagnostic(data);

      // Mapear los campos
      setTitle(data.title || "");
      setDescription(data.description || "");
      setSymptoms(data.symptoms || "");
      setDiagnosisText(data.diagnosis || "");
      setTreatment(data.treatment || "");
      setObservations(data.observations || "");
      setDiagnosticDate(
        data.diagnosticDate
          ? new Date(data.diagnosticDate).toISOString().split("T")[0]
          : ""
      );
      setNextAppointment(
        data.nextAppointment
          ? new Date(data.nextAppointment).toISOString().split("T")[0]
          : ""
      );
    } catch (err) {
      console.error("Error cargando diagnóstico:", err);
      setError("No se pudo cargar el diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !diagnostic) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        symptoms,
        diagnosis: diagnosisText,
        treatment,
        observations,
        diagnosticDate,
        nextAppointment: nextAppointment || undefined,
      };
      await api.put(`/diagnostics/${id}`, payload);
      navigate(`/dashboard/medical-history/${diagnostic.patientId}`);
    } catch (err) {
      console.error("Error actualizando diagnóstico:", err);
      setError("No se pudo actualizar el diagnóstico");
    } finally {
      setSaving(false);
    }
  };

  const onUploadDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("documents", file);
      });

      await api.post(`/diagnostics/${id}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Recargar el diagnóstico para mostrar los nuevos documentos
      await loadDiagnostic();
      setSelectedFiles(null);
      // Limpiar el input de archivos
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Error subiendo documentos:", err);
      setError("No se pudieron subir los documentos");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("¿Está seguro de eliminar este documento?")) return;

    try {
      await api.delete(`/diagnostics/documents/${docId}`);
      // Recargar el diagnóstico
      await loadDiagnostic();
    } catch (err) {
      console.error("Error eliminando documento:", err);
      setError("No se pudo eliminar el documento");
    }
  };

  const handlePreview = async (docId: string, filename: string) => {
    try {
      const res = await api.get(`/diagnostics/documents/${docId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error descargando documento:", err);
      setError("No se pudo descargar el documento");
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!diagnostic && !loading)
    return <div className="p-6 text-red-600">Diagnóstico no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Diagnóstico</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha del diagnóstico
          </label>
          <input
            type="date"
            value={diagnosticDate}
            onChange={(e) => setDiagnosticDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Síntomas</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Diagnóstico
            </label>
            <textarea
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tratamiento
            </label>
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Próxima cita (opcional)
          </label>
          <input
            type="date"
            value={nextAppointment}
            onChange={(e) => setNextAppointment(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() =>
              diagnostic &&
              navigate(`/dashboard/medical-history/${diagnostic.patientId}`)
            }
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Sección de documentos */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Documentos adjuntos</h2>

        {/* Lista de documentos existentes */}
        {diagnostic?.documents && diagnostic.documents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Documentos actuales:</h3>
            <div className="space-y-2">
              {diagnostic.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {(doc.fileSize / 1024).toFixed(2)} KB -{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(doc.id, doc.filename)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Descargar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario para agregar nuevos documentos */}
        <form onSubmit={onUploadDocuments} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Agregar nuevos documentos
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full border rounded px-3 py-2"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos aceptados: PDF, DOC, DOCX, JPG, PNG
            </p>
          </div>
          <button
            type="submit"
            disabled={uploading || !selectedFiles || selectedFiles.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700"
          >
            {uploading ? "Subiendo..." : "Subir documentos"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedicalHistoryEdit;
