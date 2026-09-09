"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, cn, formatCFA } from "@/lib/utils";
import { trackContact } from "@/lib/tracking";

export function whatsappMessage(opts: {
  shopName: string;
  productName?: string;
  price?: number;
}) {
  if (opts.productName) {
    const price = opts.price ? ` (${formatCFA(opts.price)})` : "";
    return `Bonjour ${opts.shopName}, je suis intéressé(e) par le produit "${opts.productName}"${price} vu sur FasoLink. Est-il disponible ?`;
  }
  return `Bonjour ${opts.shopName}, je vous contacte depuis FasoLink.`;
}

export function WhatsAppButton({
  phone,
  shopName,
  shopId,
  productId,
  productName,
  price,
  className,
  size = "lg",
  label = "Contacter sur WhatsApp",
}: {
  phone: string;
  shopName: string;
  shopId?: string;
  productId?: string;
  productName?: string;
  price?: number;
  className?: string;
  size?: "sm" | "lg";
  label?: string;
}) {
  const message = whatsappMessage({ shopName, productName, price });

  return (
    <a
      href={buildWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => shopId && trackContact(shopId, productId)}
      className={cn(
        "btn-base bg-[#25D366] text-white shadow-premium hover:bg-[#1da851] hover:-translate-y-0.5",
        size === "lg" ? "h-14 px-8 text-base" : "h-10 px-5 text-sm",
        className,
      )}
    >
      <MessageCircle className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {label}
    </a>
  );
}
