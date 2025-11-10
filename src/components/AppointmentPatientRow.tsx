import { TableRow, TableCell } from '@/components/ui/table';
import type { Appointment } from '@/types/Appointment';
import { Button } from '@/components/ui/button';
import AppointmentBadge from '@/components/AppointmentBadge';
import CancelDialog from '@/components/CancelDialog';

const AppointmentPatientRow = ({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
}) => {
  return (
    <TableRow>
      <TableCell>{appointment.doctor}</TableCell>
      <TableCell>
        {appointment.date.toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </TableCell>
      <TableCell>
        <AppointmentBadge status={appointment.status} />
      </TableCell>
      <TableCell className="flex gap-3">
        <Button className="cursor-pointer">Reagendar</Button>
        <CancelDialog id={appointment.id} onCancel={onCancel} />
      </TableCell>
    </TableRow>
  );
};

export default AppointmentPatientRow;
