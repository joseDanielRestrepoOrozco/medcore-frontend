export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  specialties?: Specialty[]; // Opcional porque puede venir vacío
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
  department: Department;
}
