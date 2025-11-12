import { http } from '@/lib/http';
import type { WeeklySchedule, Blocker } from '@/types/Schedule';

const useMock = import.meta.env.VITE_MOCK === 'true';

export async function saveWeekly(doctorId: string, weekly: WeeklySchedule) {
  if (useMock) return { ok: true } as const;
  const res = await http.post('/schedules', { doctorId, weekly });
  return res.data;
}

export async function addBlocker(doctorId: string, blocker: Blocker) {
  if (useMock) return { ok: true } as const;
  const res = await http.post('/schedules/blockers', { doctorId, ...blocker });
  return res.data;
}

