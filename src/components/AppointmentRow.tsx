import { useEffect, useState } from 'react';
import { usePatientsStore } from '@/store/usePatientsStore';
import { Skeleton } from '@mui/material';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/types/Appointment';

interface AppointmentRowProps {
  appointment: Appointment;
}

export const AppointmentRow = ({ appointment }: AppointmentRowProps) => {
  const { fetchPatientById } = usePatientsStore();
  const [patientName, setPatientName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        if (!appointment.patientId) {
          setPatientName('Paciente no disponible');
          setLoading(false);
          return;
        }

        const patientData = await fetchPatientById(appointment.patientId);
        if (patientData) {
          setPatientName(patientData.fullname || patientData.email);
        } else {
          setPatientName('Paciente desconocido');
        }
      } catch (err) {
        console.error('Error loading patient:', err);
        setPatientName('Error al cargar');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [appointment.patientId, fetchPatientById]);

  if (loading) {
    return (
      <div className="flex items-center justify-between border rounded p-3 bg-slate-50">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={80} height={24} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded p-3 bg-slate-50">
      <div>
        <div className="font-medium">{patientName}</div>
        <div className="text-xs text-slate-600">
          {new Date(appointment.date).toLocaleString()}
        </div>
      </div>
      <StatusBadge status={appointment.status} />
    </div>
  );
};

export default AppointmentRow;
