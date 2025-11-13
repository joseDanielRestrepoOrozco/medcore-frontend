import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface RescheduleDialogProps {
  appointmentId: string;
  currentDate: Date;
  onReschedule: (id: string, newDate: Date) => Promise<void>;
}

const RescheduleDialog = ({
  appointmentId,
  currentDate,
  onReschedule,
}: RescheduleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Formatear la fecha actual para mostrar
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Inicializar con la fecha actual de la cita
      setNewDate(formatDateForInput(currentDate));
      setNewTime(formatTimeForInput(currentDate));
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Por favor, selecciona una fecha y hora');
      return;
    }

    // Combinar fecha y hora en formato ISO local (sin zona horaria)
    // Esto permite que el backend lo interprete en su timezone (America/Bogota)
    const combinedDateTimeStr = `${newDate}T${newTime}:00`;
    const combinedDateTime = new Date(combinedDateTimeStr);

    // Validar que la fecha sea futura
    if (combinedDateTime <= new Date()) {
      alert('La fecha debe ser en el futuro');
      return;
    }

    setLoading(true);
    try {
      await onReschedule(appointmentId, combinedDateTime);
      setOpen(false);
    } catch (error) {
      console.error('Error al reprogramar:', error);
      alert('Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Obtener la fecha mínima (hoy)
  const today = new Date();
  const minDate = formatDateForInput(today);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Reprogramar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar cita</DialogTitle>
          <DialogDescription>
            Selecciona una nueva fecha y hora para tu cita médica.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Fecha actual</Label>
            <div className="text-sm text-gray-600">
              {currentDate.toLocaleString('es-CO', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-date">Nueva fecha</Label>
            <Input
              id="new-date"
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-time">Nueva hora</Label>
            <Input
              id="new-time"
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleReschedule}
            disabled={loading || !newDate || !newTime}
          >
            {loading ? 'Reprogramando...' : 'Confirmar cambio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
