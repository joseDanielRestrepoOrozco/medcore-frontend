import { http } from '@/lib/http';

export type ScheduleTemplate = {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateDTO = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type UpdateTemplateDTO = {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
};

export type TemplatesResponse = {
  templates: ScheduleTemplate[];
  count: number;
};

/**
 * Get all templates for the authenticated doctor
 */
export async function getMyTemplates(): Promise<TemplatesResponse> {
  const res = await http.get('/appointments/templates');
  return res.data;
}

/**
 * Create a new schedule template
 */
export async function createTemplate(
  data: CreateTemplateDTO
): Promise<ScheduleTemplate> {
  const res = await http.post('/appointments/templates', data);
  return res.data;
}

/**
 * Update an existing schedule template
 */
export async function updateTemplate(
  id: string,
  data: UpdateTemplateDTO
): Promise<ScheduleTemplate> {
  const res = await http.put(`/appointments/templates/${id}`, data);
  return res.data;
}

/**
 * Delete a schedule template
 */
export async function deleteTemplate(
  id: string
): Promise<{ message: string; id: string }> {
  const res = await http.delete(`/appointments/templates/${id}`);
  return res.data;
}
