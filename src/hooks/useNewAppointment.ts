import api from '@/services/api';
import type { Specialty } from '@/types';
import type { Medicos, UserMedico } from '@/types/Users';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/toaster';
import z from 'zod';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  specialty: z.string(),
  doctorId: z.string(),
  startAt: z.string(),
  reason: z.string().min(1, 'La razón de la cita es requerida'),
});

const useNewAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<UserMedico[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: '',
      doctorId: '',
      startAt: '',
      reason: '',
    },
  });

  useEffect(() => {
    try {
      const fetchSpecialties = async () => {
        const response = await api.get('/specialties');
        setSpecialties(response.data);
      };
      fetchSpecialties();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const specialty = form.watch('specialty');
  const doctorId = form.watch('doctorId');

  useEffect(() => {
    // effect intentionally left blank — runs when specialty changes
    try {
      const fetchDoctorsBySpecialty = async () => {
        const response = await api.get<Medicos>(
          `/users/by-specialty?specialtyId=${specialty}`
        );
        setDoctors(response.data.users);
      };
      if (specialty) {
        fetchDoctorsBySpecialty();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      }
    }
  }, [specialty]);

  const fetchAvailableSlots = async (doctorId: string, date: Date) => {
    setLoadingSlots(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(
        `/appointments/disponibilidad?doctor_id=${doctorId}&fecha=${formattedDate}`
      );
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchAvailableSlots(doctorId, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, selectedDate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error('Error', {
        description:
          'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: user.id.toString(),
        doctorId: values.doctorId,
        startAt: values.startAt,
        reason: values.reason,
      };

      await api.post('/appointments', payload);

      toast.success('Cita agendada', {
        description: 'Tu cita médica ha sido agendada exitosamente.',
      });

      navigate('/patient/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || 'No se pudo agendar la cita';
        toast.error('Error al agendar cita', {
          description: errorMessage,
        });
      } else {
        toast.error('Error', {
          description: 'Ocurrió un error inesperado al agendar la cita.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    specialties,
    doctors,
    onSubmit,
    form,
    availableSlots,
    selectedDate,
    setSelectedDate,
    loadingSlots,
    isSubmitting,
  };
};

export default useNewAppointment;
