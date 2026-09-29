"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleHelp,
  Gift,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  Zap,
} from "lucide-react";
import type { SubscriptionPlan } from "@/lib/database.types";
import {
  PAYMENT_GATEWAY,
  PAYMENT_PROVIDERS,
  SUBSCRIPTION_PLANS,
  TRIAL_DAYS,
} from "@/lib/constants";
import { cn, formatCFA } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import { activateSubscription, VendorError } from "@/lib/vendor";
import { Button, ButtonLink } from "@/components/ui/Button";

type Provider = (typeof PAYMENT_PROVIDERS)[number]["id"];
type Step =
  | "plan"
  | "method"
  | "confirm"
  | "pin"
  | "processing"
  | "success"
  | "trial"
  | "error";

/** Boutique de démonstration utilisée pour la redirection hors Firebase. */
const DEMO_SHOP_ID = "faso-delices";

export function PaymentSimulator({ shopId }: { shopId?: string }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("plan");
  const [planId, setPlanId] = useState<SubscriptionPlan>("trimestriel");
  const [provider, setProvider] = useState<Provider>("orange_money");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [trialMode, setTrialMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reference, setReference] = useState(
    () => "FL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  );

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;
  const providerMeta = PAYMENT_PROVIDERS.find((p) => p.id === provider)!;
  const phoneValid = /\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/.test(phone.trim());
  const trialSelected = step === "trial" || trialMode;

  const targetShop = shopId ?? DEMO_SHOP_ID;

  function goToShop() {
    router.push(`/boutiques/${targetShop}?published=1`);
  }

  /** Persiste l'abonnement + publie la boutique, puis redirige. */
  async function finalize(opts: { trial: boolean }) {
    setStep("processing");
    setTrialMode(opts.trial);
    setErrorMsg(null);

    // Petit délai pour visualiser l'enregistrement de la demande.
    await new Promise((r) => setTimeout(r, opts.trial ? 700 : 2200));

    try {
      if (isFirebaseConfigured && shopId) {
        const res = await activateSubscription({
          shopId,
          plan: planId,
          months: plan.months,
          amount: plan.price,
          provider,
          phone: phone.trim() || undefined,
          reference,
          trial: opts.trial,
        });
        setReference(res.reference);
      }
      setStep("success");
      setTimeout(() => {
        if (opts.trial) goToShop();
        else router.push("/vendeur/dashboard");
      }, 1800);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof VendorError
          ? err.message
          : "L'activation a échoué. Réessayez ou contactez le support.",
      );
      setStep("error");
    }
  }

  const pay = () => finalize({ trial: false });
  const startTrial = () => finalize({ trial: true });

  function trialEndLabel() {
    const d = new Date();
    d.setDate(d.getDate() + TRIAL_DAYS);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
      {/* Colonne principale */}
      <div className="order-2 space-y-5 lg:order-1">
        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {/* 1. Choix du plan */}
          {step === "plan" && (
            <Panel key="plan">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Une formule pour chaque étape</p><h2 className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">Choisissez votre durée</h2><p className="mt-1 text-xs text-ink-muted">Plus la durée est longue, plus le coût mensuel diminue.</p></div><span className="hidden items-center gap-1.5 rounded-full bg-faso-green-soft/35 px-3 py-1.5 text-[10px] font-bold text-faso-green-dark sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" />Sans frais cachés</span></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {SUBSCRIPTION_PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    aria-pressed={planId === p.id}
                    className={cn(
                      "group relative flex min-h-[12.5rem] flex-col overflow-visible rounded-[1.35rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:p-4",
                      planId === p.id
                        ? "border-faso-gold bg-[linear-gradient(145deg,rgba(250,243,225,.9),#fff_75%)] shadow-[0_10px_30px_rgba(194,140,34,.15)] ring-1 ring-faso-gold/40"
                        : "border-clay-200/80 bg-white hover:border-faso-gold/50 hover:shadow-premium",
                    )}
                  >
                    {p.highlight && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-faso-gradient px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-white shadow-sm">
                        Préférée
                      </span>
                    )}
                    <span className="flex items-start justify-between gap-2"><span><span className="block text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">{p.months} mois</span><span className="mt-1 block text-sm font-black text-ink">{p.label}</span></span><span className={cn("grid h-5 w-5 place-items-center rounded-full border transition", planId === p.id ? "border-faso-gold bg-faso-gold text-white" : "border-clay-300 bg-white text-transparent")}><Check className="h-3 w-3" /></span></span>
                    <span className="mt-4 block text-2xl font-black tracking-tight text-ink">{formatCFA(p.price)}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-ink-muted">{formatCFA(p.perMonth)} / mois</span>
                    {p.months > 1 && <span className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-[10px] font-extrabold text-faso-green-dark"><CheckCircle2 className="h-3 w-3" />Économie de {formatCFA((SUBSCRIPTION_PLANS[0].perMonth - p.perMonth) * p.months)}</span>}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-clay-200/70 bg-[#FCFAF6] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold text-ink">Inclus dans l’offre {plan.label}</p><span className="text-[10px] font-semibold text-ink-muted">{plan.months} mois</span></div><ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {plan.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-xs leading-5 text-ink-soft"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faso-green" />
                    {perk}
                  </li>
                ))}
              </ul></div>

              <div className="mt-6 flex flex-col gap-3">
                <Button size="lg" onClick={() => setStep("method")} className="w-full justify-center rounded-full">
                  Continuer · {formatCFA(plan.price)} <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("trial")}
                  className="group flex min-h-12 items-center justify-center gap-2 rounded-full border border-faso-green/20 bg-faso-green-soft/20 px-6 py-3 text-xs font-extrabold text-faso-green-dark transition-all hover:border-faso-green/40 hover:bg-faso-green-soft/40"
                >
                  <Gift className="h-4 w-4" />
                  Démarrer avec {TRIAL_DAYS} jours gratuits
                  <span className="text-xs font-medium text-ink-muted">
                    · sans carte
                  </span>
                </button>
              </div>
            </Panel>
          )}

          {/* 1bis. Essai gratuit */}
          {step === "trial" && (
            <Panel key="trial">
              <div className="flex flex-col items-center py-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-faso-green text-white"
                >
                  <Gift className="h-8 w-8" />
                </motion.div>
                <h2 className="mt-5 text-2xl font-bold text-ink">
                  {TRIAL_DAYS} jours offerts — c&apos;est parti
                </h2>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  Votre boutique est publiée immédiatement. Aucun paiement avant
                  le {trialEndLabel()}. Vous choisirez Orange Money, Moov Money ou
                  Wave à la fin de l&apos;essai — sans interruption de service.
                </p>
                <dl className="mt-5 w-full max-w-xs space-y-2 rounded-2xl bg-clay-50 p-4 text-sm">
                  <Row label="Formule à l'issue" value={`Plan ${plan.label}`} />
                  <Row label="Montant aujourd'hui" value="0 FCFA" strong />
                  <Row label="Référence" value={reference} />
                </dl>
                <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
                  <Button size="lg" onClick={startTrial}>
                    <Zap className="h-5 w-5" />
                    Publier ma boutique maintenant
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("plan")}
                    className="text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    Revenir aux formules
                  </button>
                </div>
              </div>
            </Panel>
          )}

          {/* 2. Moyen de paiement */}
          {step === "method" && (
            <Panel key="method">
              <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Étape suivante</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-ink">Choisissez un moyen de paiement</h2>
              <p className="mt-2 rounded-xl border border-faso-gold/20 bg-faso-gold-soft/20 px-3.5 py-3 text-xs leading-5 text-ink-soft">Sélectionnez le portefeuille associé à votre demande. FasoLink ne vous demandera jamais votre code PIN.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {PAYMENT_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    aria-pressed={provider === p.id}
                    className={cn(
                      "relative flex min-h-[4.7rem] items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                      provider === p.id
                        ? "border-faso-gold bg-faso-gold-soft/15 shadow-[0_8px_24px_rgba(194,140,34,.12)] ring-1 ring-faso-gold/30"
                        : "border-clay-200/80 bg-white hover:border-faso-gold/50",
                    )}
                  >
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {p.label}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        Mobile Money
                      </span>
                    </span>
                    {provider === p.id && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-faso-green" />}
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Numéro {providerMeta.label}
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-clay-200 bg-white px-3.5 shadow-sm transition focus-within:border-faso-gold focus-within:shadow-[0_0_0_4px_rgba(244,169,60,.13)]">
                  <Phone className="h-4 w-4 text-ink-muted" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="70 00 00 00"
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-ink-muted/70"
                  />
                </div>
              </label>

              <p className="mt-2 text-[10px] leading-4 text-ink-muted">Étape de préparation de la demande. Aucun code secret ne doit être communiqué.</p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep("plan")}
                >
                  Retour
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!phoneValid}
                  onClick={() => setStep("confirm")}
                >
                  Vérifier
                </Button>
              </div>
            </Panel>
          )}

          {/* 3. Confirmation */}
          {step === "confirm" && (
            <Panel key="confirm">
              <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Dernière vérification</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-ink">Récapitulatif de la demande</h2>
              <dl className="mt-5 space-y-3 rounded-2xl border border-clay-200/70 bg-[#FCFAF6] p-4 text-sm sm:p-5">
                <Row label="Formule" value={`Abonnement ${plan.label}`} />
                <Row label="Opérateur" value={providerMeta.label} />
                <Row label="Passerelle" value={PAYMENT_GATEWAY.name} />
                <Row label="Numéro" value={phone} />
                <Row label="Référence" value={reference} />
                <div className="my-2 border-t border-clay-200" />
                <Row
                  label="Total à payer"
                  value={formatCFA(plan.price)}
                  strong
                />
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-faso-gold/20 bg-faso-gold-soft/20 p-4 text-xs leading-5 text-ink-soft">
                <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold-dark" />
                Cette action enregistre une demande en attente : aucun paiement Mobile Money n’est initié depuis cette page. L’accès boutique ne sera activé qu’après confirmation effective du règlement.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep("method")}
                >
                  Retour
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={pay}
                >
                  Enregistrer la demande · {formatCFA(plan.price)}
                </Button>
              </div>
            </Panel>
          )}

          {/* 4. Saisie du code */}
          {step === "pin" && (
            <Panel key="pin">
              <div className="mx-auto max-w-xs text-center">
                <span
                  className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-white"
                  style={{ backgroundColor: providerMeta.color }}
                >
                  <Lock className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-ink">
                  Code secret {providerMeta.label}
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Simulation — saisissez 4 chiffres quelconques
                </p>

                <div className="mt-5 flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "grid h-12 w-11 place-items-center rounded-xl border text-lg font-bold",
                        pin.length > i
                          ? "border-faso-gold bg-white"
                          : "border-clay-200 bg-clay-50",
                      )}
                    >
                      {pin[i] ? "•" : ""}
                    </div>
                  ))}
                </div>

                <input
                  autoFocus
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="sr-only"
                  aria-label="Code secret"
                />
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0].map((n, idx) =>
                    n === "" ? (
                      <span key={idx} />
                    ) : (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setPin((p) => (p + n).replace(/\D/g, "").slice(0, 4))
                        }
                        className="h-12 rounded-xl border border-clay-200 bg-white text-lg font-bold text-ink hover:bg-clay-50"
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPin((p) => p.slice(0, -1))}
                    className="h-12 rounded-xl border border-clay-200 bg-white text-sm font-semibold text-ink-muted hover:bg-clay-50"
                  >
                    ←
                  </button>
                </div>

                <Button
                  size="lg"
                  className="mt-5 w-full"
                  disabled={pin.length < 4}
                  onClick={pay}
                >
                  Valider
                </Button>
              </div>
            </Panel>
          )}

          {/* 5. Traitement */}
          {step === "processing" && (
            <Panel key="processing">
              <div className="flex flex-col items-center py-10 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-faso-gold" />
                <h2 className="mt-5 text-lg font-bold text-ink">
                  Traitement en cours…
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Enregistrement sécurisé de votre demande d’abonnement
                </p>
                {!trialMode && <p className="mt-2 max-w-sm text-xs leading-5 text-ink-muted">Votre boutique reste en attente jusqu’à confirmation effective du règlement.</p>}
              </div>
            </Panel>
          )}

          {/* 6. Succès */}
          {step === "success" && (
            <Panel key="success">
              <div className="flex flex-col items-center py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-faso-green text-white"
                >
                  <Check className="h-8 w-8" />
                </motion.div>
                <h2 className="mt-5 text-2xl font-bold text-ink">
                  {trialMode ? "Boutique en ligne !" : "Demande enregistrée !"}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  {trialMode ? (
                    <>Votre essai <strong>{plan.label}</strong> est actif et votre vitrine est <strong>publiée</strong>. Redirection vers votre boutique…</>
                  ) : (
                    <>Votre demande <strong>{reference}</strong> est enregistrée. La vitrine sera publiée après confirmation effective du paiement par l’opérateur.</>
                  )}
                </p>
                <dl className="mt-5 w-full max-w-xs space-y-2 rounded-2xl bg-clay-50 p-4 text-sm">
                  <Row label={trialMode ? "À payer aujourd'hui" : "Montant de la demande"} value={trialMode ? "0 FCFA" : formatCFA(plan.price)} />
                  <Row label="Référence" value={reference} />
                  <Row label="Opérateur" value={providerMeta.label} />
                </dl>
                <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
                  {trialMode ? (
                    <Button size="lg" onClick={goToShop}>
                      <Store className="h-5 w-5" />
                      Voir ma boutique
                    </Button>
                  ) : (
                    <ButtonLink href="/vendeur/dashboard" size="lg">
                      <Store className="h-5 w-5" />
                      Voir mon tableau de bord
                    </ButtonLink>
                  )}
                  <ButtonLink
                    href="/vendeur/dashboard"
                    variant="ghost"
                    size="md"
                  >
                    Aller au tableau de bord
                  </ButtonLink>
                </div>
              </div>
            </Panel>
          )}

          {/* 7. Erreur */}
          {step === "error" && (
            <Panel key="error">
              <div className="flex flex-col items-center py-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-faso-red-soft/50 text-faso-red-dark">
                  <AlertTriangle className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-ink">
                  Demande impossible à enregistrer
                </h2>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  {errorMsg}
                </p>
                <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
                  <Button size="lg" onClick={() => setStep("confirm")}>
                    Réessayer
                  </Button>
                  <ButtonLink href="/vendeur/inscription" variant="ghost" size="md">
                    Revenir au formulaire
                  </ButtonLink>
                </div>
              </div>
            </Panel>
          )}
        </AnimatePresence>
      </div>

      {/* Récapitulatif latéral */}
      <aside className="order-first lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <div className="overflow-hidden rounded-[1.7rem] border border-clay-200/80 bg-white shadow-[0_12px_38px_rgba(51,37,23,.06)]">
          <div className="relative isolate overflow-hidden bg-[#17120E] p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0,rgba(220,166,55,.26),transparent_46%)]" />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F3D88E]"><BadgeCheck className="h-3.5 w-3.5" />Votre récapitulatif</span>
            <p className="mt-3 text-xl font-black tracking-tight">{trialSelected ? "Essai gratuit" : `Formule ${plan.label}`}</p>
            <p className="mt-1 text-xs text-white/55">{trialSelected ? `${TRIAL_DAYS} jours · sans carte bancaire` : `${plan.months} mois · ${formatCFA(plan.perMonth)} / mois`}</p>
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs font-semibold text-white/55">{trialSelected ? "À payer aujourd’hui" : "Total de la formule"}</span><strong className="text-2xl font-black tracking-tight text-white">{trialSelected ? "0 FCFA" : formatCFA(plan.price)}</strong></div>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            {!trialSelected && <><Row label="Sous-total" value={formatCFA(plan.price)} /><Row label="Frais de service" value="Offerts" /><div className="border-t border-clay-100" /><Row label="Total" value={formatCFA(plan.price)} strong /></>}
            <ul className="space-y-2 pt-1">{plan.perks.slice(0, 3).map((perk) => <li key={perk} className="flex items-start gap-2 text-[11px] leading-4 text-ink-soft"><Check className="mt-0.5 h-3 w-3 shrink-0 text-faso-green" />{perk}</li>)}</ul>
            <p className="flex items-start gap-2 rounded-xl border border-faso-green/10 bg-faso-green-soft/20 px-3 py-2.5 text-[10px] leading-4 text-faso-green-dark"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />Aucun code PIN à partager. L’accès payant reste en attente de confirmation du règlement.</p>
            {shopId && <p className="truncate text-[9px] font-medium text-ink-muted">Boutique concernée · {shopId}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Panel({
  children,
  ...rest
}: {
  children: React.ReactNode;
  key?: string;
}) {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="card-premium rounded-[1.7rem] p-5 sm:p-7 lg:p-8"
    >
      {children}
    </motion.div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={cn(
          strong ? "text-base font-extrabold text-ink" : "font-semibold text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

const STEP_LABELS: { id: Step; label: string }[] = [
  { id: "plan", label: "Formule" },
  { id: "method", label: "Paiement" },
  { id: "confirm", label: "Confirmation" },
  { id: "success", label: "Terminé" },
];

function Stepper({ step }: { step: Step }) {
  const order: Step[] = [
    "plan",
    "method",
    "confirm",
    "pin",
    "processing",
    "success",
  ];
  const current =
    step === "trial"
      ? 0
      : step === "error"
        ? order.indexOf("confirm")
        : order.indexOf(step);
  return (
    <ol aria-label="Étapes de l’abonnement" className="flex items-center gap-1 rounded-2xl border border-clay-200/75 bg-white/85 px-3 py-3 shadow-sm sm:gap-2 sm:px-4">
      {STEP_LABELS.map((s, i) => {
        const reached = current >= order.indexOf(s.id);
        return (
          <li key={s.id} aria-current={step === s.id ? "step" : undefined} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold transition-colors sm:h-9 sm:w-9 sm:text-xs",
                reached
                  ? "bg-faso-gradient text-white shadow-sm"
                  : "bg-clay-100 text-ink-muted",
              )}
            >
              {current > order.indexOf(s.id) ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-[10px] font-extrabold sm:block",
                step === s.id ? "text-faso-red" : reached ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <span className={cn("h-px min-w-1 flex-1", current > order.indexOf(s.id) ? "bg-faso-green/50" : "bg-clay-200")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
