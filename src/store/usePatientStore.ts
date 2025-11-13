import { create } from 'zustand';
import type { Appointment } from '@/types/Appointment';
import type {
  AppointmentStatus,
  CreateAppointmentDTO,
  RescheduleDTO,
} from '@/services/appointments.api';
import * as appointmentsApi from '@/services/appointments.api';

interface PatientStore {
  appointments: Appointment[];
  loadingAppointments: boolean;
  error: string | null;

  // lectura
  fetchAppointments: () => Promise<void>;
  setAppointments: (appointments: Appointment[]) => void;

  // escritura (sin paginado)
  createAppointment: (dto: CreateAppointmentDTO) => Promise<Appointment | null>;
  rescheduleAppointment: (
    id: string,
    dto: RescheduleDTO
  ) => Promise<Appointment | null>;
  cancelAppointment: (id: string) => Promise<void>;
  confirmAppointment: (id: string) => Promise<Appointment | null>;
  patchAppointmentStatus: (
    id: string,
    status: AppointmentStatus
  ) => Promise<Appointment | null>;

  // helpers locales
  upsertAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  resetAppointments: () => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  appointments: [],
  loadingAppointments: false,
  error: null,

  // Carga lista de citas desde el backend usando /appointments/me
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

  async createAppointment(dto) {
    try {
      const appointment = await appointmentsApi.create(dto);
      set(state => ({
        appointments: [appointment, ...state.appointments],
      }));
      return appointment;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: 'Error al crear la cita' });
      }
      return null;
    }
  },

  async rescheduleAppointment(id, dto) {
    try {
      const updated = await appointmentsApi.reschedule(id, dto);
      set(state => ({
        appointments: state.appointments.map(a => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: 'Error al reprogramar la cita' });
      }
      return null;
    }
  },

  async cancelAppointment(id) {
    try {
      await appointmentsApi.cancel(id);
      // Reflectimos cancelación localmente (sin volver a pedir al backend)
      set(state => ({
        appointments: state.appointments.map(a =>
          a.id === id ? { ...a, status: 'CANCELLED' } : a
        ),
      }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: 'Error al cancelar la cita' });
      }
    }
  },

  async confirmAppointment(id) {
    try {
      const updated = await appointmentsApi.confirm(id);
      set(state => ({
        appointments: state.appointments.map(a => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: 'Error al confirmar una cita' });
      }
      return null;
    }
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

export default usePatientStore;
