import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "border border-clay-200/80 bg-clay-50 text-ink-soft",
  brand: "border border-faso-red/15 bg-faso-red-50 text-faso-red-dark",
  success: "border border-state-success/15 bg-state-success/10 text-state-success",
  warning: "border border-state-warning/15 bg-state-warning/10 text-state-warning",
  danger: "border border-state-danger/15 bg-state-danger/10 text-state-danger",
  info: "border border-state-info/15 bg-state-info/10 text-state-info",
};

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
