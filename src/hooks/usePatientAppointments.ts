import type { Appointment } from '@/types/Appointment';
import { useEffect, useState } from 'react';

const temporalList: Appointment[] = [
  {
    id: '1',
    doctor: 'Carlos Gomez',
    date: new Date('2024-10-25T10:30:00'),
    status: 'Confirmada',
  },
  {
    id: '2',
    doctor: 'Ana Martínez',
    date: new Date('2024-11-02T14:00:00'),
    status: 'Pendiente',
  },
  {
    id: '3',
    doctor: 'Luis Torres',
    date: new Date('2024-11-10T09:00:00'),
    status: 'Cancelada',
  },
];

const usePatientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(temporalList);
  }, []);

  const onCancel = (id: string) => {
    const canceledAppointment = appointments.find(a => a.id === id);
    if (!canceledAppointment) {
      alert('no existe');
      return;
    }
    setAppointments(
      appointments.map(a =>
        a.id !== id ? a : { ...canceledAppointment, status: 'Cancelada' }
      )
    );
  };

  return { appointments, onCancel };
};

export default usePatientAppointments;
