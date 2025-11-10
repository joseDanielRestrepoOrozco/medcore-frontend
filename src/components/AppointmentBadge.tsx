import { Badge } from '@/components/ui/badge';

const AppointmentBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Confirmada':
      return <Badge className={'bg-green-400'}>Confirmada</Badge>;
    case 'Pendiente':
      return <Badge className={'bg-yellow-400'}>Pendiente</Badge>;
    case 'Cancelada':
      return <Badge className={'bg-red-400'}>Cancelada</Badge>;
    default:
      return <Badge className={'bg-red-400'}>Estado desconocido</Badge>;
      break;
  }
};

export default AppointmentBadge;
