import { Badge } from '@/components/ui/badge';

const AppointmentBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toUpperCase();

  switch (normalizedStatus) {
    case 'SCHEDULED':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Programada
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Confirmada
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          Cancelada
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          En Progreso
        </Badge>
      );
    case 'NO_SHOW':
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
          No Asistió
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge className="bg-teal-500 hover:bg-teal-600 text-white">
          Completada
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
          Estado desconocido
        </Badge>
      );
  }
};

export default AppointmentBadge;
