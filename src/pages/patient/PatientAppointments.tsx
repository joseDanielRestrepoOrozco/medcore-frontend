import AppointmentPatientRow from '@/components/AppointmentPatientRow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import usePatientStore from '@/store/usePatientStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PatientAppointments = () => {
  const { appointments, loadingAppointments, fetchAppointments } =
    usePatientStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loadingAppointments) {
    return;
  }

  return (
    <Card className="m-5 overflow-x-auto">
      <CardHeader className="flex flex-row place-content-between">
        <div>
          <CardTitle>Citas medicas</CardTitle>
          <CardDescription>Tu historial de citas medicas</CardDescription>
        </div>
        <Button
          variant="default"
          className="cursor-pointer"
          onClick={() => navigate('/patient/appointments/new')}
        >
          Agendar una nueva cita
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="overflow-hidden">
            <TableCaption>Historial de citas</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map(a => (
                <AppointmentPatientRow key={a.id} appointment={a} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientAppointments;
