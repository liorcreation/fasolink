"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLink } from "@/components/site/AppLink";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ArrowDown, ArrowUp, BadgeCheck, CreditCard, FileText, Gauge, Heart,
  House, LayoutGrid, LogIn, PackageSearch, Search, ShieldCheck, Store,
  UserRound, UserPlus, X, type LucideIcon,
} from "lucide-react";

type Command = {
  href: string;
  label: string;
  description: string;
  keywords: string;
  group: string;
  icon: LucideIcon;
};

const BASE_COMMANDS: Command[] = [
  { href: "/", label: "Accueil", description: "Revenir à la page d’accueil", keywords: "home début", group: "Découvrir", icon: House },
  { href: "/boutiques", label: "Boutiques", description: "Parcourir les vendeurs tech du Faso", keywords: "vendeurs magasins shop", group: "Découvrir", icon: Store },
  { href: "/produits", label: "Produits", description: "Explorer les téléphones, ordinateurs et accessoires", keywords: "catalogue recherche électronique", group: "Découvrir", icon: PackageSearch },
  { href: "/profil", label: "Mon profil", description: "Gérer vos informations et votre compte", keywords: "compte paramètres utilisateur", group: "Mon compte", icon: UserRound },
  { href: "/profil#favoris", label: "Mes favoris", description: "Retrouver les boutiques enregistrées", keywords: "cœur aimé favoris", group: "Mon compte", icon: Heart },
  { href: "/conditions", label: "Conditions d’utilisation", description: "Lire les règles d’utilisation de FasoLink", keywords: "conditions règles", group: "Informations", icon: FileText },
  { href: "/confidentialite", label: "Confidentialité", description: "Comprendre l’usage de vos données", keywords: "vie privée données", group: "Informations", icon: ShieldCheck },
  { href: "/mentions-legales", label: "Mentions légales", description: "Consulter les informations légales", keywords: "éditeur légal", group: "Informations", icon: FileText },
];

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsSuperAdmin(false);
      return () => { active = false; };
    }
    void user.getIdTokenResult().then((token) => {
      if (active) setIsSuperAdmin(token.claims.superAdmin === true);
    }).catch(() => {
      if (active) setIsSuperAdmin(false);
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setQuery("");
      setActiveIndex(0);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.repeat) {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, [onOpenChange]);

  const commands = useMemo(() => {
    const available: Command[] = [...BASE_COMMANDS];
    if (!user || user.isAnonymous) {
      available.push(
        { href: "/connexion", label: "Se connecter", description: "Accéder à votre espace FasoLink", keywords: "login session", group: "Mon compte", icon: LogIn },
        { href: "/inscription", label: "Créer un compte", description: "Rejoindre FasoLink gratuitement", keywords: "inscription register", group: "Mon compte", icon: UserPlus },
      );
    } else {
      available.push(
        { href: "/vendeur/dashboard", label: "Tableau de bord vendeur", description: "Suivre l’activité de vos boutiques", keywords: "vendeur dashboard statistiques", group: "Espace vendeur", icon: Gauge },
        { href: "/vendeur/boutiques", label: "Mes boutiques", description: "Choisir et gérer une vitrine", keywords: "vendeur gérer modifier", group: "Espace vendeur", icon: LayoutGrid },
        { href: "/vendeur/inscription", label: "Ouvrir une boutique", description: "Créer une vitrine sur FasoLink", keywords: "vendre créer boutique", group: "Espace vendeur", icon: Store },
        { href: "/vendeur/verification", label: "Vérification vendeur", description: "Déposer ou suivre un dossier", keywords: "identité justificatif badge", group: "Espace vendeur", icon: BadgeCheck },
        { href: "/vendeur/paiement", label: "Abonnement et paiement", description: "Gérer la formule d’une boutique", keywords: "licence abonnement facture", group: "Espace vendeur", icon: CreditCard },
      );
    }
    if (isSuperAdmin) available.push({ href: "/admin", label: "Super Admin", description: "Administrer les boutiques et licences", keywords: "administration plateforme", group: "Administration", icon: ShieldCheck });
    return available;
  }, [isSuperAdmin, user]);

  const normalizedQuery = normalizeSearch(query.trim());
  const results = useMemo(() => {
    if (!normalizedQuery) return commands;
    return commands.filter((item) => normalizeSearch(`${item.label} ${item.description} ${item.keywords}`).includes(normalizedQuery));
  }, [commands, normalizedQuery]);

  useEffect(() => setActiveIndex(0), [normalizedQuery]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      const destination = results[activeIndex].href;
      close();
      router.push(destination);
      return;
    }
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      const next = (activeIndex + 1) % results.length;
      setActiveIndex(next);
      dialogRef.current?.querySelectorAll<HTMLAnchorElement>(".fasolink-command-result")[next]?.focus();
    }
    if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      const next = (activeIndex - 1 + results.length) % results.length;
      setActiveIndex(next);
      dialogRef.current?.querySelectorAll<HTMLAnchorElement>(".fasolink-command-result")[next]?.focus();
    }
  }

  const grouped = results.reduce<Record<string, Array<Command & { index: number }>>>((groups, command) => {
    const index = results.indexOf(command);
    (groups[command.group] ??= []).push({ ...command, index });
    return groups;
  }, {});

  return (
    <dialog
      ref={dialogRef}
      id="fasolink-command-palette"
      className="fasolink-command-dialog m-auto max-h-[min(84dvh,720px)] w-[calc(100%-1.25rem)] max-w-2xl overflow-hidden rounded-[1.75rem] border border-clay-200 bg-[#fffdfa] p-0 text-ink shadow-[0_32px_100px_-35px_rgba(23,18,14,.5)] backdrop:bg-ink/55 backdrop:backdrop-blur-sm sm:rounded-[2rem]"
      aria-labelledby="command-title"
      aria-describedby="command-help"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={() => { if (open) close(); }}
      onClick={(event) => { if (event.target === dialogRef.current) close(); }}
    >
      <div className="border-b border-clay-200/80 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-red">FasoLink · accès rapide</p>
            <h2 id="command-title" className="sr-only">Palette de commandes FasoLink</h2>
          </div>
          <button type="button" onClick={close} aria-label="Fermer la palette" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-clay-200 bg-white text-ink-muted transition hover:text-faso-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red"><X className="h-4 w-4" /></button>
        </div>
        <label className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl border border-clay-200 bg-white px-4 shadow-sm transition focus-within:border-faso-gold focus-within:ring-2 focus-within:ring-faso-gold/15">
          <Search className="h-5 w-5 shrink-0 text-faso-red" aria-hidden="true" />
          <input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder="Rechercher une page ou une action…" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-muted" aria-label="Rechercher dans les pages et actions FasoLink" />
          <kbd className="hidden rounded-md border border-clay-200 bg-clay-50 px-2 py-1 text-[10px] font-bold text-ink-muted sm:inline">ESC</kbd>
        </label>
        <p id="command-help" aria-live="polite" className="mt-2 px-1 text-[11px] text-ink-muted">{results.length} résultat{results.length > 1 ? "s" : ""} · ↑↓ pour parcourir, Entrée pour ouvrir</p>
      </div>

      <div className="max-h-[min(56dvh,470px)] overflow-y-auto overscroll-contain p-3 sm:p-4">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-clay-300 bg-clay-50/60 px-5 py-10 text-center">
            <Search className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-ink">Aucun résultat pour « {query} »</p>
            <p className="mt-1 text-xs text-ink-muted">Essayez un mot-clé comme « produits » ou « vendeur ».</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <section key={group} aria-label={group} className="mb-3 last:mb-0">
              <h3 className="px-2 pb-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">{group}</h3>
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <AppLink
                        href={item.href}
                        onClick={close}
                        onFocus={() => setActiveIndex(item.index)}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                          event.preventDefault();
                          const next = event.key === "ArrowDown" ? (item.index + 1) % results.length : (item.index - 1 + results.length) % results.length;
                          setActiveIndex(next);
                          event.currentTarget.closest("dialog")?.querySelectorAll<HTMLAnchorElement>(".fasolink-command-result")[next]?.focus();
                        }}
                        className={`fasolink-command-result group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red ${activeIndex === item.index ? "bg-clay-50" : "hover:bg-clay-50/70"}`}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-clay-200/70 bg-white text-faso-red shadow-sm transition-colors group-hover:border-faso-gold/50"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">{item.label}</span><span className="mt-0.5 block truncate text-xs text-ink-muted">{item.description}</span></span>
                        <span className="sr-only">Ouvrir</span>
                      </AppLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
      <footer className="flex items-center justify-between border-t border-clay-200/80 bg-clay-50/65 px-4 py-3 text-[10px] font-semibold text-ink-muted sm:px-5">
        <span>Navigation rapide FasoLink</span>
        <span className="hidden items-center gap-1 sm:inline-flex"><kbd className="rounded border border-clay-200 bg-white px-1.5 py-0.5">Ctrl</kbd><span>/</span><kbd className="rounded border border-clay-200 bg-white px-1.5 py-0.5">⌘</kbd><span>+</span><kbd className="rounded border border-clay-200 bg-white px-1.5 py-0.5">K</kbd><ArrowUp className="ml-1 h-3 w-3" /><ArrowDown className="h-3 w-3" /></span>
      </footer>
    </dialog>
  );
}
