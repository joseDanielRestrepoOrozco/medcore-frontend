import { useState, useEffect } from 'react';
import {
  getMyAppointmentsByDate,
  type DoctorAppointment,
} from '@/services/queue.api';
import { toast } from 'sonner';

export const useDoctorAppointments = (date: string) => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!date) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getMyAppointmentsByDate(date);
        setAppointments(response.appointments);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        const errorMessage =
          error.response?.data?.error || 'Error al cargar las citas';
        setError(errorMessage);
        toast.error('Error al cargar citas', {
          description: errorMessage,
        });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [date]);

  return { appointments, loading, error };
};
