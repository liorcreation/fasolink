import type { ReactNode } from "react";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/** Titre de section éditorial : sur-titre, titre révélé + accent serif, chiffre optionnel. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  aside,
  className,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        <Reveal>
          <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-faso-red">{eyebrow}</p>
        </Reveal>
        <Tag className="fx-display mt-3 text-[clamp(1.9rem,4vw,3rem)] text-ink">
          <RevealText inView text={title} className={accent ? "mr-[.25em]" : undefined} />
          {accent && <span className="font-serif-accent fx-text-gradient inline-block pr-1 text-[1.08em]">{accent}</span>}
        </Tag>
        {description && (
          <Reveal delay={0.08}>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">{description}</p>
          </Reveal>
        )}
      </div>
      {aside}
    </div>
  );
}

export function CountChip({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-clay-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-soft shadow-sm">
      <span className="faso-tabular grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-[11px] font-extrabold text-white">{count}</span>
      {label}
    </span>
  );
}
