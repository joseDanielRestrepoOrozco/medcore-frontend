import * as React from 'react';
import type { WeeklySchedule, Blocker } from '@/types/Schedule';

type State = {
  weekly: WeeklySchedule;
  blockers: Blocker[];
};

let state: State = { weekly: {}, blockers: [] };
const listeners = new Set<() => void>();

function set(partial: Partial<State>) {
  state = { ...state, ...partial };
  listeners.forEach(l => l());
}

export const doctorScheduleStore = {
  get: () => state,
  set,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useDoctorScheduleStore() {
  const subscribe = React.useCallback((onStoreChange: () => void) => doctorScheduleStore.subscribe(onStoreChange), []);
  const getSnapshot = React.useCallback(() => doctorScheduleStore.get(), []);
  // @ts-ignore
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as State;
}

