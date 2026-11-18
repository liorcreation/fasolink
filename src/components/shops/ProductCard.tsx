"use client";

import Image from "next/image";
import { AppLink as Link } from "@/components/site/AppLink";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { ArrowLeftRight, Check, MessageCircle, Smartphone } from "lucide-react";
import type { Product } from "@/lib/database.types";
import { buildWhatsAppLink, formatCFA } from "@/lib/utils";
import { trackContact } from "@/lib/tracking";
import { AvailabilityBadge } from "@/components/shops/AvailabilityBadge";
import { whatsappMessage } from "@/components/shops/WhatsAppButton";

export function ProductCard({
  product,
  shopName,
  shopId,
  whatsapp,
  index = 0,
  compareSelected = false,
  compareLimitReached = false,
  onCompareToggle,
}: {
  product: Product;
  shopName: string;
  shopId: string;
  whatsapp: string;
  index?: number;
  compareSelected?: boolean;
  compareLimitReached?: boolean;
  onCompareToggle?: () => void;
}) {
  const reduceMotion = useSafeReducedMotion();
  const soldOut = product.availability === "out_of_stock";
  const message = whatsappMessage({
    shopName,
    productName: product.name,
    price: product.price,
  });
  const href = `/boutiques/${shopId}/produits/${product.id}`;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      data-spotlight
      className="fx-spotlight group card-premium flex h-full flex-col overflow-hidden rounded-[1.6rem] hover:shadow-[0_2px_4px_rgba(26,17,9,.04),0_30px_60px_-30px_rgba(26,17,9,.38)]"
    >
      <Link href={href} className="block">
        <div className="relative m-1.5 aspect-square overflow-hidden rounded-[1.25rem] bg-[radial-gradient(ellipse_at_50%_38%,#fff,transparent_55%),linear-gradient(160deg,#faf6f0,#ece3d5)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] bottom-[9%] h-[8%] rounded-[50%] bg-ink/15 blur-xl transition-all duration-700 group-hover:inset-x-[24%] group-hover:bg-ink/10" />
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.07] sm:p-7"
            />
          )}
          {!product.image_url && <span className="absolute inset-0 grid place-items-center text-clay-300"><Smartphone className="h-12 w-12" /></span>}
          <div className="absolute left-2 top-2">
            <AvailabilityBadge
              status={product.availability}
              className="backdrop-blur-md"
            />
          </div>
        </div>
      </Link>
      {product.image_credit && (product.image_source_url?.startsWith("https://commons.wikimedia.org/") || product.image_source_url?.startsWith("https://www.pexels.com/") || product.image_source_url?.startsWith("https://pexels.com/")) && (
        <p className="truncate px-3 pt-2 text-[9px] font-medium text-ink-muted">
          Photo illustrative · {product.image_credit} · {product.image_license || "Licence"} · <a href={product.image_source_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">Source</a>
        </p>
      )}
      <div className="relative z-10 flex flex-1 flex-col p-3.5 pt-2.5">
        <Link href={href}>
          <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[.1em] text-ink-muted">{shopName}</p>
          <h3 className="text-sm font-bold text-ink group-hover:text-faso-red">
            {product.name}
          </h3>
          {(product.specifications?.brand || product.specifications?.model || product.specifications?.condition) && (
            <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-ink-muted">
              {[product.specifications.brand, product.specifications.model, conditionLabel(product.specifications.condition)].filter(Boolean).join(" · ")}
            </p>
          )}
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
              {product.description}
            </p>
          )}
        </Link>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="faso-tabular text-[15px] font-extrabold tracking-tight text-faso-green-dark">
            {formatCFA(product.price)}
          </span>
          <a
            href={buildWhatsAppLink(whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact(shopId, product.id)}
            className="btn-shine inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#1faa53] px-3.5 text-xs font-bold text-white shadow-[0_10px_22px_-12px_rgba(31,170,83,.9)] transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-green focus-visible:ring-offset-2"
            aria-label={`Commander ${product.name} sur WhatsApp`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {soldOut ? "Demander" : "Commander"}
          </a>
        </div>
        {onCompareToggle && (
          <button
            type="button"
            onClick={onCompareToggle}
            aria-pressed={compareSelected}
            disabled={compareLimitReached}
            className={`mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${compareSelected ? "border-faso-green bg-faso-green/10 text-faso-green-dark" : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold hover:text-ink"}`}
          >
            {compareSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {compareSelected ? "Ajouté au comparatif" : compareLimitReached ? "3 appareils maximum" : "Comparer"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function conditionLabel(condition?: string | null) {
  if (condition === "new") return "Neuf";
  if (condition === "used") return "Occasion";
  if (condition === "refurbished") return "Reconditionné";
  return null;
}
