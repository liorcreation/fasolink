import type { ProductAvailability } from "@/lib/database.types";
import { AVAILABILITY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AvailabilityBadge({
  status,
  className,
}: {
  status: ProductAvailability;
  className?: string;
}) {
  const meta = AVAILABILITY_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        meta.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
