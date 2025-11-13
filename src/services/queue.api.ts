import { http } from '../lib/http';

export type QueueTicket = {
  id: string;
  appointmentId: string;
  position: number;
  etaMinutes?: number;
};

export type DoctorAppointment = {
  id: string;
  patientId: string;
  doctorId: string;
  specialtyId?: string;
  reason?: string;
  startAt: string;
  endAt: string;
  duration: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  position?: number;
};

export type QueueResponse = {
  queue: DoctorAppointment[];
  total: number;
};

export type CallNextResponse = {
  appointment: DoctorAppointment;
  waitingCount: number;
};

export async function join(appointmentId: string): Promise<QueueTicket> {
  const res = await http.post('/queue/join', { appointmentId });
  return res.data as QueueTicket;
}

/**
 * Get the full queue for the authenticated doctor
 * Returns CONFIRMED and IN_PROGRESS appointments
 */
export async function getDoctorQueue(): Promise<QueueResponse> {
  const res = await http.get('/queue/join');
  return res.data as QueueResponse;
}

export async function doctorCurrent(
  doctorId: string
): Promise<QueueTicket | null> {
  const res = await http.get('/queue/current', { params: { doctorId } });
  return (res.data as QueueTicket) || null;
}

/**
 * Get current appointment being attended by the authenticated doctor
 */
export async function getCurrentAppointment(): Promise<{
  appointment: DoctorAppointment | null;
  message?: string;
}> {
  const res = await http.get('/queue/current');
  return res.data;
}

/**
 * Call next appointment in queue (CONFIRMED -> IN_PROGRESS)
 */
export async function callNext(): Promise<CallNextResponse> {
  const res = await http.post('/queue/call-next');
  return res.data as CallNextResponse;
}

/**
 * Complete an appointment (IN_PROGRESS -> COMPLETED)
 */
export async function complete(
  ticketId: string
): Promise<{ appointmentId: string; status: string }> {
  const res = await http.put(`/queue/ticket/${ticketId}/complete`);
  return res.data;
}

/**
 * Mark appointment as NO_SHOW
 */
export async function markNoShow(
  ticketId: string
): Promise<{ appointmentId: string; status: string; message: string }> {
  const res = await http.patch(`/queue/ticket/${ticketId}/no-show`);
  return res.data;
}

export async function position(
  ticketId: string
): Promise<{ position: number; etaMinutes?: number }> {
  const res = await http.get('/queue/position', { params: { ticketId } });
  return res.data as { position: number; etaMinutes?: number };
}

export function eventsUrl(ticketId: string) {
  return `/queue/events?ticketId=${encodeURIComponent(ticketId)}`;
}

export async function getMyAppointmentsByDate(
  date: string
): Promise<{ date: string; appointments: DoctorAppointment[]; count: number }> {
  const res = await http.get('/queue/my-appointments', { params: { date } });
  return res.data;
}
