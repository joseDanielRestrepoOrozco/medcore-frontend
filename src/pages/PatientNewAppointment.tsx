import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import FormSelectField from '@/components/FormSelectField';
import { Input } from '@/components/ui/input';
import useNewAppointment from '@/hooks/useNewAppointment';
import { useNavigate } from 'react-router-dom';

const PatientNewAppointment = () => {
  const navigate = useNavigate();
  const {
    form,
    onSubmit,
    doctors,
    specialties,
    availableSlots,
    selectedDate,
    setSelectedDate,
    loadingSlots,
    isSubmitting,
  } = useNewAppointment();

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="m-5 md:mx-auto max-w-lg overflow-x-auto">
      <CardHeader>
        <CardTitle>Agendar una nueva cita medica</CardTitle>
        <CardDescription>
          Agenda una nueva cita medica para una especialidad deseada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormSelectField
                        placeholder="seleccione una especialidad"
                        label="Especialidad"
                      >
                        {specialties.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </FormSelectField>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Elige la especialidad de la cual deseas agendar una cita
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {doctors.length > 0 && (
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <FormSelectField
                          placeholder="Seleccione su doctor"
                          label="Doctor"
                        >
                          {doctors.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.fullname}
                            </SelectItem>
                          ))}
                        </FormSelectField>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Elige el doctor de tu preferencia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {form.getValues('doctorId') && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Selecciona la fecha
                  </label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={date =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    className="rounded-md border"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Selecciona la fecha para ver horarios disponibles
                  </p>
                </div>

                {selectedDate && (
                  <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horarios disponibles</FormLabel>
                        <FormControl>
                          <div className="border rounded-md">
                            {loadingSlots ? (
                              <p className="p-4 text-center text-muted-foreground">
                                Cargando horarios...
                              </p>
                            ) : availableSlots.length === 0 ? (
                              <p className="p-4 text-center text-muted-foreground">
                                No hay horarios disponibles para esta fecha
                              </p>
                            ) : (
                              <div className="grid grid-cols-3 gap-2 p-4">
                                {availableSlots.map(slot => (
                                  <Button
                                    key={slot}
                                    type="button"
                                    variant={
                                      field.value === slot
                                        ? 'default'
                                        : 'outline'
                                    }
                                    className="cursor-pointer"
                                    onClick={() => field.onChange(slot)}
                                  >
                                    {formatTime(slot)}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Selecciona un horario disponible
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.getValues('startAt') && (
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón de la cita medica</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="dolor estomacal, fuerte dolor en el pecho,..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                type="button"
                onClick={() => {
                  navigate('/patient/appointments');
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agendando...' : 'Agendar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientNewAppointment;
