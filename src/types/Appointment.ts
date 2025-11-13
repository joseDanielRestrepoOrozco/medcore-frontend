export interface NewAppointment {
  doctor: string;
  date: Date;
  status: string;
}

export interface Appointment extends NewAppointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  reason?: string;
}
