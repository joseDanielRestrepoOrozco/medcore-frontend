export type DayRange = { start: string; end: string };
export type WeeklySchedule = {
  monday?: DayRange[];
  tuesday?: DayRange[];
  wednesday?: DayRange[];
  thursday?: DayRange[];
  friday?: DayRange[];
  saturday?: DayRange[];
  sunday?: DayRange[];
};

export type Blocker = { date: string; start: string; end: string; reason?: string };

