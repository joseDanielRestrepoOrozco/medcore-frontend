import * as React from 'react';
import type { QueueTicket } from '@/types/Queue';

type State = {
  current: QueueTicket | null;
  list: QueueTicket[];
};

let state: State = { current: null, list: [] };
const listeners = new Set<() => void>();

function set(partial: Partial<State>) {
  state = { ...state, ...partial };
  listeners.forEach(l => l());
}

export const doctorQueueStore = {
  get: () => state,
  set,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useDoctorQueueStore() {
  const subscribe = React.useCallback((onStoreChange: () => void) => doctorQueueStore.subscribe(onStoreChange), []);
  const getSnapshot = React.useCallback(() => doctorQueueStore.get(), []);
  // @ts-ignore
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as State;
}

