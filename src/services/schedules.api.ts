import { http } from '../lib/http';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  breaks: Array<{ start: string; end: string }>;
}

export async function list(params?: { doctorId?: string; date?: string }): Promise<DoctorSchedule[]> {
  const res = await http.get('/appointments/disponibilidad', { params: { doctor_id: params?.doctorId, fecha: params?.date } });
  // Map to schedule slices using slots array (if backend returns slots)
  const slots: string[] = Array.isArray((res.data as any)?.slots) ? (res.data as any).slots : [];
  const byHour: Record<string, string[]> = {};
  for (const iso of slots) {
    const d = new Date(iso);
    const two = (n: number) => String(n).padStart(2, '0');
    const key = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
    const hhmm = `${two(d.getHours())}:${two(d.getMinutes())}`;
    byHour[key] = byHour[key] || [];
    byHour[key].push(hhmm);
  }
  const result: DoctorSchedule[] = Object.entries(byHour).map(([date, times], idx) => ({
    id: `${date}-${idx}`,
    doctorId: String(params?.doctorId || ''),
    date,
    startTime: times[0] || '08:00',
    endTime: times[times.length - 1] || '17:00',
    breaks: [],
  }));
  return result;
}
