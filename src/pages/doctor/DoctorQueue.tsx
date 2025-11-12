import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Hourglass, Clock, CheckCircle2, UserX, Play, X as CloseIcon, Megaphone } from 'lucide-react';

// Tipos mínimos (mock). Cambia por tus tipos reales al conectar backend
type QueueStatus = "waiting" | "in_progress" | "completed" | "no_show";
type Ticket = {
  id: string;
  number: number;         // turno visible (1..n)
  patientName: string;
  doctorName: string;
  status: QueueStatus;
  etaMinutes?: number;    // estimado
  appointmentId: string;
};

// MOCK inicial. Al conectar, reemplaza por fetch a tu backend
const initialTickets: Ticket[] = [
  { id: "t1", number: 1, patientName: "Isabella Rossi", doctorName: "Dr. Chen",   status: "in_progress", etaMinutes: undefined, appointmentId: "a1" },
  { id: "t2", number: 2, patientName: "Juan Perez",      doctorName: "Dr. Chen",   status: "waiting",     etaMinutes: 5,        appointmentId: "a2" },
  { id: "t3", number: 3, patientName: "Aisha Khan",      doctorName: "Dr. Miller", status: "waiting",     etaMinutes: 15,       appointmentId: "a3" },
  { id: "t4", number: 4, patientName: "David Smith",     doctorName: "Dr. Chen",   status: "waiting",     etaMinutes: 25,       appointmentId: "a4" },
  { id: "t5", number: 5, patientName: "Emily White",     doctorName: "Dr. Miller", status: "completed",   etaMinutes: undefined, appointmentId: "a5" },
];

const statusPill = (s: QueueStatus) => {
  if (s === "in_progress") return { text: "EN ATENCIÓN",  cls: "bg-blue-100 text-blue-800" };
  if (s === "waiting")     return { text: "EN ESPERA",    cls: "bg-yellow-100 text-yellow-800" };
  if (s === "completed")   return { text: "ATENDIDO",     cls: "bg-green-100 text-green-800" };
  return { text: "NO SHOW", cls: "bg-red-100 text-red-800" };
};

export default function DoctorQueue() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const reindex = (arr: Ticket[]) => {
    // reindex visible numbers for waiting + in_progress
    let n = 1;
    return arr.map(t => (t.status === "in_progress" || t.status === "waiting") ? { ...t, number: n++ } : t);
  };

  const current = useMemo(() => tickets.find(t => t.status === "in_progress") ?? null, [tickets]);
  const waiting = useMemo(() => tickets.filter(t => t.status === "waiting").sort((a,b) => a.number - b.number), [tickets]);
  const doneOrNoShow = useMemo(() => tickets.filter(t => t.status === "completed" || t.status === "no_show"), [tickets]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  // Acciones mock (luego conecta a tu API)
  const callNext = () => {
    setTickets(prev => {
      if (prev.some(t => t.status === "in_progress")) return prev;
      const nextWaiting = prev.filter(t => t.status === "waiting").sort((a,b) => a.number - b.number)[0];
      if (!nextWaiting) return prev;
      const updated = prev.map<Ticket>(t => t.id === nextWaiting.id ? { ...t, status: "in_progress", etaMinutes: undefined } : t);
      showToast("Paciente llamado a consulta");
      return reindex(updated);
    });
  };

  const completeCurrent = () => {
    setTickets(prev => {
      const cur = prev.find(t => t.status === "in_progress");
      if (!cur) return prev;
      const updated = prev.map<Ticket>(t => t.id === cur.id ? { ...t, status: "completed" } : t);
      showToast("Consulta marcada como completada");
      return reindex(updated);
    });
  };

  const markNoShow = () => {
    setTickets(prev => {
      const cur = prev.find(t => t.status === "in_progress");
      if (!cur) return prev;
      const updated = prev.map<Ticket>(t => t.id === cur.id ? { ...t, status: "no_show" } : t);
      showToast("Paciente marcado como no-show");
      return reindex(updated);
    });
  };

  const startFromRow = (id: string) => {
    setTickets(prev => {
      if (prev.find(t => t.status === "in_progress")) return prev;
      const updated = prev.map<Ticket>(t => t.id === id ? { ...t, status: "in_progress", etaMinutes: undefined } : t);
      showToast("Paciente llamado a consulta");
      return reindex(updated);
    });
  };

  const removeFromView = (id: string) => setTickets(prev => prev.filter(t => t.id !== id));

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Sala de Espera Virtual</h1>
          <p className="mt-2 text-base text-gray-500">Cola de pacientes de las citas de hoy.</p>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Médico</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ETA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>

              <AnimatePresence>
                <tbody className="divide-y divide-slate-200">
                  {[...(current ? [current] : []), ...waiting].map((t) => {
                    const pill = statusPill(t.status);
                    const isCurrent = t.status === "in_progress";
                    return (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={isCurrent ? "bg-blue-50/60" : ""}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{t.number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{t.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.cls}`}>
                            {pill.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {isCurrent ? <Hourglass className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            <span>{isCurrent ? "En curso" : (t.etaMinutes ? `${t.etaMinutes} min` : "—")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {isCurrent ? (
                              <>
                                <button onClick={completeCurrent} className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-green-600 transition-colors" title="Marcar completada">
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                                <button onClick={markNoShow} className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-red-600 transition-colors" title="Marcar no-show">
                                  <UserX className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => startFromRow(t.id)} className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors" title="Llamar a consulta">
                                <Play className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </AnimatePresence>

              {doneOrNoShow.length > 0 && (
                <tbody className="divide-y divide-slate-200">
                  {doneOrNoShow.map((t) => {
                    const pill = statusPill(t.status);
                    return (
                      <motion.tr key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="opacity-70">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{t.number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{t.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.cls}`}>{pill.text}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {t.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                            <span>{t.status === "completed" ? "Completed" : "No-show"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => removeFromView(t.id)} className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors" title="Ocultar de la vista">
                            <CloseIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={callNext} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
            <Megaphone className="h-5 w-5" />
            Llamar siguiente
          </button>
        </div>
      </div>

      <div className={`fixed bottom-5 right-5 z-20 max-w-xs items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-slate-800 shadow-lg transition-all ${toast ? "flex opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}`}>
        <div className="inline-flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="text-sm font-normal">{toast}</div>
      </div>
    </main>
  );
}
