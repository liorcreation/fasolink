"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function OwnerShopActions({
  ownerId,
  shopId,
}: {
  ownerId: string;
  shopId: string;
}) {
  const { user } = useAuth();

  if (!user || user.uid !== ownerId) return null;

  return (
    <Link
      href={`/boutiques/${shopId}/parametres`}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-xs font-extrabold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-faso-gold/60 hover:text-faso-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold"
    >
      <Settings2 className="h-4 w-4 text-faso-gold-dark" />
      <span className="hidden sm:inline">Paramètres</span>
      <span className="sm:hidden">Gérer</span>
    </Link>
  );
}
