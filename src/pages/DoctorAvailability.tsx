import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon, Plus, Trash2, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

type WeeklyHour = {
  key: DayKey;
  label: string;
  active: boolean;
  start: string; // HH:mm
  end: string;   // HH:mm
};

type TimeBlock = {
  id: string;
  day: DayKey;
  from: string; // HH:mm
  to: string;   // HH:mm
  status: 'Available' | 'Unavailable';
};

const days: { key: DayKey; label: string }[] = [
  { key: 'Mon', label: 'Lun' },
  { key: 'Tue', label: 'Mar' },
  { key: 'Wed', label: 'Mié' },
  { key: 'Thu', label: 'Jue' },
  { key: 'Fri', label: 'Vie' },
  { key: 'Sat', label: 'Sáb' },
  { key: 'Sun', label: 'Dom' },
];

export default function DoctorAvailability() {
  const [available, setAvailable] = useState(true);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [weekly, setWeekly] = useState<WeeklyHour[]>(() =>
    days.map(d => ({ key: d.key, label: d.label, active: ['Mon','Tue','Wed','Thu','Fri'].includes(d.key), start: '08:00', end: '17:00' }))
  );
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({ day: 'Mon', from: '08:00', to: '12:00', status: 'Unavailable' });

  const totalActiveDays = useMemo(() => weekly.filter(d => d.active).length, [weekly]);

  const addBlock = () => {
    const id = Math.random().toString(36).slice(2);
    setBlocks(prev => [...prev, { id, ...newBlock }]);
    setDialogOpen(false);
  };

  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Disponibilidad</h1>
        <p className="text-muted-foreground">Configura tus horas semanales y bloqueos de tiempo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estado general + Configuración de intervalos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>Controla tu disponibilidad general y la duración de cada cita.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disponible</p>
                <p className="text-sm text-muted-foreground">Muestra tu agenda como disponible para nuevas citas.</p>
              </div>
              <Switch checked={available} onCheckedChange={setAvailable} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Duración de cita</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(Number(e.target.value))}
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
              <div>
                <Label className="mb-1 block">Días activos</Label>
                <div className="text-sm text-muted-foreground">{totalActiveDays} de 7</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horario semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Horas semanales</CardTitle>
            <CardDescription>Activa los días y especifica un rango de horas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weekly.map((d, idx) => (
              <div key={d.key} className="grid grid-cols-[auto,1fr,1fr] items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={d.active}
                    onCheckedChange={(v: CheckedState) => setWeekly(prev => prev.map((w, i) => i === idx ? { ...w, active: Boolean(v) } : w))}
                  />
                  <span className="w-12">{d.label}</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={d.start}
                    onChange={(e) => setWeekly(prev => prev.map((w, i) => i === idx ? { ...w, start: e.target.value } : w))}
                    aria-label={`Inicio ${d.label}`}
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="time"
                    value={d.end}
                    onChange={(e) => setWeekly(prev => prev.map((w, i) => i === idx ? { ...w, end: e.target.value } : w))}
                    aria-label={`Fin ${d.label}`}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button className="w-full sm:w-auto">Guardar cambios</Button>
            </div>
          </CardContent>
        </Card>

        {/* Bloques personalizados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bloques de tiempo</CardTitle>
                <CardDescription>Crea bloqueos o disponibilidades adicionales para días específicos.</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="size-4" />
                    Nuevo bloque
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear nuevo bloque</DialogTitle>
                    <DialogDescription>Define un rango de hora y estado para un día.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1 block">Día</Label>
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          value={newBlock.day}
                          onChange={(e) => setNewBlock(prev => ({ ...prev, day: e.target.value as DayKey }))}
                        >
                          {days.map(d => (
                            <option key={d.key} value={d.key}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="mb-1 block">Estado</Label>
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          value={newBlock.status}
                          onChange={(e) => setNewBlock(prev => ({ ...prev, status: e.target.value as 'Available' | 'Unavailable' }))}
                        >
                          <option value="Available">Disponible</option>
                          <option value="Unavailable">No disponible</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1 block">Desde</Label>
                        <Input type="time" value={newBlock.from} onChange={(e) => setNewBlock(prev => ({ ...prev, from: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="mb-1 block">Hasta</Label>
                        <Input type="time" value={newBlock.to} onChange={(e) => setNewBlock(prev => ({ ...prev, to: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={addBlock}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="size-4" />
              Gestiona bloqueos puntuales (por ejemplo, reuniones o ausencias).
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No hay bloques creados.</TableCell>
                  </TableRow>
                ) : (
                  blocks.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{days.find(d => d.key === b.day)?.label}</TableCell>
                      <TableCell>{b.from}</TableCell>
                      <TableCell>{b.to}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'Available' ? 'secondary' : 'destructive'}>
                          {b.status === 'Available' ? 'Disponible' : 'No disponible'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" aria-label="Editar" disabled>
                                <Edit className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar (próximamente)</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => removeBlock(b.id)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
