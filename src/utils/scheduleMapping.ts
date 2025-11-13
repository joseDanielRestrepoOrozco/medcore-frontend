import type { ScheduleTemplate } from '@/services/templates.api';

export type DayKey = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type WeeklyHour = {
  key: DayKey;
  label: string;
  active: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
  templateId?: string; // ID del template en backend
};

// Mapping between DayKey and dayOfWeek number
const DAY_KEY_TO_NUMBER: Record<DayKey, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const NUMBER_TO_DAY_KEY: Record<number, DayKey> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

const DAY_LABELS: Record<DayKey, string> = {
  Sun: 'Domingo',
  Mon: 'Lunes',
  Tue: 'Martes',
  Wed: 'Miércoles',
  Thu: 'Jueves',
  Fri: 'Viernes',
  Sat: 'Sábado',
};

/**
 * Convert dayOfWeek number to DayKey
 */
export function dayNumberToDayKey(dayNumber: number): DayKey {
  return NUMBER_TO_DAY_KEY[dayNumber] || 'Sun';
}

/**
 * Convert DayKey to dayOfWeek number
 */
export function dayKeyToDayNumber(dayKey: DayKey): number {
  return DAY_KEY_TO_NUMBER[dayKey] || 0;
}

/**
 * Get label for a DayKey
 */
export function getDayLabel(dayKey: DayKey): string {
  return DAY_LABELS[dayKey] || '';
}

/**
 * Initialize weekly hours with default structure
 */
export function initializeWeeklyHours(): WeeklyHour[] {
  const days: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(key => ({
    key,
    label: getDayLabel(key),
    active: false,
    start: '08:00',
    end: '18:00',
    templateId: undefined,
  }));
}

/**
 * Convert backend templates to frontend weekly hours
 */
export function templatesToWeeklyHours(
  templates: ScheduleTemplate[]
): WeeklyHour[] {
  const weeklyHours = initializeWeeklyHours();

  templates.forEach(template => {
    const dayKey = dayNumberToDayKey(template.dayOfWeek);
    const weeklyHour = weeklyHours.find(wh => wh.key === dayKey);
    if (weeklyHour) {
      weeklyHour.active = true;
      weeklyHour.start = template.startTime;
      weeklyHour.end = template.endTime;
      weeklyHour.templateId = template.id;
    }
  });

  return weeklyHours;
}

/**
 * Convert a WeeklyHour to CreateTemplateDTO format
 */
export function weeklyHourToCreateDTO(weeklyHour: WeeklyHour) {
  return {
    dayOfWeek: dayKeyToDayNumber(weeklyHour.key),
    startTime: weeklyHour.start,
    endTime: weeklyHour.end,
  };
}

/**
 * Convert a WeeklyHour to UpdateTemplateDTO format
 */
export function weeklyHourToUpdateDTO(weeklyHour: WeeklyHour) {
  return {
    dayOfWeek: dayKeyToDayNumber(weeklyHour.key),
    startTime: weeklyHour.start,
    endTime: weeklyHour.end,
  };
}
