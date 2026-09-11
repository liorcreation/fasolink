"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Sélecteur stylé maison — jamais un <select> natif (rendu OS non maîtrisé
 * à l'ouverture). S'appuie sur BottomSheet, qui s'adapte déjà en tiroir sur
 * mobile et en dialogue centré dès `sm`, pour ne pas réinventer un 4e
 * pattern de superposition dans l'app.
 */
export function Select({
  label,
  error,
  hint,
  required,
  value,
  onChange,
  options,
  placeholder = "Sélectionner…",
  disabled,
  className,
  id,
}: {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-faso-red">*</span>}
        </span>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-12 w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-clay-200 bg-white px-4 text-sm text-ink outline-none transition-colors focus-visible:border-faso-gold focus-visible:ring-2 focus-visible:ring-faso-gold/25 disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-faso-red",
          !selected && "text-ink-muted",
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-faso-red">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>
      )}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label ?? placeholder}
      >
        <ul role="listbox" className="space-y-1 pb-4">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-faso-gold-soft/30 text-ink"
                      : "text-ink-soft hover:bg-clay-100",
                  )}
                >
                  {o.label}
                  {active && <Check className="h-4 w-4 text-faso-gold-dark" />}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </div>
  );
}
