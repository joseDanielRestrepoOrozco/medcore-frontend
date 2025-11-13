import { create } from 'zustand';
import type { Appointment } from '@/types/Appointment';
import type { AppointmentStatus } from '@/services/appointments.api';
import * as appointmentsApi from '@/services/appointments.api';

interface DoctorStore {
  appointments: Appointment[];
  loadingAppointments: boolean;
  error: string | null;

  // lectura
  fetchAppointments: () => Promise<void>;
  setAppointments: (appointments: Appointment[]) => void;

  // escritura
  patchAppointmentStatus: (
    id: string,
    status: AppointmentStatus
  ) => Promise<Appointment | null>;

  // helpers locales
  upsertAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  resetAppointments: () => void;
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  appointments: [],
  loadingAppointments: false,
  error: null,

  // Carga lista de citas desde el backend usando /appointments/me (para doctores)
  async fetchAppointments() {
    if (get().loadingAppointments) return;

    set({ loadingAppointments: true, error: null });

    try {
      const items = await appointmentsApi.myAppointments();
      set({
        appointments: items,
        loadingAppointments: false,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message, loadingAppointments: false });
      } else {
        set({ error: 'Error al cargar las citas', loadingAppointments: false });
      }
    }
  },

  setAppointments(appointments) {
    set({ appointments });
  },

  async patchAppointmentStatus(id, status) {
    try {
      const updated = await appointmentsApi.patchStatus(id, status);
      set(state => ({
        appointments: state.appointments.map(a => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: 'Error al actualizar el estado de la cita' });
      }
      return null;
    }
  },

  upsertAppointment(appointment) {
    if (!appointment || !appointment.id) return;

    set(state => {
      const exists = state.appointments.some(a => a.id === appointment.id);

      return {
        appointments: exists
          ? state.appointments.map(a =>
              a.id === appointment.id ? { ...a, ...appointment } : a
            )
          : [appointment, ...state.appointments],
      };
    });
  },

  removeAppointment(id) {
    if (!id) return;

    set(state => {
      const prev = state.appointments;
      if (!prev.some(a => a.id === id)) return state;

      return {
        appointments: prev.filter(a => a.id !== id),
      };
    });
  },

  resetAppointments() {
    set({ appointments: [] });
  },
}));

export default useDoctorStore;
