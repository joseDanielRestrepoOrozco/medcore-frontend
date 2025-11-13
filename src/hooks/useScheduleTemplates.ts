import { useState, useEffect, useCallback } from 'react';
import {
  getMyTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type ScheduleTemplate,
  type CreateTemplateDTO,
  type UpdateTemplateDTO,
} from '@/services/templates.api';

export function useScheduleTemplates() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTemplates();
      setTemplates(data.templates);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al cargar horarios';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTemplate = async (data: CreateTemplateDTO) => {
    const newTemplate = await createTemplate(data);
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const modifyTemplate = async (id: string, data: UpdateTemplateDTO) => {
    const updatedTemplate = await updateTemplate(id, data);
    setTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
    return updatedTemplate;
  };

  const removeTemplate = async (id: string) => {
    await deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refresh: fetchTemplates,
    addTemplate,
    modifyTemplate,
    removeTemplate,
  };
}
