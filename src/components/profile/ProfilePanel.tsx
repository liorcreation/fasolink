"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleHelp,
  Heart,
  LoaderCircle,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FavoritesPanel } from "@/components/profile/FavoritesPanel";
import { COLLECTIONS, db } from "@/lib/firebase";
import type { ProfileRole } from "@/lib/database.types";

interface ProfileFields {
  full_name: string;
  phone: string;
  city: string;
  role: ProfileRole | null;
}

const EMPTY_PROFILE: ProfileFields = { full_name: "", phone: "", city: "", role: null };

const QUICK_LINKS = [
  { href: "#favoris", icon: Heart, title: "Mes favoris", detail: "Vos boutiques enregistrées", tone: "red" },
  { href: "/vendeur/dashboard", icon: Store, title: "Espace vendeur", detail: "Gérer ma boutique", tone: "gold" },
  { href: "/vendeur/verification", icon: BadgeCheck, title: "Ma vérification", detail: "Dossier vendeur", tone: "green" },
];

function nameFromEmail(email: string | null | undefined) {
  return email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Membre FasoLink";
}

function initialsFromName(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "F";
}

function getProfileError(cause: unknown) {
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = String((cause as { code?: unknown }).code);
    if (code.includes("permission-denied")) return "Firebase refuse la mise à jour de ce profil. Vérifiez les règles Firestore.";
    if (code.includes("unavailable") || code.includes("network")) return "Connexion indisponible. Vos modifications n’ont pas été enregistrées.";
  }
  return "Impossible d’enregistrer ces informations pour le moment.";
}

