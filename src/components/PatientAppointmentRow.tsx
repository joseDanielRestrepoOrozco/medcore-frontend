import { useEffect, useState } from 'react';
import { useDoctorsStore } from '@/store/useDoctorsStore';
import { Skeleton } from '@mui/material';
import AppointmentBadge from '@/components/AppointmentBadge';
import type { Appointment } from '@/types/Appointment';

interface PatientAppointmentRowProps {
  appointment: Appointment;
}

export const PatientAppointmentRow = ({
  appointment,
}: PatientAppointmentRowProps) => {
  const { fetchDoctorById } = useDoctorsStore();
  const [doctorName, setDoctorName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        if (!appointment.doctorId) {
          setDoctorName('Doctor no disponible');
          setLoading(false);
          return;
        }

        const doctorData = await fetchDoctorById(appointment.doctorId);
        if (doctorData) {
          setDoctorName(doctorData.fullname || doctorData.email);
        } else {
          setDoctorName('Doctor desconocido');
        }
      } catch (err) {
        console.error('Error loading doctor:', err);
        setDoctorName('Error al cargar');
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [appointment.doctorId, fetchDoctorById]);

  if (loading) {
    return (
      <li className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={80} height={24} />
      </li>
    );
  }

  const formattedDate = new Date(appointment.date).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li className="flex items-start justify-between">
      <div className="flex-1">
        <div className="font-semibold">
          {appointment.reason || 'Consulta médica'}
        </div>
        <div className="text-sm text-slate-500">
          {doctorName} — {formattedDate}
        </div>
      </div>
      <AppointmentBadge status={appointment.status} />
    </li>
  );
};

export default PatientAppointmentRow;
