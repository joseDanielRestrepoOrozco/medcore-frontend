export interface EmailHug {
  message: string;
  data: Diagnostic[];
}

export interface Diagnostic {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  diagnosticDate: Date;
  nextAppointment?: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
}

export interface Document {
  id: string;
  diagnosticId: string;
  filename: string;
  storedFilename: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  description?: string;
  uploadedBy: string;
  createdAt: Date;
}
