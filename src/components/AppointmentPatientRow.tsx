import { useEffect, useState } from 'react';

import { TableRow, TableCell } from '@/components/ui/table';
import type { Appointment } from '@/types/Appointment';
import AppointmentBadge from '@/components/AppointmentBadge';
import CancelDialog from '@/components/CancelDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import RescheduleDialog from '@/components/RescheduleDialog';
import useDoctorsStore from '@/store/useDoctorsStore';
import usePatientStore from '@/store/usePatientStore';
import Skeleton from '@mui/material/Skeleton';

interface Props {
  appointment: Appointment;
}

const AppointmentPatientRow = ({ appointment }: Props) => {
  const { fetchDoctorById } = useDoctorsStore();
  const { confirmAppointment, rescheduleAppointment, cancelAppointment } =
    usePatientStore();
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      setLoading(true);
      const doctor = await fetchDoctorById(appointment.doctor);

      if (isMounted) {
        setDoctorName(doctor?.fullname || appointment.doctor);
        setLoading(false);
      }
    };

    loadDoctor();

    return () => {
      isMounted = false;
    };
  }, [appointment.doctor, fetchDoctorById]);

  const handleConfirm = async (id: string) => {
    await confirmAppointment(id);
  };

  const handleReschedule = async (id: string, newDate: Date) => {
    await rescheduleAppointment(id, { date: newDate });
  };

  const handleCancel = async (id: string) => {
    await cancelAppointment(id);
  };

  // Determinar qué acciones mostrar según el estado
  // SCHEDULED: puede reprogramar, confirmar y cancelar
  // CONFIRMED: solo puede cancelar
  // IN_PROGRESS, NO_SHOW, COMPLETED, CANCELLED: sin acciones
  const canReschedule = appointment.status === 'SCHEDULED';
  const canConfirm = appointment.status === 'SCHEDULED';
  const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);

  return (
    <TableRow>
      <TableCell>
        {loading ? <Skeleton variant="text" width={120} /> : doctorName}
      </TableCell>

      <TableCell>
        {appointment.date.toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </TableCell>

      <TableCell>
        <AppointmentBadge status={appointment.status} />
      </TableCell>

      <TableCell className="flex gap-2">
        {canReschedule && (
          <RescheduleDialog
            appointmentId={appointment.id}
            currentDate={appointment.date}
            onReschedule={handleReschedule}
          />
        )}

        {canConfirm && (
          <ConfirmDialog
            appointmentId={appointment.id}
            appointmentDate={appointment.date}
            onConfirm={handleConfirm}
          />
        )}

        {canCancel && (
          <CancelDialog
            appointmentId={appointment.id}
            appointmentDate={appointment.date}
            onCancel={handleCancel}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default AppointmentPatientRow;
