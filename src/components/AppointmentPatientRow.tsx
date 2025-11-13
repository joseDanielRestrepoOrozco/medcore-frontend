import { useEffect } from "react";

import { TableRow, TableCell } from "@/components/ui/table";
import type { Appointment } from "@/types/Appointment";
import { Button } from "@/components/ui/button";
import AppointmentBadge from "@/components/AppointmentBadge";
import CancelDialog from "@/components/CancelDialog";
import useDoctorsStore from "@/store/useDoctorsStore";
import Skeleton from "@mui/material/Skeleton";

interface Props {
  appointment: Appointment;
  onCancel: (id: string) => void;
}

const AppointmentPatientRow = ({ appointment, onCancel }: Props) => {
  const { doctors, loadingDoctors, fetchDoctors } = useDoctorsStore();

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // appointment.doctor === doctor.id
  const doctor = doctors.find((d) => d.id === appointment.doctor);

  return (
    <TableRow>
      <TableCell>
        {loadingDoctors ? (
          <Skeleton variant="text" width={120} />
        ) : doctor ? (
          doctor.fullname ?? appointment.doctor
        ) : (
          appointment.doctor
        )}
      </TableCell>

      <TableCell>
        {appointment.date.toLocaleString("es-CO", {
          dateStyle: "medium",
          timeStyle: "short",
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