export function ProfilePanel() {
  const { user, loading, isConfigured, logout } = useAuth();
  const reduceMotion = useReducedMotion();
  const [profile, setProfile] = useState<ProfileFields>(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isConfigured) {
      setProfile(EMPTY_PROFILE);
      setProfileLoading(false);
      return;
    }
    let active = true;
    setProfileLoading(true);
    void getDoc(doc(db, COLLECTIONS.profiles, user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.exists() ? snapshot.data() : {};
        setProfile({
          full_name: typeof data.full_name === "string" ? data.full_name : user.displayName || nameFromEmail(user.email),
          phone: typeof data.phone === "string" ? data.phone : "",
          city: typeof data.city === "string" ? data.city : "",
          role: data.role === "buyer" || data.role === "seller" || data.role === "admin" || data.role === "superadmin" ? data.role : null,
        });
      })
      .catch((cause) => {
        if (active) setError(getProfileError(cause));
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => { active = false; };
  }, [isConfigured, user]);

  const fullName = profile.full_name || user?.displayName || nameFromEmail(user?.email);
  const firstName = fullName.split(/\s+/)[0] || "Membre";
  const initials = useMemo(() => initialsFromName(fullName), [fullName]);
  const roleLabel = profile.role === "seller" ? "Compte vendeur" : profile.role === "superadmin" ? "Super administrateur" : profile.role === "admin" ? "Administrateur" : "Compte acheteur";

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving || !profile.full_name.trim()) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, COLLECTIONS.profiles, user.uid), {
        id: user.uid,
        role: profile.role ?? "buyer",
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim() || null,
        city: profile.city.trim() || null,
        avatar_url: user.photoURL || null,
        created_at: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : now,
        updated_at: now,
      }, { merge: true });
      setProfile((current) => ({ ...current, full_name: current.full_name.trim(), phone: current.phone.trim(), city: current.city.trim() }));
      setEditing(false);
      setMessage("Votre profil a bien été mis à jour.");
    } catch (cause) {
      setError(getProfileError(cause));
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setLoggingOut(true);
    setError(null);
    try {
      await logout();
      setMessage("Vous êtes déconnecté de FasoLink.");
    } catch {
      setError("La déconnexion n’a pas abouti. Réessayez.");
    } finally {
      setLoggingOut(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    if (user) {
      void getDoc(doc(db, COLLECTIONS.profiles, user.uid)).then((snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        setProfile({
          full_name: typeof data.full_name === "string" ? data.full_name : user.displayName || nameFromEmail(user.email),
          phone: typeof data.phone === "string" ? data.phone : "",
          city: typeof data.city === "string" ? data.city : "",
          role: data.role === "buyer" || data.role === "seller" || data.role === "admin" || data.role === "superadmin" ? data.role : null,
        });
      }).catch(() => undefined);
    }
  }

  return (
    <div className="profile-page">
      <div className="container-faso relative py-7 sm:py-10 lg:py-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-hero"
        >
          <div className="profile-hero-orb profile-hero-orb-one" aria-hidden="true" />
          <div className="profile-hero-orb profile-hero-orb-two" aria-hidden="true" />
          <div className="profile-hero-content">
            <div className="profile-avatar-wrap">
              <span className="profile-avatar" aria-label={`Initiales de ${fullName}`}>{initials}</span>
              {user && <span className="profile-online-dot" title="Session active" />}
            </div>
            <div className="profile-hero-copy">
              <span className="profile-eyebrow"><Sparkles aria-hidden="true" /> VOTRE ESPACE FASOLINK</span>
              <h1>{loading ? "Votre espace personnel" : user ? <>Bonjour, <span>{firstName}</span></> : "Bienvenue dans votre espace"}</h1>
              <p>{loading ? "Nous vérifions votre session…" : user ? user.email || "Votre compte FasoLink" : "Connectez-vous pour retrouver vos favoris et gérer votre compte."}</p>
              <div className="profile-badges">
                <span className="profile-role-badge"><UserRound aria-hidden="true" /> {user ? roleLabel : "Mode invité"}</span>
                {user && <span className="profile-state-badge"><ShieldCheck aria-hidden="true" /> Session sécurisée</span>}
              </div>
            </div>
          </div>
          <div className="profile-hero-actions">
            {user ? (
              <>
                <a href="#coordonnees" className="profile-hero-button profile-hero-button-light"><PencilLine aria-hidden="true" /> Modifier mes infos</a>
                <Button variant="ghost" size="sm" className="profile-signout" onClick={() => void signOut()} disabled={loggingOut}>
                  {loggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}{loggingOut ? "Déconnexion…" : "Déconnexion"}
                </Button>
              </>
            ) : (
              <ButtonLink href={isConfigured ? "/connexion" : "/inscription"} className="profile-hero-button"><LogIn aria-hidden="true" /> Se connecter <ArrowRight aria-hidden="true" /></ButtonLink>
            )}
          </div>
          <div className="profile-hero-watermark" aria-hidden="true">FL</div>
        </motion.header>

        <AnimatePresence initial={false}>
          {(message || error) && <motion.div key={error ? "error" : "message"} initial={reduceMotion ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role={error ? "alert" : "status"} className={`profile-feedback ${error ? "profile-feedback-error" : "profile-feedback-success"}`}>{error || message}<button type="button" aria-label="Fermer le message" onClick={() => { setError(null); setMessage(null); }}><X aria-hidden="true" /></button></motion.div>}
        </AnimatePresence>

        <div className="profile-layout">
          <main className="profile-main-column">
            <motion.section
              id="coordonnees"
              initial={reduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .06 }}
              className="profile-section-card profile-details-card"
            >
              <div className="profile-section-heading">
                <div><span className="profile-section-icon profile-section-icon-gold"><UserRound aria-hidden="true" /></span><div><p className="profile-section-kicker">VOS INFORMATIONS</p><h2>Profil personnel</h2></div></div>
                {user && !editing && <button type="button" className="profile-edit-link" onClick={() => { setMessage(null); setError(null); setEditing(true); }}><PencilLine aria-hidden="true" /> Modifier</button>}
              </div>

              {loading || profileLoading ? (
                <div className="profile-loading"><LoaderCircle className="h-5 w-5 animate-spin" /><span>Chargement des informations…</span></div>
              ) : !user ? (
                <div className="profile-login-prompt"><div className="profile-login-symbol"><UserRound aria-hidden="true" /></div><div><h3>Un espace à vous, partout</h3><p>Créez un compte gratuit pour synchroniser votre profil et retrouver vos boutiques favorites sur tous vos appareils.</p><ButtonLink href={isConfigured ? "/connexion" : "/inscription"} size="sm" className="mt-4"><LogIn aria-hidden="true" /> {isConfigured ? "Connexion / Inscription" : "Découvrir FasoLink"}<ArrowRight aria-hidden="true" /></ButtonLink></div></div>
              ) : editing ? (
                <form className="profile-edit-form" onSubmit={saveProfile}>
                  <label className="profile-field"><span>Nom complet</span><input autoComplete="name" required minLength={2} maxLength={80} value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} placeholder="Votre nom complet" /></label>
                  <label className="profile-field"><span>Adresse email</span><input value={user.email || "Aucune adresse email"} disabled readOnly /><small>Pour modifier votre email, utilisez les paramètres de votre compte Firebase.</small></label>
                  <div className="profile-edit-grid"><label className="profile-field"><span>Téléphone <i>Facultatif</i></span><input autoComplete="tel" type="tel" inputMode="tel" maxLength={24} value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} placeholder="+226 70 00 00 00" /></label><label className="profile-field"><span>Ville <i>Facultatif</i></span><input autoComplete="address-level2" maxLength={60} value={profile.city} onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))} placeholder="Ex. Ouagadougou" /></label></div>
                  <div className="profile-form-actions"><button type="button" className="profile-cancel-button" onClick={cancelEdit}>Annuler</button><Button type="submit" disabled={saving || profile.full_name.trim().length < 2}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? "Enregistrement…" : "Enregistrer"}</Button></div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  <div className="profile-info-item"><span className="profile-info-icon"><UserRound aria-hidden="true" /></span><span><small>Nom complet</small><b>{fullName}</b></span></div>
                  <div className="profile-info-item"><span className="profile-info-icon"><MessageCircle aria-hidden="true" /></span><span><small>Téléphone</small><b>{profile.phone || "Non renseigné"}</b></span></div>
                  <div className="profile-info-item"><span className="profile-info-icon"><MapPin aria-hidden="true" /></span><span><small>Ville</small><b>{profile.city || "Non renseignée"}</b></span></div>
                  <div className="profile-info-item"><span className="profile-info-icon"><ShieldCheck aria-hidden="true" /></span><span><small>Adresse email</small><b className="profile-email-value">{user.email || "Non renseignée"}</b></span></div>
                </div>
              )}
            </motion.section>

            <FavoritesPanel />
          </main>

          <aside className="profile-side-column">
            <section className="profile-section-card profile-shortcuts-card">
              <div className="profile-section-heading profile-section-heading-compact"><div><span className="profile-section-icon profile-section-icon-red"><Sparkles aria-hidden="true" /></span><div><p className="profile-section-kicker">VOTRE UNIVERS</p><h2>Accès rapides</h2></div></div></div>
              <div className="profile-shortcut-list">
                {QUICK_LINKS.map((item) => {
                  const Icon = item.icon;
                  return <Link href={item.href} key={item.href} className="profile-shortcut"><span className={`profile-shortcut-icon profile-shortcut-${item.tone}`}><Icon aria-hidden="true" /></span><span className="profile-shortcut-text"><b>{item.title}</b><small>{item.detail}</small></span><ChevronRight aria-hidden="true" /></Link>;
                })}
              </div>
              <Link href="/vendeur/inscription" className="profile-create-shop"><span><Store aria-hidden="true" /></span><span><b>Vous êtes commerçant ?</b><small>Créez votre vitrine FasoLink</small></span><ArrowRight aria-hidden="true" /></Link>
            </section>

            <section className="profile-security-card">
              <span className="profile-security-icon"><ShieldCheck aria-hidden="true" /></span>
              <p className="profile-section-kicker">SÉCURITÉ & CONFIANCE</p>
              <h2>Votre espace reste le vôtre.</h2>
              <p>Vos informations de profil sont privées. Vous gardez le contrôle de vos favoris et de vos données.</p>
              <Link href="/confidentialite">Consulter la confidentialité <ArrowRight aria-hidden="true" /></Link>
            </section>

            <Link href="/conditions" className="profile-help-link"><CircleHelp aria-hidden="true" /><span>Besoin d’aide ?<small>Consulter les conditions d’utilisation</small></span><ChevronRight aria-hidden="true" /></Link>
          </aside>
        </div>

        <footer className="profile-footer">FasoLink <span>·</span> Consommer Burkinabè <span aria-hidden="true">🇧🇫</span></footer>
      </div>
    </div>
  );
}
