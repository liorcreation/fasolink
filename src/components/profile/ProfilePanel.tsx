"use client";

import Link from "next/link";
import {
  ChevronRight,
  Heart,
  LogIn,
  LogOut,
  MessageCircle,
  Settings,
  Store,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FavoritesPanel } from "@/components/profile/FavoritesPanel";

const LINKS = [
  { href: "#favoris", icon: Heart, title: "Mes favoris", desc: "Boutiques enregistrées pour plus tard" },
  { href: "/vendeur/dashboard", icon: Store, title: "Mon espace vendeur", desc: "Tableau de bord, contacts, QR Code" },
  { href: "/vendeur/verification", icon: MessageCircle, title: "Vérification", desc: "Obtenir le badge « Vendeur Vérifié »" },
  { href: "/inscription", icon: Settings, title: "Type de compte", desc: "Acheteur ou vendeur" },
];

export function ProfilePanel() {
  const { user, loading, isConfigured, logout } = useAuth();

  return (
    <div className="container-faso py-10 md:py-16">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-premium-lg md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-faso-red/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-faso-green/25 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-faso-gradient text-white shadow-glow"><UserRound className="h-7 w-7" /></span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-faso-gold">Espace personnel</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">Mon Profil</h1>
            <p className="mt-1 text-sm text-white/60">
              {loading ? "Vérification de votre session…" : user ? user.email : "Invité · connectez-vous pour synchroniser vos favoris"}
            </p>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">Favoris synchronisés</span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">Accès multi-appareils</span>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <div className="card-premium flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <p className="text-sm text-ink-soft">
            {user ? "Votre session est active. Vos données vendeur sont rattachées à ce compte." : "Créez un compte gratuit pour retrouver vos boutiques favorites sur tous vos appareils."}
          </p>
          {user ? (
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => void logout()}><LogOut className="h-4 w-4" /> Se déconnecter</Button>
          ) : (
            <ButtonLink href={isConfigured ? "/connexion" : "/inscription"} size="sm" className="shrink-0"><LogIn className="h-4 w-4" /> Créer un compte</ButtonLink>
          )}
        </div>
      </Reveal>

      <div className="mt-6 space-y-3">
        {LINKS.map((item, index) => (
          <Reveal key={item.href} delay={0.08 + index * 0.04}>
            <Link href={item.href} className="group flex items-center gap-4 rounded-2xl border border-clay-100/80 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-faso-gold/50 hover:bg-white hover:shadow-premium">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-clay-50 text-faso-red transition-colors group-hover:bg-faso-gold-soft/50"><item.icon className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block text-sm font-bold text-ink">{item.title}</span><span className="block text-xs text-ink-muted">{item.desc}</span></span>
              <ChevronRight className="h-5 w-5 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-faso-red" />
            </Link>
          </Reveal>
        ))}
      </div>
      <FavoritesPanel />
      <p className="mt-8 text-center text-xs text-ink-muted">FasoLink — Consommer Burkinabè 🇧🇫</p>
    </div>
  );
}
