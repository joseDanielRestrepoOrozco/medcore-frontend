import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from './ui/button';
import { DialogFooter, DialogHeader } from './ui/dialog';

const CancelDialog = ({
  id,
  onCancel,
}: {
  id: string;
  onCancel: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    onCancel(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="destructive">
          Cancelar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar cita?</DialogTitle>
          <DialogDescription>
            El cancelar una cita es un proceso irreversible y requiere de una
            anticipación de al menos 4 horas, ¿esta seguro de esta opción?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="cursor-pointer" variant={'ghost'}>
              Salir
            </Button>
          </DialogClose>
          <Button
            className="cursor-pointer"
            variant={'destructive'}
            onClick={handleCancel}
          >
            Cancelar cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelDialog;
