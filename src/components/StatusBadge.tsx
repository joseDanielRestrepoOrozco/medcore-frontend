import { Badge } from '@/components/ui/badge';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export default function StatusBadge({ status }: { status: AppointmentStatus | string }) {
  const s = String(status).toUpperCase() as AppointmentStatus;
  switch (s) {
    case 'SCHEDULED':
      return <Badge className="bg-sky-500 text-white border-transparent">Programada</Badge>;
    case 'CONFIRMED':
      return <Badge className="bg-blue-600 text-white border-transparent">Confirmada</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-amber-500 text-white border-transparent">En curso</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-green-600 text-white border-transparent">Completada</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-red-600 text-white border-transparent">Cancelada</Badge>;
    case 'NO_SHOW':
      return <Badge className="bg-neutral-500 text-white border-transparent">No-show</Badge>;
    default:
      return <Badge className="bg-neutral-400 text-white border-transparent">Desconocido</Badge>;
  }
}

