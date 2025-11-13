import { create } from 'zustand';
import api from '@/services/api';

type User = {
  id: string;
  fullname?: string;
  email: string;
  role?: string;
  status?: string;
  specialization?: string;
};

interface DoctorsStore {
  doctors: User[];
  loadingDoctors: boolean;
  error: string | null;

  fetchDoctors: (force?: boolean) => Promise<void>;
  fetchDoctorById: (id: string) => Promise<User | null>;
  setDoctors: (doctors: User[]) => void;

  upsertDoctor: (doctor: User) => void;
  removeDoctor: (id: string) => void;
  resetDoctors: () => void;
}

export const useDoctorsStore = create<DoctorsStore>((set, get) => ({
  doctors: [],
  loadingDoctors: false,
  error: null,

  async fetchDoctors(force = false) {
    const { loadingDoctors, doctors } = get();

    // evita llamadas duplicadas si ya hay datos o se está cargando
    if (!force && (loadingDoctors || doctors.length > 0)) return;

    set({ loadingDoctors: true, error: null });

    try {
      const params: Record<string, unknown> = {
        page: 1,
        limit: 100,
      };

      const res = await api.get('/users/doctors', { params });

      const users: User[] = res.data?.users || [];

      set({
        doctors: users,
        loadingDoctors: false,
      });
    } catch (err: unknown) {
      console.error(
        'Error al cargar médicos:',
        err instanceof Error ? err.message : err
      );

      set({
        loadingDoctors: false,
        error:
          err instanceof Error ? err.message : 'Error al cargar los médicos',
      });
    }
  },

  async fetchDoctorById(id: string): Promise<User | null> {
    // Verificar si ya está en cache
    const cached = get().doctors.find(d => d.id === id);
    if (cached) return cached;

    try {
      const res = await api.get(`/users/doctors/${id}`);
      const doctor: User = res.data || res.data?.user || null;

      if (doctor) {
        // Guardar en cache
        get().upsertDoctor(doctor);
        return doctor;
      }

      return null;
    } catch (err: unknown) {
      console.error(
        `Error al cargar doctor ${id}:`,
        err instanceof Error ? err.message : err
      );
      return null;
    }
  },

  setDoctors(doctors) {
    set({ doctors });
  },

  upsertDoctor(doctor) {
    if (!doctor || !doctor.id) return;

    set(state => {
      const exists = state.doctors.some(d => d.id === doctor.id);

      return {
        doctors: exists
          ? state.doctors.map(d =>
              d.id === doctor.id ? { ...d, ...doctor } : d
            )
          : [doctor, ...state.doctors],
      };
    });
  },

  removeDoctor(id) {
    if (!id) return;

    set(state => {
      const prev = state.doctors;
      if (!prev.some(d => d.id === id)) return state;

      return {
        doctors: prev.filter(d => d.id !== id),
      };
    });
  },

  resetDoctors() {
    set({ doctors: [] });
  },
}));

export default useDoctorsStore;
