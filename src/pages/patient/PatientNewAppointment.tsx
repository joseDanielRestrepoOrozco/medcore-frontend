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
import DateTimePicker from '@/components/DateTimePicker';
import FormSelectField from '@/components/FormSelectField';
import { Input } from '@/components/ui/input';
import useNewAppointment from '@/hooks/useNewAppointment';
import { useNavigate } from 'react-router-dom';

const PatientNewAppointment = () => {
  const navigate = useNavigate();
  const { form, onSubmit, doctors, specialties } = useNewAppointment();

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
                      Elige la especialidad de la cual deseas agendar una cita
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {form.getValues('doctorId') && (
              <>
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora para la cita</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          defaultTime="08:30:00"
                          offset="-05:00"
                        />
                      </FormControl>
                      <FormDescription>
                        Selecciona la fecha y hora para tu cita médica
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer">
                Agendar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientNewAppointment;
