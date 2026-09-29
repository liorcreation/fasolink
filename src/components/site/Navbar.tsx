"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Accueil", match: (path: string) => path === "/" },
  { href: "/vendeur/dashboard", label: "Espace vendeur", match: (path: string) => path.startsWith("/vendeur") },
  { href: "/profil", label: "Mon profil", match: (path: string) => path.startsWith("/profil") },
];

export function Navbar() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-clay-100/80 bg-clay-50/85 shadow-[0_12px_32px_-26px_rgba(26,17,9,0.5)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="container-faso relative flex h-16 items-center md:h-20">
        <Logo linked={false} />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/80 hover:text-ink",
                l.match(pathname)
                  ? "bg-white/80 text-ink shadow-sm"
                  : "text-ink-soft",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <ButtonLink href="/vendeur/inscription" variant="outline" size="sm">
            <Store className="h-4 w-4" />
            Ouvrir ma boutique
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
