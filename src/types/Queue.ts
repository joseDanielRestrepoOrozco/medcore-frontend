export type QueueTicket = {
  id: string;
  appointmentId: string;
  position: number;
  etaMinutes?: number;
};

export type CurrentQueue = {
  current?: QueueTicket | null;
  list: QueueTicket[];
};

