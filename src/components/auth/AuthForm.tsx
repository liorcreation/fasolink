"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore/lite";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { auth, COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isFirebaseConfigured || busy) return;
    setBusy(true);
    setError(null);
    try {
      const credential =
        mode === "login"
          ? await signInWithEmailAndPassword(auth, email.trim(), password)
          : await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (mode === "signup") {
        const now = new Date().toISOString();
        await setDoc(
          doc(db, COLLECTIONS.profiles, credential.user.uid),
          {
            id: credential.user.uid,
            role: "buyer",
            full_name: name.trim() || email.trim().split("@")[0],
            phone: null,
            city: null,
            avatar_url: null,
            created_at: now,
            updated_at: now,
          },
          { merge: true },
        );
      }
      setDone(true);
    } catch (cause) {
      const code =
        cause && typeof cause === "object" && "code" in cause
          ? String((cause as { code?: unknown }).code)
          : cause instanceof Error
            ? cause.message
            : "";
      setError(
        code.includes("operation-not-allowed")
          ? "La connexion par email n’est pas encore activée dans Firebase."
          : code.includes("unauthorized-domain")
            ? "Ce domaine Cloudflare n’est pas autorisé dans Firebase Authentication."
            : code.includes("invalid-credential") || code.includes("wrong-password")
              ? "Email ou mot de passe incorrect."
              : code.includes("email-already-in-use")
                ? "Cette adresse email est déjà utilisée. Cliquez sur « J’ai déjà un compte » pour vous connecter."
                : code.includes("network-request-failed")
                  ? "Firebase est momentanément inaccessible. Vérifiez votre connexion internet."
                  : code.includes("too-many-requests")
                    ? "Trop de tentatives. Attendez quelques minutes avant de réessayer."
                    : code.includes("weak-password")
                      ? "Le mot de passe doit contenir au moins 6 caractères."
                      : "Impossible de terminer l’opération. Vérifiez la configuration Firebase et votre connexion.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="card-premium mx-auto max-w-lg p-7 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-faso-gold" />
        <h2 className="mt-4 text-xl font-bold text-ink">Mode démonstration</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Configurez Firebase pour activer les comptes réels et la synchronisation entre appareils.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card-premium mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-faso-green text-white">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink">
          {mode === "login" ? "Connexion réussie" : "Compte créé"}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Votre session est active. Vous pouvez maintenant gérer votre espace FasoLink.
        </p>
        <Link
          href="/profil"
          className="btn-base mt-6 inline-flex bg-faso-red px-5 text-sm text-white"
        >
          Ouvrir mon profil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="card-premium mx-auto grid max-w-4xl overflow-hidden p-0 md:grid-cols-[0.82fr_1.18fr]">
      <div className="relative hidden overflow-hidden bg-ink p-9 text-white md:flex md:min-h-[500px] md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-faso-red/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-faso-green/30 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-faso-gold">
            FasoLink
          </span>
          <h3 className="mt-8 max-w-xs text-3xl font-extrabold leading-tight tracking-tight">
            Votre commerce local, toujours à portée de main.
          </h3>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            Une expérience pensée pour découvrir, faire confiance et soutenir les talents du Burkina Faso.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3 text-xs text-white/70">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <strong className="block text-xl text-white">500+</strong>
            boutiques locales
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <strong className="block text-xl text-white">100%</strong>
            made in Burkina
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-clay-50/70 p-3 md:hidden">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-faso-gradient text-white">
          <LockKeyhole className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-ink">Un espace pensé pour vous</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-faso-gradient text-white shadow-glow">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-ink">
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
          </h2>
          <p className="text-sm text-ink-muted">Un accès sécurisé à votre espace.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-7 space-y-5">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Nom complet</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input-premium"
              placeholder="Prénom NOM"
              required
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Adresse email</span>
          <div className="flex items-center gap-2 rounded-2xl border border-clay-200 bg-white px-4 transition-all focus-within:border-faso-gold focus-within:shadow-[0_0_0_4px_rgba(244,169,60,0.14)]">
            <Mail className="h-4 w-4 text-ink-muted" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
              placeholder="vous@exemple.com"
              required
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Mot de passe</span>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-premium"
            placeholder="6 caractères minimum"
            required
          />
        </label>

        {error && <p role="alert" className="rounded-2xl border border-faso-red/15 bg-faso-red-soft/30 px-4 py-3 text-sm leading-6 text-faso-red-dark">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((current) => (current === "login" ? "signup" : "login"));
          setError(null);
        }}
        className="mt-5 w-full text-center text-sm font-semibold text-faso-red hover:underline"
      >
        {mode === "login" ? "Je n’ai pas encore de compte" : "J’ai déjà un compte"}
      </button>
      </div>
    </div>
  );
}
