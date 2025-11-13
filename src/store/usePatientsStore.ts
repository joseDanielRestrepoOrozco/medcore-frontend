import { create } from 'zustand';
import api from '@/services/api';

type User = {
  id: string;
  fullname?: string;
  email: string;
  role?: string;
  status?: string;
};

interface PatientsStore {
  patients: User[];
  loadingPatients: boolean;
  error: string | null;

  fetchPatients: (force?: boolean) => Promise<void>;
  fetchPatientById: (id: string) => Promise<User | null>;
  setPatients: (patients: User[]) => void;

  upsertPatient: (patient: User) => void;
  removePatient: (id: string) => void;
  resetPatients: () => void;
}

export const usePatientsStore = create<PatientsStore>((set, get) => ({
  patients: [],
  loadingPatients: false,
  error: null,

  async fetchPatients(force = false) {
    const { loadingPatients, patients } = get();

    // evita llamadas duplicadas si ya hay datos o se está cargando
    if (!force && (loadingPatients || patients.length > 0)) return;

    set({ loadingPatients: true, error: null });

    try {
      const params: Record<string, unknown> = {
        page: 1,
        limit: 100,
      };

      const res = await api.get('/users/patients', { params });

      const users: User[] = res.data?.users || [];

      set({
        patients: users,
        loadingPatients: false,
      });
    } catch (err: unknown) {
      console.error(
        'Error al cargar pacientes:',
        err instanceof Error ? err.message : err
      );

      set({
        loadingPatients: false,
        error:
          err instanceof Error ? err.message : 'Error al cargar los pacientes',
      });
    }
  },

  async fetchPatientById(id: string): Promise<User | null> {
    // Verificar si ya está en cache
    const cached = get().patients.find(p => p.id === id);
    if (cached) return cached;

    try {
      const res = await api.get(`/users/patients/${id}`);
      const patient: User = res.data || res.data?.user || null;

      if (patient) {
        // Guardar en cache
        get().upsertPatient(patient);
        return patient;
      }

      return null;
    } catch (err: unknown) {
      console.error(
        `Error al cargar paciente ${id}:`,
        err instanceof Error ? err.message : err
      );
      return null;
    }
  },

  setPatients(patients) {
    set({ patients });
  },

  upsertPatient(patient) {
    if (!patient || !patient.id) return;

    set(state => {
      const exists = state.patients.some(p => p.id === patient.id);

      return {
        patients: exists
          ? state.patients.map(p =>
              p.id === patient.id ? { ...p, ...patient } : p
            )
          : [patient, ...state.patients],
      };
    });
  },

  removePatient(id) {
    if (!id) return;

    set(state => {
      const prev = state.patients;
      if (!prev.some(p => p.id === id)) return state;

      return {
        patients: prev.filter(p => p.id !== id),
      };
    });
  },

  resetPatients() {
    set({ patients: [] });
  },
}));

export default usePatientsStore;
