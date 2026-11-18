import { AppLink as Link } from "@/components/site/AppLink";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, MapPin, Star } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/fx/RevealText";

export function FeaturedCarousel({ shops }: { shops: ShopWithProducts[] }) {
  const featured = shops.filter((s) => s.is_featured).slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24">
      <div className="container-faso flex items-end justify-between gap-6">
        <div>
          <Reveal>
            <span className="section-kicker">À la une</span>
          </Reveal>
          <h2 className="fx-display mt-5 text-[clamp(2.1rem,4.4vw,3.5rem)] text-ink">
            <RevealText inView text="Boutiques tech" className="mr-3" />
            <span className="font-serif-accent fx-text-gradient text-[1.08em]">à la une.</span>
          </h2>
        </div>
        <Link
          href="/boutiques"
          className="group hidden shrink-0 items-center gap-2 rounded-full border border-clay-200 bg-white px-4 py-2.5 text-sm font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-premium sm:inline-flex"
        >
          Toutes les boutiques
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Carrousel défilable au doigt (scroll-snap) */}
      <div className="snap-row no-scrollbar mt-10 flex gap-5 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
        {featured.map((shop, i) => {
          const cat = CATEGORY_MAP[shop.category];
          const from = shop.products.length
            ? Math.min(...shop.products.map((p) => p.price))
            : null;
          return (
            <Reveal
              key={shop.id}
              y={28}
              delay={Math.min(i * 0.07, 0.35)}
              className="snap-item shrink-0"
            >
              <Link
                href={`/boutiques/${shop.id}`}
                data-spotlight
                className="fx-spotlight fx-spotlight-dark group relative block aspect-[4/5] w-[78vw] overflow-hidden rounded-[2rem] bg-ink shadow-[0_30px_60px_-34px_rgba(26,17,9,.6)] transition-transform duration-500 hover:-translate-y-1.5 sm:w-[340px]"
              >
                {shop.cover_url && (
                  <Image
                    src={shop.cover_url}
                    alt={`Boutique ${shop.name}`}
                    fill
                    sizes="(max-width: 640px) 78vw, 340px"
                    className="object-cover opacity-90 transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d09] via-[#120d09]/35 to-transparent" />

                <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur">
                    <cat.icon className="h-3.5 w-3.5 text-faso-red" />
                    {cat.label}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
                  {shop.verification_status === "verified" && (
                    <VerifiedBadge className="mb-3 bg-white/90 backdrop-blur-md" />
                  )}
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="font-display text-2xl font-extrabold leading-tight tracking-[-.03em]">
                      {shop.name}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-bold backdrop-blur">
                      <Star className="h-3.5 w-3.5 fill-faso-gold text-faso-gold" />
                      {shop.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-white/70">
                    <MapPin className="h-3.5 w-3.5" />
                    {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                    {shop.city}
                  </p>
                  {from !== null && (
                    <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-[#9fe7bb] backdrop-blur">
                      dès {formatCFA(from)}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
        <span className="shrink-0 pr-1" aria-hidden />
      </div>
    </section>
  );
}
