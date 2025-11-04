import { useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

type Specialty = 'Cardiología' | 'Pediatría' | 'Dermatología' | 'Medicina General';

type Doctor = {
  id: string;
  name: string;
  specialty: Specialty;
};

type AppointmentStatus = 'Scheduled' | 'Cancelled';

type Appointment = {
  id: string;
  specialty: Specialty;
  doctorId: string;
  doctorName: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes?: string;
  status: AppointmentStatus;
};

const SPECIALTIES: Specialty[] = ['Cardiología', 'Pediatría', 'Dermatología', 'Medicina General'];
const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dra. Ana López', specialty: 'Cardiología' },
  { id: 'd2', name: 'Dr. Carlos Pérez', specialty: 'Cardiología' },
  { id: 'd3', name: 'Dra. Marta Ríos', specialty: 'Pediatría' },
  { id: 'd4', name: 'Dr. Julio Vélez', specialty: 'Dermatología' },
  { id: 'd5', name: 'Dra. Laura Mora', specialty: 'Medicina General' },
];

function generateSlots(stepMin = 30, start = '08:00', end = '17:00') {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startM = sh * 60 + sm;
  const endM = eh * 60 + em;
  for (let m = startM; m <= endM; m += stepMin) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

export default function DoctorAppointments() {
  // Form state
  const [specialty, setSpecialty] = useState<Specialty | ''>('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const doctors = useMemo(() => DOCTORS.filter(d => !specialty || d.specialty === specialty), [specialty]);
  const doctorName = useMemo(() => doctors.find(d => d.id === doctorId)?.name || '', [doctorId, doctors]);

  const slots = useMemo(() => generateSlots(30, '08:00', '17:00'), []);

  const canSubmit = specialty && doctorId && date && time;

  const onSubmit = () => {
    if (!canSubmit) return;
    const id = Math.random().toString(36).slice(2);
    const appt: Appointment = { id, specialty: specialty as Specialty, doctorId, doctorName, date, time, notes, status: 'Scheduled' };
    setAppointments(prev => [appt, ...prev]);
    toast.success('Cita creada');
    // reset
    setNotes('');
  };

  const isPast = (a: Appointment) => {
    const dt = new Date(`${a.date}T${a.time}:00`);
    return dt.getTime() < Date.now();
  };

  const upcoming = appointments.filter(a => !isPast(a));
  const past = appointments.filter(a => isPast(a));

  // Reschedule modal state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const doReschedule = () => {
    if (!rescheduleId || !newDate || !newTime) return;
    setAppointments(prev => prev.map(a => a.id === rescheduleId ? { ...a, date: newDate, time: newTime } : a));
    setRescheduleId(null);
    setNewDate('');
    setNewTime('');
    toast.success('Cita reprogramada');
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    toast.error('Cita cancelada');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule a New Appointment</CardTitle>
          <CardDescription>Selecciona especialidad, médico, fecha y hora.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block">Especialidad</Label>
              <Select value={specialty} onValueChange={(v) => { setSpecialty(v as Specialty); setDoctorId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Médico</Label>
              <Select value={doctorId} onValueChange={setDoctorId} disabled={!specialty}>
                <SelectTrigger>
                  <SelectValue placeholder={specialty ? 'Selecciona médico' : 'Selecciona una especialidad primero'} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block">Fecha</Label>
              <div className="relative">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Hora</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona hora" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Motivo</Label>
            <Textarea placeholder="Describe brevemente el motivo de la cita" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onSubmit} disabled={!canSubmit}>Agendar</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>Administra tus citas próximas y pasadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <AppointmentTable
                rows={upcoming}
                onReschedule={(id) => setRescheduleId(id)}
                onCancel={cancelAppointment}
              />
            </TabsContent>
            <TabsContent value="past">
              <AppointmentTable
                rows={past}
                onReschedule={(id) => setRescheduleId(id)}
                onCancel={cancelAppointment}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!rescheduleId} onOpenChange={(open) => !open && setRescheduleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogramar cita</DialogTitle>
            <DialogDescription>Selecciona nueva fecha y hora.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block">Nueva fecha</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Nueva hora</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona hora" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRescheduleId(null)}>Cancelar</Button>
            <Button onClick={doReschedule} disabled={!newDate || !newTime}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentTable({ rows, onReschedule, onCancel }: { rows: Appointment[]; onReschedule: (id: string) => void; onCancel: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">No hay citas.</TableCell>
            </TableRow>
          ) : (
            rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.doctorName}</TableCell>
                <TableCell>{a.specialty}</TableCell>
                <TableCell>{a.date}</TableCell>
                <TableCell>{a.time}</TableCell>
                <TableCell>
                  <Badge variant={a.status === 'Scheduled' ? 'secondary' : 'destructive'}>
                    {a.status === 'Scheduled' ? 'Programada' : 'Cancelada'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="link" onClick={() => onReschedule(a.id)} className="px-2">Reprogramar</Button>
                      </TooltipTrigger>
                      <TooltipContent>Reprogramar cita</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" onClick={() => onCancel(a.id)} className="px-2" aria-label="Cancelar">Cancelar</Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancelar cita</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
