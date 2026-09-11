"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Store, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  accent?: boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Accueil",
    icon: Home,
    match: (p) => p === "/",
  },
  {
    href: "/boutiques",
    label: "Explorer",
    icon: Search,
    match: (p) => p.startsWith("/boutiques"),
  },
  {
    href: "/vendeur/inscription",
    label: "Vendre",
    icon: Store,
    match: (p) => p.startsWith("/vendeur"),
    accent: true,
  },
  {
    href: "/profil",
    label: "Mon Profil",
    icon: User,
    match: (p) => p.startsWith("/profil") || p.startsWith("/inscription"),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-clay-100 bg-white/95 pb-safe backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          if (item.accent) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="-mt-5 flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl bg-faso-gradient text-white shadow-glow transition-transform active:scale-95",
                      active && "ring-2 ring-faso-gold ring-offset-2",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold text-faso-red">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                  active ? "text-faso-red" : "text-ink-muted",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.5]")}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
