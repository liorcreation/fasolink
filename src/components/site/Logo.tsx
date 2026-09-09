import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="FasoLink — accueil"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-faso-gradient shadow-premium transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M12 2l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 14.77l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 2z" />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg font-display font-extrabold tracking-tight text-ink">
          Faso<span className="text-faso-red">Link</span>
        </span>
      )}
    </Link>
  );
}
