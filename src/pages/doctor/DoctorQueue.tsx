import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Hourglass,
  Clock,
  CheckCircle2,
  UserX,
  Play,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import { useDoctorQueue } from '@/hooks/useDoctorQueue';

type QueueStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

const statusPill = (s: QueueStatus) => {
  if (s === 'IN_PROGRESS')
    return { text: 'EN ATENCIÓN', cls: 'bg-blue-100 text-blue-800' };
  if (s === 'CONFIRMED')
    return { text: 'EN ESPERA', cls: 'bg-yellow-100 text-yellow-800' };
  if (s === 'COMPLETED')
    return { text: 'ATENDIDO', cls: 'bg-green-100 text-green-800' };
  if (s === 'NO_SHOW')
    return { text: 'NO SHOW', cls: 'bg-red-100 text-red-800' };
  if (s === 'CANCELLED')
    return { text: 'CANCELADO', cls: 'bg-gray-100 text-gray-800' };
  return { text: 'AGENDADO', cls: 'bg-slate-100 text-slate-800' };
};

export default function DoctorQueue() {
  const {
    queue,
    current,
    loading,
    callNext,
    completeCurrent,
    markAsNoShow,
    refresh,
  } = useDoctorQueue();

  // Separar citas en espera confirmadas
  const waiting = useMemo(
    () => queue.filter(t => t.status === 'CONFIRMED'),
    [queue]
  );

  // Calcular posición en la cola
  const getPosition = (index: number) => {
    return current ? index + 2 : index + 1; // +2 si hay current (que es posición 1)
  };

  // Estimar tiempo de espera (30 min por cita)
  const getETA = (index: number) => {
    const baseTime = current ? 30 : 0; // Si hay current, suma 30 min
    return baseTime + index * 30;
  };

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Sala de Espera Virtual
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Cola de pacientes confirmados para hoy
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Actualizar cola"
          >
            <RefreshCw className="h-5 w-5" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-slate-500">Cargando cola...</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        ETA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <AnimatePresence>
                    <tbody className="divide-y divide-slate-200">
                      {/* Paciente actual en atención */}
                      {current && (
                        <motion.tr
                          key={current.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="bg-blue-50/60"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            1
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>Paciente ID: {current.patientId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {current.reason || 'Consulta general'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                statusPill(current.status as QueueStatus).cls
                              }`}
                            >
                              {statusPill(current.status as QueueStatus).text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Hourglass className="h-4 w-4" />
                              <span>En curso</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => completeCurrent(current.id)}
                                className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-green-600 transition-colors"
                                title="Marcar completada"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => markAsNoShow(current.id)}
                                className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-red-600 transition-colors"
                                title="Marcar no-show"
                              >
                                <UserX className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )}

                      {/* Pacientes en espera */}
                      {waiting.map((appointment, index) => {
                        const position = getPosition(index);
                        const eta = getETA(index);
                        return (
                          <motion.tr
                            key={appointment.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>
                                  Paciente ID: {appointment.patientId}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {appointment.reason || 'Consulta general'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  statusPill(appointment.status as QueueStatus)
                                    .cls
                                }`}
                              >
                                {
                                  statusPill(appointment.status as QueueStatus)
                                    .text
                                }
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>~{eta} min</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={callNext}
                                disabled={!!current}
                                className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  current
                                    ? 'Complete la consulta actual primero'
                                    : 'Llamar a consulta'
                                }
                              >
                                <Play className="h-5 w-5" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}

                      {/* Estado vacío */}
                      {!current && waiting.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-sm text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <User className="h-12 w-12 text-gray-300" />
                              <p className="font-medium">
                                No hay pacientes en la cola
                              </p>
                              <p className="text-xs">
                                Los pacientes aparecerán aquí cuando confirmen
                                su cita
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </AnimatePresence>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={callNext}
                disabled={!!current || waiting.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Megaphone className="h-5 w-5" />
                Llamar siguiente
              </button>
              <p className="text-sm text-gray-500">
                {waiting.length > 0
                  ? `${waiting.length} paciente(s) en espera`
                  : 'Sin pacientes en espera'}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
