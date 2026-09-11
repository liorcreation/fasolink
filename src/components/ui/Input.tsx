import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

const fieldCls =
  "h-12 w-full rounded-2xl border border-clay-200 bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/25 disabled:cursor-not-allowed disabled:opacity-60";
const fieldErrorCls =
  "border-faso-red focus:border-faso-red focus:ring-faso-red/20";

export interface InputProps
  extends FieldWrapperProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, inputClassName, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={required}
        className={className}
        htmlFor={fieldId}
      >
        <input
          ref={ref}
          id={fieldId}
          className={cn(fieldCls, error && fieldErrorCls, inputClassName)}
          aria-invalid={!!error}
          {...props}
        />
      </FieldShell>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps
  extends FieldWrapperProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  inputClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className, inputClassName, id, rows = 4, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={required}
        className={className}
        htmlFor={fieldId}
      >
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cn(fieldCls, "h-auto resize-none py-3", error && fieldErrorCls, inputClassName)}
          aria-invalid={!!error}
          {...props}
        />
      </FieldShell>
    );
  },
);
Textarea.displayName = "Textarea";

function FieldShell({
  label,
  error,
  hint,
  required,
  className,
  htmlFor,
  children,
}: FieldWrapperProps & { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-faso-red">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-faso-red">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>
      )}
    </label>
  );
}
