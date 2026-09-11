"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/boutiques", label: "Explorer" },
  { href: "/inscription", label: "Devenir membre" },
  { href: "/vendeur/dashboard", label: "Espace vendeur" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-clay-100 bg-clay-50/80 backdrop-blur-lg"
          : "bg-transparent",
      )}
    >
      <nav className="container-faso-wide flex h-16 items-center justify-between md:h-20">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-clay-100 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href="/vendeur/inscription" variant="outline" size="sm">
            <Store className="h-4 w-4" />
            Ouvrir ma boutique
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-clay-200 bg-white text-ink md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <div className="container-faso-wide flex flex-col gap-2 border-t border-clay-100 bg-clay-50 pb-6 pt-3">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-ink-soft hover:bg-clay-100"
                >
                  {l.label}
                </Link>
              ))}
              <ButtonLink
                href="/vendeur/inscription"
                variant="primary"
                size="lg"
                className="mt-2 w-full"
                onClick={() => setOpen(false)}
              >
                <Store className="h-4 w-4" />
                Ouvrir ma boutique
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
