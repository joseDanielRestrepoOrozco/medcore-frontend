import { Badge } from "@/components/ui/badge";

const AppointmentBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "SCHEDULED":
      return <Badge className={"bg-green-400"}>Confirmada</Badge>;
    case "Pendiente":
      return <Badge className={"bg-yellow-400"}>Pendiente</Badge>;
    case "CANCELLED":
      return <Badge className={"bg-red-400"}>Cancelada</Badge>;
    default:
      return <Badge className={"bg-red-400"}>Estado desconocido</Badge>;
  }
};

export default AppointmentBadge;
