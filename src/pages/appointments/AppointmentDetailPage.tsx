import { useParams } from 'react-router-dom';
import { useAppointment } from '../../hooks/useAppointments';
import PatientQueueWidget from '../../components/queue/PatientQueueWidget';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useAppointment(id);
  if (isLoading) return <div className="p-4">Cargando…</div>;
  if (!data) return <div className="p-4">No encontrada</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="card">
        <div className="font-semibold mb-2">Detalle de cita</div>
        <div className="text-sm">Paciente: {data.patientName || data.patientId}</div>
        <div className="text-sm">Doctor: {data.doctorName || data.doctorId}</div>
        <div className="text-sm">Fecha: {data.date} {data.startTime} - {data.endTime}</div>
        <div className="text-sm">Estado: {data.status}</div>
      </div>
      {data.ticketId && (
        <div className="card">
          <div className="font-semibold mb-2">Turno</div>
          <PatientQueueWidget ticketId={data.ticketId} />
        </div>
      )}
    </div>
  );
}

