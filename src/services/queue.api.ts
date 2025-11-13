import { http } from '../lib/http';

export type QueueTicket = {
  id: string;
  appointmentId: string;
  position: number;
  etaMinutes?: number;
};

export async function join(appointmentId: string): Promise<QueueTicket> {
  const res = await http.post('/queue/join', { appointmentId });
  return res.data as QueueTicket;
}

export async function doctorCurrent(doctorId: string): Promise<QueueTicket | null> {
  const res = await http.get('/queue/current', { params: { doctorId } });
  return (res.data as QueueTicket) || null;
}

export async function callNext(): Promise<void> {
  await http.post('/queue/call-next');
}

export async function complete(ticketId: string): Promise<void> {
  await http.post('/queue/complete', { ticketId });
}

export async function position(ticketId: string): Promise<{ position: number; etaMinutes?: number }> {
  const res = await http.get('/queue/position', { params: { ticketId } });
  return res.data as { position: number; etaMinutes?: number };
}

export function eventsUrl(ticketId: string) {
  return `/queue/events?ticketId=${encodeURIComponent(ticketId)}`;
}
