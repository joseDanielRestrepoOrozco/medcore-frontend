// medcore-frontend/src/store/patientStore.ts
import { create } from 'zustand';
import type { Appointment } from '@/types/Appointment';
import { list } from '@/services/appointments.api';

interface PatientStore {
  appointments: Appointment[];
  loadingAppointments: string | null;

  fetchAppointments: (force?: boolean, limit?: number) => Promise<void>;
  removeAppointment: (appointmentId: string) => void;
  upsertAppointment: (appointment: Appointment) => void;
}

const usePatientStore = create<PatientStore>((set, get) => ({
  appointments: [],
  loadingAppointments: null,

  // Igual que fetchCatalogs pero sin manejar paginación
  fetchAppointments: async (force = false) => {
    const { appointments, loadingAppointments } = get();

    // Evita llamadas duplicadas cuando ya hay datos o ya hay una petición en curso
    if (!force && (appointments.length > 0 || loadingAppointments)) return;

    set(() => ({
      loadingAppointments: 'list',
    }));

    try {
      const appointments = await list();

      set(() => ({
        appointments: appointments,
        loadingAppointments: null,
      }));
    } catch {
      set(() => ({
        loadingAppointments: null,
      }));
    }
  },

  removeAppointment: (appointmentId: string) => {
    if (!appointmentId) return;

    set(state => {
      const prev = state.appointments;

      // evita setear estado si no hay cambios
      if (!prev.some(a => a.id === appointmentId)) return state;

      return {
        appointments: prev.filter(a => a.id !== appointmentId),
      };
    });
  },

  upsertAppointment: (appointment: Appointment) => {
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
}));

export default usePatientStore;
