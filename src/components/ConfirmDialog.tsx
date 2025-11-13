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

interface ConfirmDialogProps {
  appointmentId: string;
  appointmentDate: Date;
  onConfirm: (id: string) => Promise<void>;
}

const ConfirmDialog = ({
  appointmentId,
  appointmentDate,
  onConfirm,
}: ConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(appointmentId);
      setOpen(false);
    } catch (error) {
      console.error('Error al confirmar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
        >
          Confirmar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar asistencia</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que confirmas tu asistencia a esta cita médica?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Fecha y hora:</span>
              <span className="text-gray-900">
                {appointmentDate.toLocaleString('es-CO', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Al confirmar, te comprometes a asistir a la cita en la fecha y
                hora indicadas.
              </p>
            </div>
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
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Confirmando...' : 'Sí, confirmar cita'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
