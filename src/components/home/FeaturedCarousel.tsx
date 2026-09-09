import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Star } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedCarousel({ shops }: { shops: ShopWithProducts[] }) {
  const featured = shops.filter((s) => s.is_featured).slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container-faso flex items-end justify-between">
        <Reveal>
          <span className="text-sm font-bold uppercase tracking-widest text-faso-gold-dark">
            À la une
          </span>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
            Boutiques vedettes
          </h2>
        </Reveal>
        <Link
          href="/#explorer"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-faso-red hover:gap-2 sm:inline-flex"
        >
          Tout voir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Carrousel défilable au doigt (scroll-snap) */}
      <div className="snap-row no-scrollbar mt-6 flex gap-4 overflow-x-auto px-5 pb-2 sm:px-8 lg:px-10">
        {featured.map((shop) => {
          const cat = CATEGORY_MAP[shop.category];
          const from = shop.products.length
            ? Math.min(...shop.products.map((p) => p.price))
            : null;
          return (
            <Link
              key={shop.id}
              href={`/boutiques/${shop.id}`}
              className="snap-item group relative w-[78vw] shrink-0 overflow-hidden rounded-3xl border border-clay-100 bg-white shadow-premium transition-shadow hover:shadow-premium-lg sm:w-[340px]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-clay-100">
                {shop.cover_url && (
                  <Image
                    src={shop.cover_url}
                    alt={`Boutique ${shop.name}`}
                    fill
                    sizes="(max-width: 640px) 78vw, 340px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur">
                  <cat.icon className="h-3.5 w-3.5 text-faso-red" />
                  {cat.label}
                </span>
                {shop.verification_status === "verified" && (
                  <VerifiedBadge className="absolute right-3 top-3 bg-white/90 backdrop-blur-md" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-faso-red">
                    {shop.name}
                  </h3>
                  <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                    <Star className="h-4 w-4 fill-faso-gold text-faso-gold" />
                    {shop.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                  {shop.city}
                </p>
                {from !== null && (
                  <p className="mt-2 text-sm font-bold text-faso-green">
                    dès {formatCFA(from)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
        <span className="shrink-0 pr-1" aria-hidden />
      </div>
    </section>
  );
}
