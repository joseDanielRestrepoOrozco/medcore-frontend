import { http } from '../lib/http';
import type { Appointment } from '@/types/Appointment';

export type AppointmentStatus = string;
// Acepta Date o string, se coacciona internamente
export type CreateAppointmentDTO = {
  doctor: string;
  date: Date | string;
  reason?: string;
};
export type RescheduleDTO = { date: Date | string };

// Adapters: map backend -> Appointment (lowercase statuses, date/time split)
// --- Adapter: backend -> Appointment (garantiza Date) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFromApi(a: any): Appointment {
  const raw = a?.startAt ?? a?.date ?? Date.now();
  const asDate = raw instanceof Date ? raw : new Date(raw);
  return {
    id: String(a?.id ?? a?._id ?? ''),
    doctor: String(a?.doctorName ?? a?.doctorId ?? ''),
    date: asDate,
    status: String(a?.status ?? 'SCHEDULED'),
  };
}

export async function list(params?: {
  tab?: 'upcoming' | 'past';
  from?: string;
  to?: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
}): Promise<Appointment[]> {
  const res = await http.get('/appointments', { params });
  const arr = Array.isArray(res.data) ? res.data : [];
  return arr.map(mapFromApi);
}

export async function get(id: string): Promise<Appointment> {
  const res = await http.get(`/appointments/${id}`);
  return mapFromApi(res.data);
}

export async function create(dto: CreateAppointmentDTO): Promise<Appointment> {
  const dateObj = typeof dto.date === 'string' ? new Date(dto.date) : dto.date;
  const payload = {
    doctorId: dto.doctor,
    patientId: 'me',
    startAt: dateObj.toISOString(),
    duration: 30,
    reason: dto.reason,
  };
  const res = await http.post('/appointments', payload);
  return mapFromApi(res.data);
}

export async function reschedule(
  id: string,
  dto: RescheduleDTO
): Promise<Appointment> {
  const dateObj = typeof dto.date === 'string' ? new Date(dto.date) : dto.date;

  // El backend espera la fecha SIN la 'Z' para interpretarla como hora local (America/Bogota)
  // Extraer los componentes de la fecha y formatear manualmente
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  // Formato ISO sin zona horaria: YYYY-MM-DDTHH:mm:ss
  const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

  const res = await http.patch(`/appointments/${id}/reprogram`, {
    newStartAt: localISOString,
  });
  return mapFromApi(res.data);
}

export async function cancel(id: string): Promise<{ success: boolean }> {
  await http.patch(`/appointments/${id}/cancel`);
  return { success: true };
}

export async function confirm(id: string): Promise<Appointment> {
  const res = await http.patch(`/appointments/${id}/confirm`);
  return mapFromApi(res.data);
}

export async function patchStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const res = await http.patch(`/appointments/${id}/state`, { status });
  return mapFromApi(res.data);
}
