import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function FormFieldInput({ label, value, onChange, multiline, placeholder }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/70 text-xs font-medium">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-foreground/5 border-foreground/10 text-foreground min-h-[80px] text-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-foreground/5 border-foreground/10 text-foreground text-sm"
        />
      )}
    </div>
  );
}
