import { ELECTRONICS_SUBCATEGORIES } from "@/lib/constants";
import { Marquee } from "@/components/fx/Marquee";

/** Bandeau défilant des univers tech réellement proposés sur FasoLink. */
export function UniverseMarquee({ cities }: { cities: string[] }) {
  const items = [
    ...ELECTRONICS_SUBCATEGORIES.map((item) => item.label),
    ...cities,
  ];

  return (
    <section aria-label="Univers et villes FasoLink" className="relative border-y border-clay-200/70 bg-white/70 py-5 backdrop-blur">
      <Marquee duration={50} gap="2.75rem">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-[2.75rem]">
            <span className="fx-display whitespace-nowrap text-[clamp(1.25rem,2.4vw,1.9rem)] text-ink/80">{item}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faso-gold">
              <path fill="currentColor" d="M12 1.5l2.6 7.1 7.5.3-5.9 4.6 2.1 7.3L12 16.6l-6.3 4.2 2.1-7.3L1.9 8.9l7.5-.3z" />
            </svg>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
