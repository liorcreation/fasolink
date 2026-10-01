"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Home, Store, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  accent?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home, match: (path) => path === "/" },
  { href: "/boutiques", label: "Boutiques", icon: Store, match: (path) => path.startsWith("/boutiques") },
  { href: "/vendeur/inscription", label: "Vendre", icon: BriefcaseBusiness, match: (path) => path.startsWith("/vendeur"), accent: true },
  { href: "/profil", label: "Profil", icon: UserRound, match: (path) => path.startsWith("/profil") || path.startsWith("/connexion") || path.startsWith("/inscription") },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-clay-100/80 bg-white/92 pb-safe shadow-[0_-12px_35px_-24px_rgba(26,17,9,0.5)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4 px-2">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          if (item.accent) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link href={item.href} aria-label="Vendre sur FasoLink" aria-current={active ? "page" : undefined} className="-mt-4 flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-2 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
                  <span className={cn(
                    "grid h-12 w-12 place-items-center rounded-[1.1rem] bg-faso-gradient text-white shadow-[0_9px_22px_-11px_rgba(215,38,42,.65)] transition-transform active:scale-95",
                    active && "ring-2 ring-faso-gold ring-offset-2",
                  )}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-extrabold text-faso-red">Vendre</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex justify-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[3.5rem] min-w-[4.1rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red",
                  active ? "text-faso-red" : "text-ink-muted hover:text-ink",
                )}
              >
                {active && <motion.span layoutId="bottom-nav-active" className="absolute inset-x-2 top-0 h-[3px] rounded-full bg-faso-red" transition={{ type: "spring", stiffness: 450, damping: 35 }} />}
                <Icon className={cn("h-[19px] w-[19px]", active && "stroke-[2.5]")} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
