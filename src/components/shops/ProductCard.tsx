"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Smartphone } from "lucide-react";
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
}: {
  product: Product;
  shopName: string;
  shopId: string;
  whatsapp: string;
  index?: number;
}) {
  const soldOut = product.availability === "out_of_stock";
  const message = whatsappMessage({
    shopName,
    productName: product.name,
    price: product.price,
  });
  const href = `/boutiques/${shopId}/produits/${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group card-premium flex flex-col overflow-hidden"
    >
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#fff,transparent_48%),linear-gradient(145deg,#f8f4ed,#eee6d9)]">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.06] sm:p-7"
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
      <div className="flex flex-1 flex-col p-3">
        <Link href={href}>
          <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[.1em] text-ink-muted">{shopName}</p>
          <h3 className="text-sm font-bold text-ink group-hover:text-faso-red">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
              {product.description}
            </p>
          )}
        </Link>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-sm font-extrabold text-faso-green">
            {formatCFA(product.price)}
          </span>
          <a
            href={buildWhatsAppLink(whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact(shopId, product.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
            aria-label={`Commander ${product.name} sur WhatsApp`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {soldOut ? "Demander" : "Commander"}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
