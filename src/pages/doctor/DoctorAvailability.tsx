import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { useScheduleTemplates } from '@/hooks/useScheduleTemplates';
import {
  type WeeklyHour,
  initializeWeeklyHours,
  templatesToWeeklyHours,
  weeklyHourToCreateDTO,
  weeklyHourToUpdateDTO,
} from '@/utils/scheduleMapping';

export default function DoctorAvailability() {
  const [available, setAvailable] = useState(true);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [weekly, setWeekly] = useState<WeeklyHour[]>(() =>
    initializeWeeklyHours()
  );
  const [saving, setSaving] = useState(false);

  const {
    templates,
    loading,
    addTemplate,
    modifyTemplate,
    removeTemplate,
    refresh,
  } = useScheduleTemplates();

  // Cuando se cargan los templates del backend, actualizar la vista
  useEffect(() => {
    if (!loading && templates.length > 0) {
      setWeekly(templatesToWeeklyHours(templates));
    }
  }, [templates, loading]);

  const totalActiveDays = useMemo(
    () => weekly.filter(d => d.active).length,
    [weekly]
  );

  // Guarda todos los cambios pendientes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const dayHour of weekly) {
        if (dayHour.active && !dayHour.templateId) {
          // Crear nuevo template
          await addTemplate(weeklyHourToCreateDTO(dayHour));
        } else if (dayHour.active && dayHour.templateId) {
          // Actualizar template existente
          await modifyTemplate(
            dayHour.templateId,
            weeklyHourToUpdateDTO(dayHour)
          );
        } else if (!dayHour.active && dayHour.templateId) {
          // Eliminar template si está inactivo
          await removeTemplate(dayHour.templateId);
        }
      }
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Disponibilidad</h1>
        <p className="text-muted-foreground">Configura tus horas semanales.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Estado general + Configuración de intervalos */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
              <CardDescription>
                Controla tu disponibilidad general y la duración de cada cita.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra tu agenda como disponible para nuevas citas.
                  </p>
                </div>
                <Switch checked={available} onCheckedChange={setAvailable} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">Duración de cita</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={slotMinutes}
                    onChange={e => setSlotMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block">Días activos</Label>
                  <div className="text-sm text-muted-foreground">
                    {totalActiveDays} de 7
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horario semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Horas semanales</CardTitle>
              <CardDescription>
                Activa los días y especifica un rango de horas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weekly.map((d, idx) => (
                <div
                  key={d.key}
                  className="grid grid-cols-[auto,1fr,1fr] items-center gap-3"
                >
                  <label className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={d.active}
                      onCheckedChange={(v: CheckedState) =>
                        setWeekly(prev =>
                          prev.map((w, i) =>
                            i === idx ? { ...w, active: Boolean(v) } : w
                          )
                        )
                      }
                    />
                    <span className="w-12">{d.label}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={d.start}
                      onChange={e =>
                        setWeekly(prev =>
                          prev.map((w, i) =>
                            i === idx ? { ...w, start: e.target.value } : w
                          )
                        )
                      }
                      aria-label={`Inicio ${d.label}`}
                      disabled={!d.active}
                    />
                    <span className="text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={d.end}
                      onChange={e =>
                        setWeekly(prev =>
                          prev.map((w, i) =>
                            i === idx ? { ...w, end: e.target.value } : w
                          )
                        )
                      }
                      aria-label={`Fin ${d.label}`}
                      disabled={!d.active}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
