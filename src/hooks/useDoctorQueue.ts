import { useState, useEffect, useCallback } from 'react';
import {
  getDoctorQueue,
  getCurrentAppointment,
  callNext as apiCallNext,
  complete as apiComplete,
  markNoShow as apiMarkNoShow,
  type DoctorAppointment,
} from '@/services/queue.api';
import { toast } from 'sonner';

export const useDoctorQueue = () => {
  const [queue, setQueue] = useState<DoctorAppointment[]>([]);
  const [current, setCurrent] = useState<DoctorAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [queueData, currentData] = await Promise.all([
        getDoctorQueue(),
        getCurrentAppointment(),
      ]);

      setQueue(queueData.queue);
      setCurrent(currentData.appointment);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || 'Error al cargar la cola';
      setError(errorMessage);
      toast.error('Error al cargar la cola', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const callNext = useCallback(async () => {
    try {
      const response = await apiCallNext();
      toast.success('Paciente llamado', {
        description: `Paciente en consulta. ${response.waitingCount} paciente(s) en espera.`,
      });
      await loadQueue();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || 'Error al llamar al siguiente paciente';
      toast.error('Error', {
        description: errorMessage,
      });
    }
  }, [loadQueue]);

  const completeCurrent = useCallback(
    async (appointmentId: string) => {
      try {
        await apiComplete(appointmentId);
        toast.success('Consulta completada', {
          description: 'La consulta ha sido marcada como completada.',
        });
        await loadQueue();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        const errorMessage =
          error.response?.data?.error || 'Error al completar la consulta';
        toast.error('Error', {
          description: errorMessage,
        });
      }
    },
    [loadQueue]
  );

  const markAsNoShow = useCallback(
    async (appointmentId: string) => {
      try {
        await apiMarkNoShow(appointmentId);
        toast.success('Paciente marcado como no-show', {
          description: 'El paciente no se presentó a la consulta.',
        });
        await loadQueue();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        const errorMessage =
          error.response?.data?.error || 'Error al marcar como no-show';
        toast.error('Error', {
          description: errorMessage,
        });
      }
    },
    [loadQueue]
  );

  const refresh = useCallback(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    current,
    loading,
    error,
    callNext,
    completeCurrent,
    markAsNoShow,
    refresh,
  };
};
