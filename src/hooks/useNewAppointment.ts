import api from '@/services/api';
import type { Specialty } from '@/types';
import type { Medicos, UserMedico } from '@/types/Users';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  specialty: z.string(),
  doctorId: z.string(),
  startAt: z.iso.datetime({ offset: true }),
  reason: z.string(),
});

const useNewAppointment = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<UserMedico[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: '',
      doctorId: '',
      startAt: '',
      reason: '',
    },
  });

  useEffect(() => {
    try {
      const fetchSpecialties = async () => {
        const response = await api.get('/specialties');
        setSpecialties(response.data);
      };
      fetchSpecialties();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const specialty = form.watch('specialty');

  useEffect(() => {
    // effect intentionally left blank — runs when specialty changes
    try {
      const fetchDoctorsBySpecialty = async () => {
        const response = await api.get<Medicos>(
          `/users/by-specialty?specialtyId=${specialty}`
        );
        setDoctors(response.data.users);
      };
      if (specialty) {
        fetchDoctorsBySpecialty();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      }
    }
  }, [specialty]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return { specialties, doctors, onSubmit, form };
};

export default useNewAppointment;
