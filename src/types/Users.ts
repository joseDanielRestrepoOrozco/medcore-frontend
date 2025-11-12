export interface Medicos {
  users: UserMedico[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserMedico {
  medico: Medico;
  enfermera: null;
  paciente: null;
  id: string;
  email: string;
  fullname: string;
  documentNumber: string;
  role: string;
  date_of_birth: Date;
  age: number;
  phone: string;
  gender: null | string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medico {
  specialtyId: string;
  license_number: string;
}
