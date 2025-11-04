import type { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type InputFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register?: UseFormRegister<T>;
  error?: string | undefined;
} & React.InputHTMLAttributes<HTMLInputElement>;

function InputField<T extends FieldValues>({
  label,
  name,
  register,
  error,
  className,
  ...rest
}: InputFieldProps<T>) {
  return (
    <div className="mt-4">
      <Label className="mb-1 block">{label}</Label>
      <Input
        {...(register ? register(name) : {})}
        {...rest}
        aria-invalid={Boolean(error) || undefined}
        className={className}
      />
      {error && (
        <span className="block text-red-600 text-sm mt-1">{error}</span>
      )}
    </div>
  );
}

export default InputField;
