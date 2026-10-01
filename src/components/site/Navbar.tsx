"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  Gauge,
  Grid2X2,
  Heart,
  LogIn,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  UserPlus,
  X,
  FileText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ButtonLink } from "@/components/ui/Button";

const SELLER_LINKS = [
  { href: "/vendeur/dashboard", label: "Tableau de bord", detail: "Pilotez votre boutique", icon: Gauge },
  { href: "/vendeur/inscription", label: "Ouvrir une boutique", detail: "Présentez votre activité", icon: Store },
  { href: "/vendeur/verification", label: "Vérification", detail: "Suivez votre dossier", icon: BadgeCheck },
  { href: "/vendeur/paiement", label: "Abonnement & paiement", detail: "Gérez votre formule", icon: CreditCard },
];

const INFO_LINKS = [
  { href: "/conditions", label: "Conditions d’utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

function QuickLink({
  href,
  label,
  detail,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  detail?: string;
  icon: typeof Store;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex min-h-14 items-center gap-3 rounded-2xl border border-clay-100 bg-white/85 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-faso-gold/45 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-clay-50 text-faso-red transition-colors group-hover:bg-faso-red group-hover:text-white">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        {detail && <span className="mt-0.5 block text-xs leading-4 text-ink-muted">{detail}</span>}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-faso-red" aria-hidden="true" />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname() || "/";
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [sellerMenuOpen, setSellerMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const sellerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let current = true;
    if (!user) {
      setIsSuperAdmin(false);
      return;
    }
    void user.getIdTokenResult().then((token) => {
      if (current) setIsSuperAdmin(token.claims.superAdmin === true);
    }).catch(() => {
      if (current) setIsSuperAdmin(false);
    });
    return () => { current = false; };
  }, [user]);

  useEffect(() => {
    setSellerMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sellerMenuOpen && !mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSellerMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const closeSellerOnOutsideClick = (event: PointerEvent) => {
      if (sellerMenuRef.current && !sellerMenuRef.current.contains(event.target as Node)) {
        setSellerMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeSellerOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeSellerOnOutsideClick);
    };
  }, [sellerMenuOpen, mobileMenuOpen]);

  function closeMenus() {
    setSellerMenuOpen(false);
    setMobileMenuOpen(false);
  }

  const activeLinkClass = (active: boolean) => cn(
    "inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red",
    active ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:bg-white/75 hover:text-ink",
  );

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-clay-100/80 bg-clay-50/90 shadow-[0_12px_32px_-26px_rgba(26,17,9,0.5)] backdrop-blur-xl"
          : "border-transparent bg-clay-50/70 backdrop-blur-md",
      )}
    >
      <nav aria-label="Navigation principale" className="container-faso flex h-16 items-center gap-4 md:h-[4.5rem]">
        <Logo linked={false} />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={activeLinkClass(pathname === "/")}>
            Accueil
          </Link>
          <Link href="/boutiques" aria-current={pathname.startsWith("/boutiques") ? "page" : undefined} className={activeLinkClass(pathname.startsWith("/boutiques"))}>
            Boutiques
          </Link>
          <div className="relative" ref={sellerMenuRef}>
            <button
              type="button"
              aria-expanded={sellerMenuOpen}
              aria-haspopup="true"
              onClick={() => setSellerMenuOpen((open) => !open)}
              className={activeLinkClass(pathname.startsWith("/vendeur"))}
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              Espace vendeur
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sellerMenuOpen && "rotate-180")} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {sellerMenuOpen && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[22rem] -translate-x-1/2 rounded-[1.5rem] border border-clay-100 bg-[#fffdfa] p-3 shadow-[0_24px_70px_-30px_rgba(26,17,9,.38)]"
                  role="menu"
                  aria-label="Navigation de l’espace vendeur"
                >
                  <div className="mb-2 rounded-xl bg-[#f8f2e9] px-3.5 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-gold-dark">FasoLink Pro</p>
                    <p className="mt-1 text-xs text-ink-muted">Votre activité, vos outils, au même endroit.</p>
                  </div>
                  <div className="grid gap-1">
                    {SELLER_LINKS.map(({ href, label, detail, icon: Icon }) => (
                      <Link key={href} href={href} role="menuitem" onClick={closeMenus} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-clay-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-faso-red shadow-sm"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                        <span><span className="block text-sm font-bold text-ink">{label}</span><span className="mt-0.5 block text-xs text-ink-muted">{detail}</span></span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/profil" aria-current={pathname.startsWith("/profil") ? "page" : undefined} className={activeLinkClass(pathname.startsWith("/profil"))}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Mon profil
          </Link>
          {isSuperAdmin && (
            <Link href="/admin" aria-current={pathname.startsWith("/admin") ? "page" : undefined} className={activeLinkClass(pathname.startsWith("/admin"))}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Super Admin
            </Link>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
          {!user && (
            <Link href="/connexion" className="hidden rounded-full px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-white hover:text-ink xl:inline-flex">
              Se connecter
            </Link>
          )}
          <ButtonLink href="/vendeur/inscription" variant="outline" size="sm" className="hidden min-h-10 px-3.5 lg:inline-flex">
            <Store className="h-4 w-4" />
            Ouvrir ma boutique
          </ButtonLink>
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-haspopup="dialog"
            aria-controls="fasolink-navigation-sheet"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-clay-200 bg-white/90 px-3.5 text-xs font-bold text-ink shadow-sm transition hover:border-faso-gold/60 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Grid2X2 className="h-4 w-4 text-faso-red" aria-hidden="true" />}
            <span>{mobileMenuOpen ? "Fermer" : "Rubriques"}</span>
          </button>
        </div>
      </nav>

    </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <button type="button" aria-label="Fermer le menu" onClick={closeMenus} className="absolute inset-0 bg-[#17120e]/35 backdrop-blur-[3px]" />
            <motion.aside
              id="fasolink-navigation-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Rubriques FasoLink"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] mx-auto max-h-[min(78dvh,44rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-t-[2rem] border border-clay-100 bg-[#fffdfa] p-4 pb-5 shadow-[0_-24px_70px_-24px_rgba(26,17,9,.32)] sm:inset-x-4 sm:bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:rounded-[2rem] sm:p-6"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-clay-200 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-red">Vos raccourcis</p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink">Accédez à FasoLink</h2>
                  <p className="mt-1 text-xs text-ink-muted">Découverte, boutique et compte réunis simplement.</p>
                </div>
                <button type="button" aria-label="Fermer le menu" onClick={closeMenus} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-clay-200 bg-white text-ink-soft transition hover:text-faso-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f8f2e9] p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.13em] text-ink-soft"><Search className="h-4 w-4 text-faso-red" aria-hidden="true" /> Découvrir les boutiques</div>
                <p className="mt-1.5 text-xs leading-5 text-ink-muted">Explorez les commerces, puis ouvrez une vitrine et ses produits.</p>
                <Link href="/boutiques" onClick={closeMenus} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-bold text-ink shadow-sm transition hover:text-faso-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
                  Voir les boutiques <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-5">
                <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">Espace vendeur</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SELLER_LINKS.map((item) => <QuickLink key={item.href} {...item} onNavigate={closeMenus} />)}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">Mon compte</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <QuickLink href="/profil" label="Mon profil" detail={user ? "Vos informations et préférences" : "Retrouvez votre espace personnel"} icon={UserRound} onNavigate={closeMenus} />
                  <QuickLink href="/profil#favoris" label="Mes favoris" detail="Vos boutiques enregistrées" icon={Heart} onNavigate={closeMenus} />
                  {!user && <>
                    <QuickLink href="/connexion" label="Se connecter" detail="Retrouver votre compte" icon={LogIn} onNavigate={closeMenus} />
                    <QuickLink href="/inscription" label="Créer un compte" detail="Rejoindre gratuitement FasoLink" icon={UserPlus} onNavigate={closeMenus} />
                  </>}
                  {isSuperAdmin && <QuickLink href="/admin" label="Super Admin" detail="Gérer la plateforme et les licences" icon={ShieldCheck} onNavigate={closeMenus} />}
                </div>
              </div>

              <div className="mt-5 border-t border-clay-100 pt-4">
                <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">Informations</p>
                <div className="flex flex-wrap gap-2">
                  {INFO_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMenus} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-clay-200 bg-white px-3 text-[11px] font-semibold text-ink-soft transition hover:border-faso-gold/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
