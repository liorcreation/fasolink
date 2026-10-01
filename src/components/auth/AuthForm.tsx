"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore/lite";
import { auth, COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  initialMode: AuthMode;
}

function getErrorMessage(cause: unknown) {
  const code =
    cause && typeof cause === "object" && "code" in cause
      ? String((cause as { code?: unknown }).code)
      : "";

  if (code.includes("operation-not-allowed")) return "La connexion par email n’est pas activée dans Firebase.";
  if (code.includes("unauthorized-domain")) return "Ce domaine n’est pas autorisé dans Firebase Authentication.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email ou mot de passe incorrect. Vérifiez vos identifiants.";
  if (code.includes("email-already-in-use")) return "Cette adresse possède déjà un compte. Connectez-vous plutôt.";
  if (code.includes("network-request-failed")) return "Connexion internet indisponible. Vérifiez votre réseau puis réessayez.";
  if (code.includes("too-many-requests")) return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  if (code.includes("weak-password")) return "Choisissez un mot de passe d’au moins 12 caractères avec une minuscule, une majuscule, un chiffre et un symbole.";
  if (code.includes("invalid-email")) return "Cette adresse email ne semble pas valide.";
  return "L’opération n’a pas abouti. Réessayez dans un instant.";
}

export function AuthForm({ initialMode }: AuthFormProps) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const isSignup = initialMode === "signup";
  const passwordRequirements = [
    { label: "12 caractères minimum", met: password.length >= 12 },
    { label: "Une lettre minuscule et une majuscule", met: /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password) },
    { label: "Au moins un chiffre", met: /\p{N}/u.test(password) },
    { label: "Au moins un symbole", met: /[^\p{L}\p{N}]/u.test(password) },
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFirebaseConfigured || busy) return;
    setError(null);
    setNotice(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (isSignup) {
      if (passwordRequirements.some((requirement) => !requirement.met)) {
        setError("Renforcez votre mot de passe en respectant les quatre critères affichés.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
    }

    setBusy(true);
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const now = new Date().toISOString();
        try {
          await setDoc(doc(db, COLLECTIONS.profiles, credential.user.uid), {
            id: credential.user.uid,
            role: "buyer",
            full_name: name.trim(),
            phone: null,
            city: null,
            avatar_url: null,
            created_at: now,
            updated_at: now,
          }, { merge: true });
        } catch {
          // Firebase Auth has already created a valid account; the profile can be
          // completed later from the signed-in profile page.
          setNotice("Votre compte est créé. Complétez les informations de votre profil après connexion.");
        }
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      setDone(true);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Saisissez votre adresse email pour recevoir le lien de réinitialisation.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setNotice("Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.");
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="auth-form-card" role="status">
        <span className="auth-icon-badge"><ShieldCheck aria-hidden="true" /></span>
        <h2 className="mt-5 text-2xl font-bold text-ink">Espace sécurisé</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">L’authentification est momentanément indisponible. Réessayez plus tard.</p>
        <Link href="/" className="btn-base mt-7 bg-ink px-6 text-sm text-white">Retour à l’accueil <ArrowLeft className="h-4 w-4" /></Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-form-card text-center"
        aria-live="polite"
      >
        <span className="auth-icon-badge auth-icon-success"><Check aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-faso-green">Tout est prêt</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{isSignup ? "Bienvenue chez FasoLink" : "Heureux de vous revoir"}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-muted">{notice || (isSignup ? "Votre compte acheteur est créé. Découvrez les commerces qui font vivre le Burkina." : "Votre session est ouverte. Retrouvez vos favoris et votre espace personnel.")}</p>
        <Link href="/profil" className="btn-base mt-8 min-h-12 bg-faso-red px-6 text-sm text-white shadow-premium transition hover:-translate-y-0.5">Ouvrir mon espace <ArrowRight className="h-4 w-4" /></Link>
      </motion.section>
    );
  }

  return (
    <section className="auth-form-card" aria-labelledby="auth-form-title">
      <div className="flex items-start gap-4">
        <span className="auth-icon-badge"><LockKeyhole aria-hidden="true" /></span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-faso-gold-dark">{isSignup ? "Un compte. Tout FasoLink." : "Votre espace, en toute confiance"}</p>
          <h2 id="auth-form-title" className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">{isSignup ? "Créer mon compte" : "Content de vous revoir"}</h2>
          <p className="mt-1 text-sm text-ink-muted">{isSignup ? "Quelques secondes suffisent pour commencer." : "Connectez-vous pour retrouver votre univers."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-[1.15rem]" noValidate>
        <AnimatePresence initial={false}>
          {isSignup && (
            <motion.label
              key="full-name"
              initial={reduceMotion ? false : { opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -6 }}
              className="auth-field"
            >
              <span>Nom complet</span>
              <span className="auth-input-wrap"><UserRound aria-hidden="true" /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Awa Traoré" required minLength={2} /></span>
            </motion.label>
          )}
        </AnimatePresence>

        <label className="auth-field">
          <span>Adresse email</span>
          <span className="auth-input-wrap"><Mail aria-hidden="true" /><input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" required /></span>
        </label>

        <label className="auth-field">
          <span>Mot de passe</span>
          <span className="auth-input-wrap"><KeyRound aria-hidden="true" /><input type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 12 : 1} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "12 caractères minimum" : "Votre mot de passe"} required /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></span>
          {isSignup && <ul className="mt-2 grid gap-1 rounded-xl border border-[#eee3d7] bg-[#fbf7f1] px-3 py-2.5 text-xs" aria-label="Exigences du mot de passe">
            {passwordRequirements.map((requirement) => <li key={requirement.label} className={`flex items-center gap-2 ${requirement.met ? "font-semibold text-faso-green" : "text-ink-muted"}`}><span className={`grid h-4 w-4 place-items-center rounded-full ${requirement.met ? "bg-faso-green/10" : "bg-[#eee3d7]"}`}><Check className="h-2.5 w-2.5" aria-hidden="true" /></span>{requirement.label}</li>)}
          </ul>}
        </label>

        <AnimatePresence initial={false}>
          {isSignup && (
            <motion.label
              key="confirm-password"
              initial={reduceMotion ? false : { opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -6 }}
              className="auth-field"
            >
              <span>Confirmer le mot de passe</span>
              <span className="auth-input-wrap"><ShieldCheck aria-hidden="true" /><input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Saisissez-le à nouveau" required /></span>
            </motion.label>
          )}
        </AnimatePresence>

        {!isSignup && <div className="flex justify-end"><button type="button" onClick={resetPassword} disabled={busy} className="text-sm font-bold text-faso-red transition hover:text-faso-red-dark hover:underline disabled:opacity-50">Mot de passe oublié ?</button></div>}

        <AnimatePresence mode="wait" initial={false}>
          {error && <motion.p key="error" initial={reduceMotion ? false : { opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="auth-message auth-message-error">{error}</motion.p>}
          {!error && notice && <motion.p key="notice" initial={reduceMotion ? false : { opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} role="status" className="auth-message auth-message-success">{notice}</motion.p>}
        </AnimatePresence>

        <Button type="submit" size="lg" disabled={busy} className="auth-submit">
          {busy ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : isSignup ? <Sparkles className="h-5 w-5" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
          {busy ? "Un instant…" : isSignup ? "Créer mon compte" : "Me connecter"}
          {!busy && <ArrowRight className="ml-auto h-4 w-4 opacity-70" aria-hidden="true" />}
        </Button>
      </form>

      <div className="auth-switch">
        <span>{isSignup ? "Déjà membre ?" : "Pas encore de compte ?"}</span>
        <Link href={isSignup ? "/connexion" : "/inscription"}>{isSignup ? "Se connecter" : "Créer un compte"}<ArrowRight aria-hidden="true" /></Link>
      </div>
      <p className="auth-privacy"><ShieldCheck aria-hidden="true" /> Vos informations restent protégées et ne sont jamais affichées publiquement.</p>
    </section>
  );
}
