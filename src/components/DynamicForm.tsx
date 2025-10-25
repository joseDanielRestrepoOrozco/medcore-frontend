import React, { useState } from 'react';

export type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
};
export type Template = {
  id?: string;
  title?: string;
  description?: string;
  fields: Field[];
};

type Props = {
  template: Template;
  initial?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
};

const DynamicForm: React.FC<Props> = ({ template, initial = {}, onSubmit }) => {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {};
    for (const f of template.fields) base[f.key] = (initial as Record<string, unknown>)[f.key] ?? (f.type === 'checkbox' ? false : '');
    return base;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Error al enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {template.title && <div className="text-lg font-semibold">{template.title}</div>}
      {template.description && <div className="text-sm text-slate-600">{template.description}</div>}

      {template.fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1">{f.label}{f.required ? ' *' : ''}</label>
          {f.type === 'text' && (
            <input
              aria-label={f.label}
              title={f.label}
              value={String(values[f.key] ?? '')}
              placeholder={f.placeholder}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}

          {f.type === 'textarea' && (
            <textarea
              aria-label={f.label}
              title={f.label}
              value={String(values[f.key] ?? '')}
              placeholder={f.placeholder}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full border rounded px-3 py-2 h-28"
            />
          )}

          {f.type === 'number' && (
            <input
              type="number"
              title={f.label}
              value={values[f.key] === '' ? '' : String(values[f.key] ?? '')}
              placeholder={f.placeholder}
              onChange={(e) => handleChange(f.key, e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full border rounded px-3 py-2"
            />
          )}

          {f.type === 'date' && (
            <input
              type="date"
              title={f.label}
              value={String(values[f.key] ?? '')}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}

          {f.type === 'select' && (
            <select aria-label={f.label} title={f.label} value={String(values[f.key] ?? '')} onChange={(e) => handleChange(f.key, e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Seleccionar</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}

          {f.type === 'checkbox' && (
            <div className="flex items-center">
              <input id={f.key} type="checkbox" checked={Boolean(values[f.key])} onChange={(e) => handleChange(f.key, e.target.checked)} className="mr-2" />
              <label htmlFor={f.key} className="text-sm">{f.placeholder || ''}</label>
            </div>
          )}
        </div>
      ))}

      {error && <div className="text-red-600">{error}</div>}
      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded">
          {loading ? 'Enviando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
