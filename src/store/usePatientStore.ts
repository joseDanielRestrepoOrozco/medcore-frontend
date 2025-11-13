import { create } from "zustand";
import type { Appointment } from "@/types/Appointment";
import type {
  AppointmentStatus,
  CreateAppointmentDTO,
  RescheduleDTO,
} from "@/services/appointments.api";
import * as appointmentsApi from "@/services/appointments.api";

// Reutilizamos el tipo de parámetros del list para no duplicar tipos
type ListParams = Parameters<typeof appointmentsApi.list>[0];

interface PatientStore {
  appointments: Appointment[];
  loadingAppointments: boolean;
  error: string | null;

  // lectura
  fetchAppointments: (params?: ListParams) => Promise<void>;
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

  // Carga lista de citas desde el backend (upcoming/past, rango de fechas, etc.)
  async fetchAppointments(params) {
    if (get().loadingAppointments) return;

    set({ loadingAppointments: true, error: null });

    // Por defecto, si no viene patientId, asumimos "me"
    const effectiveParams: ListParams = { ...(params || {}) };
    if (!effectiveParams?.patientId) {
      effectiveParams.patientId = "me";
    }

    try {
      const items = await appointmentsApi.list(effectiveParams);
      set({
        appointments: items,
        loadingAppointments: false,
      });
    } catch (err: any) {
      set({
        loadingAppointments: false,
        error: err?.message ?? "Error al cargar las citas",
      });
    }
  },

  setAppointments(appointments) {
    set({ appointments });
  },

  async createAppointment(dto) {
    try {
      const appointment = await appointmentsApi.create(dto);
      set((state) => ({
        appointments: [appointment, ...state.appointments],
      }));
      return appointment;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al crear la cita",
      });
      return null;
    }
  },

  async rescheduleAppointment(id, dto) {
    try {
      const updated = await appointmentsApi.reschedule(id, dto);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? updated : a
        ),
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al reprogramar la cita",
      });
      return null;
    }
  },

  async cancelAppointment(id) {
    try {
      await appointmentsApi.cancel(id);
      // Reflectimos cancelación localmente (sin volver a pedir al backend)
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: "CANCELED" } : a
        ),
      }));
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al cancelar la cita",
      });
    }
  },

  async confirmAppointment(id) {
    try {
      const updated = await appointmentsApi.confirm(id);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? updated : a
        ),
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al confirmar la cita",
      });
      return null;
    }
  },

  async patchAppointmentStatus(id, status) {
    try {
      const updated = await appointmentsApi.patchStatus(id, status);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? updated : a
        ),
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al actualizar el estado de la cita",
      });
      return null;
    }
  },

  upsertAppointment(appointment) {
    if (!appointment || !appointment.id) return;

    set((state) => {
      const exists = state.appointments.some((a) => a.id === appointment.id);

      return {
        appointments: exists
          ? state.appointments.map((a) =>
              a.id === appointment.id ? { ...a, ...appointment } : a
            )
          : [appointment, ...state.appointments],
      };
    });
  },

  removeAppointment(id) {
    if (!id) return;

    set((state) => {
      const prev = state.appointments;
      if (!prev.some((a) => a.id === id)) return state;

      return {
        appointments: prev.filter((a) => a.id !== id),
      };
    });
  },

  resetAppointments() {
    set({ appointments: [] });
  },
}));

export default usePatientStore;
