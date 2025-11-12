import {
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FormSelectField = ({
  children,
  label,
  placeholder,
}: {
  children: React.ReactNode;
  label: string;
  placeholder: string;
}) => {
  return (
    <>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {children}
        </SelectGroup>
      </SelectContent>
    </>
  );
};

export default FormSelectField;
