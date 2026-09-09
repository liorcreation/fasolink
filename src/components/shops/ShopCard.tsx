"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Navigation, Star } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn, formatCFA } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { OpenStatus } from "@/components/shops/OpenStatus";

export function ShopCard({
  shop,
  index = 0,
  distanceKm,
}: {
  shop: ShopWithProducts;
  index?: number;
  distanceKm?: number | null;
}) {
  const cat = CATEGORY_MAP[shop.category];
  const Icon = cat.icon;
  const from = shop.products.length
    ? Math.min(...shop.products.map((p) => p.price))
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group card-premium overflow-hidden hover:-translate-y-1 hover:shadow-premium-lg"
    >
      <Link href={`/boutiques/${shop.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-clay-100">
          {shop.cover_url && (
            <Image
              src={shop.cover_url}
              alt={`Boutique ${shop.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className={cn("backdrop-blur-md", cat.accent)}>
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </Badge>
          </div>
          {shop.verification_status === "verified" && (
            <VerifiedBadge className="absolute right-3 top-3 bg-white/90 backdrop-blur-md" />
          )}

          {typeof distanceKm === "number" && (
            <Badge className="absolute bottom-3 right-3 bg-ink/70 text-white backdrop-blur-md">
              <Navigation className="h-3 w-3" />
              {formatDistance(distanceKm)}
            </Badge>
          )}

          {shop.logo_url && (
            <div className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-premium">
              <Image
                src={shop.logo_url}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="p-4 pt-8">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-ink group-hover:text-faso-red">
              {shop.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
              <Star className="h-4 w-4 fill-faso-gold text-faso-gold" />
              {shop.rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3.5 w-3.5" />
            {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
            {shop.city}
          </p>

          <div className="mt-2">
            <OpenStatus hours={shop.opening_hours} compact />
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
            {shop.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-clay-100 pt-3">
            <span className="text-xs text-ink-muted">
              {shop.products.length} produit
              {shop.products.length > 1 ? "s" : ""}
            </span>
            {from !== null && (
              <span className="text-sm font-bold text-faso-green">
                dès {formatCFA(from)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
