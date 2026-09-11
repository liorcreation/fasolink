"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search, Store, X } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn, formatCFA } from "@/lib/utils";

interface Hit {
  type: "shop" | "product";
  id: string;
  href: string;
  title: string;
  subtitle: string;
  image: string | null;
  price: number | null;
}

function buildIndex(shops: ShopWithProducts[]): Hit[] {
  const hits: Hit[] = [];
  for (const s of shops) {
    hits.push({
      type: "shop",
      id: s.id,
      href: `/boutiques/${s.id}`,
      title: s.name,
      subtitle: `${CATEGORY_MAP[s.category].label} · ${s.city}`,
      image: s.logo_url ?? s.cover_url,
      price: null,
    });
    for (const p of s.products) {
      hits.push({
        type: "product",
        id: p.id,
        href: `/boutiques/${s.id}`,
        title: p.name,
        subtitle: s.name,
        image: p.image_url,
        price: p.price,
      });
    }
  }
  return hits;
}

export function PredictiveSearch({ shops }: { shops: ShopWithProducts[] }) {
  const router = useRouter();
  const index = useMemo(() => buildIndex(shops), [shops]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Le portail vers document.body ne peut être rendu qu'une fois monté côté
  // client (évite tout mismatch d'hydratation SSR).
  useEffect(() => setMounted(true), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return index
      .filter((h) => (h.title + " " + h.subtitle).toLowerCase().includes(q))
      .sort((a, b) => {
        const as = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs;
      })
      .slice(0, 7);
  }, [query, index]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (document.activeElement?.tagName === "INPUT") return;
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(hit: Hit) {
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (results[active]) go(results[active]);
      else if (query.trim()) {
        setOpen(false);
        router.push(`/#explorer`);
      }
    }
  }

  return (
    <>
      {/* Déclencheur : faux champ de recherche */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-2xl border border-clay-200 bg-white/80 px-4 py-3.5 text-left shadow-premium backdrop-blur transition-all hover:border-faso-gold hover:shadow-premium-lg"
      >
        <Search className="h-5 w-5 text-ink-muted" />
        <span className="flex-1 text-sm text-ink-muted">
          Rechercher un produit, une boutique…
        </span>
        <kbd className="hidden rounded-md border border-clay-200 bg-clay-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted sm:block">
          Ctrl K
        </kbd>
      </button>

      {/*
        Portail vers document.body : le Hero applique un effet de parallax
        (transform CSS) sur ses enfants au défilement, or un ancêtre avec
        transform devient le référentiel de tout descendant en
        position:fixed — sans portail, cette fenêtre de recherche se
        retrouvait coincée dans la colonne du Hero au lieu de couvrir tout
        l'écran. Le portail la fait sortir de cette arborescence.
      */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/50 p-4 backdrop-blur-sm sm:pt-24"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-xl overflow-hidden rounded-3xl border border-clay-100 bg-white shadow-premium-lg"
                >
                  <div className="flex items-center gap-3 border-b border-clay-100 px-4">
                    <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={onInputKey}
                      placeholder="Tapez au moins 2 caractères…"
                      className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-clay-100"
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-2">
                    {query.trim().length < 2 && (
                      <p className="px-3 py-6 text-center text-sm text-ink-muted">
                        Aperçu instantané des produits et boutiques.
                      </p>
                    )}

                    {query.trim().length >= 2 && results.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-ink-muted">
                        Rien pour «&nbsp;{query}&nbsp;». Essayez «&nbsp;bissap&nbsp;»,
                        «&nbsp;pagne&nbsp;», «&nbsp;solaire&nbsp;».
                      </p>
                    )}

                    {results.map((hit, i) => (
                      <button
                        key={`${hit.type}-${hit.id}`}
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(hit)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors",
                          i === active ? "bg-clay-50" : "hover:bg-clay-50",
                        )}
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-clay-100">
                          {hit.image ? (
                            <Image
                              src={hit.image}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <Store className="absolute inset-0 m-auto h-5 w-5 text-ink-muted" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {hit.title}
                            </span>
                            <span className="shrink-0 rounded-full bg-clay-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                              {hit.type === "shop" ? "Boutique" : "Produit"}
                            </span>
                          </span>
                          <span className="block truncate text-xs text-ink-muted">
                            {hit.subtitle}
                          </span>
                        </span>
                        {hit.price != null && (
                          <span className="shrink-0 text-sm font-extrabold text-faso-green">
                            {formatCFA(hit.price)}
                          </span>
                        )}
                        {i === active && (
                          <CornerDownLeft className="h-4 w-4 shrink-0 text-ink-muted" />
                        )}
                      </button>
                    ))}
                  </div>

                  {results.length > 0 && (
                    <div className="border-t border-clay-100 px-4 py-2.5">
                      <Link
                        href="/#explorer"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-faso-red hover:gap-2"
                      >
                        Voir tous les résultats dans l&apos;explorateur
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
