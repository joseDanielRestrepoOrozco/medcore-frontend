import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  defaultTime?: string;
  offset?: string;
}

const DateTimePicker = ({
  value,
  onChange,
  defaultTime = '08:30:00',
  offset = '-05:00',
}: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [time, setTime] = useState<string>(defaultTime);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const formatDateTime = (selectedDate: Date, selectedTime: string) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${selectedTime}${offset}`;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpenDatePicker(false);
    if (selectedDate) {
      const formatted = formatDateTime(selectedDate, time);
      onChange(formatted);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const formatted = formatDateTime(date, newTime);
      onChange(formatted);
    }
  };

  return (
    <div className="flex gap-4 flex-col md:flex-row">
      <div className="flex flex-col gap-3">
        <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-52 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : 'Selecciona fecha'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          step={1800}
          value={time}
          onChange={e => handleTimeChange(e.target.value)}
          className="bg-background w-32 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
