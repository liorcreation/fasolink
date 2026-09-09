"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
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
import { isSupabaseConfigured } from "@/lib/supabase";
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

/** Boutique de démonstration utilisée pour la redirection hors Supabase. */
const DEMO_SHOP_ID = "faso-delices";

export function PaymentSimulator({ shopId }: { shopId?: string }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("plan");
  const [planId, setPlanId] = useState<SubscriptionPlan>("trimestriel");
  const [provider, setProvider] = useState<Provider>("orange_money");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reference, setReference] = useState(
    () => "FL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  );

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;
  const providerMeta = PAYMENT_PROVIDERS.find((p) => p.id === provider)!;
  const phoneValid = /\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/.test(phone.trim());

  const targetShop = shopId ?? DEMO_SHOP_ID;

  function goToShop() {
    router.push(`/boutiques/${targetShop}?published=1`);
  }

  /** Persiste l'abonnement + publie la boutique, puis redirige. */
  async function finalize(opts: { trial: boolean }) {
    setStep("processing");
    setErrorMsg(null);

    // Petit délai pour laisser voir la confirmation opérateur (simulation).
    await new Promise((r) => setTimeout(r, opts.trial ? 700 : 2200));

    try {
      if (isSupabaseConfigured && shopId) {
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
      setTimeout(goToShop, 1800);
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
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Colonne principale */}
      <div className="space-y-6">
        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {/* 1. Choix du plan */}
          {step === "plan" && (
            <Panel key="plan">
              <h2 className="text-xl font-bold text-ink">
                Choisissez votre formule
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {SUBSCRIPTION_PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={cn(
                      "relative rounded-2xl border p-4 text-left transition-all",
                      planId === p.id
                        ? "border-faso-gold bg-faso-gold-soft/20 shadow-premium"
                        : "border-clay-200 bg-white hover:border-faso-gold/50",
                    )}
                  >
                    {p.highlight && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-faso-gradient px-2 py-0.5 text-[10px] font-bold text-white">
                        POPULAIRE
                      </span>
                    )}
                    <p className="text-sm font-bold text-ink">{p.label}</p>
                    <p className="mt-1 text-lg font-extrabold text-ink">
                      {formatCFA(p.price)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      soit {formatCFA(p.perMonth)}/mois
                    </p>
                  </button>
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {plan.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-2 text-sm text-ink-soft"
                  >
                    <Check className="h-4 w-4 text-faso-green" />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3">
                <Button size="lg" onClick={() => setStep("method")}>
                  Payer maintenant · {formatCFA(plan.price)}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("trial")}
                  className="group flex items-center justify-center gap-2 rounded-full border-2 border-dashed border-faso-green/50 px-6 py-3 text-sm font-bold text-faso-green-dark transition-colors hover:bg-faso-green-soft/20"
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
              <h2 className="text-xl font-bold text-ink">Moyen de paiement</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Agrégateur {PAYMENT_GATEWAY.name} · activation automatique de la
                boutique dès confirmation (webhook).
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {PAYMENT_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                      provider === p.id
                        ? "border-faso-gold shadow-premium"
                        : "border-clay-200 hover:border-faso-gold/50",
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
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Numéro {providerMeta.label}
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-clay-200 bg-white px-3 focus-within:border-faso-gold">
                  <Phone className="h-4 w-4 text-ink-muted" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="70 00 00 00"
                    className="h-11 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <div className="mt-6 flex gap-3">
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
              <h2 className="text-xl font-bold text-ink">Confirmez le paiement</h2>
              <dl className="mt-5 space-y-3 rounded-2xl bg-clay-50 p-4 text-sm">
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
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-faso-gold-soft/30 p-3 text-xs text-ink-soft">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold-dark" />
                Vous allez recevoir une demande de confirmation sur votre
                téléphone. {providerMeta.hint}.
              </p>

              <div className="mt-6 flex gap-3">
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
                  onClick={() => setStep("pin")}
                >
                  Payer {formatCFA(plan.price)}
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
                  Confirmation auprès de {providerMeta.label}
                </p>
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
                  Boutique en ligne&nbsp;!
                </h2>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  Le webhook {PAYMENT_GATEWAY.name} a validé le transfert : votre
                  abonnement <strong>{plan.label}</strong> est actif et votre
                  vitrine est <strong>publiée</strong>. Redirection vers votre
                  boutique…
                </p>
                <dl className="mt-5 w-full max-w-xs space-y-2 rounded-2xl bg-clay-50 p-4 text-sm">
                  <Row label="Montant" value={formatCFA(plan.price)} />
                  <Row label="Référence" value={reference} />
                  <Row label="Opérateur" value={providerMeta.label} />
                </dl>
                <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
                  <Button size="lg" onClick={goToShop}>
                    <Store className="h-5 w-5" />
                    Voir ma boutique
                  </Button>
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
                  Activation impossible
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
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-premium overflow-hidden">
          <div className="bg-faso-gradient bg-[length:200%_200%] p-5 text-white animate-gradient-pan">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Récapitulatif
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              Abonnement {plan.label}
            </p>
            <p className="text-sm text-white/85">
              {formatCFA(plan.perMonth)}/mois · {plan.months} mois
            </p>
          </div>
          <div className="space-y-3 p-5">
            <Row label="Sous-total" value={formatCFA(plan.price)} />
            <Row label="Frais de service" value="Offerts" />
            <div className="border-t border-clay-100" />
            <Row label="Total" value={formatCFA(plan.price)} strong />
            <p className="flex items-center gap-2 pt-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-faso-green" />
              Paiement simulé — aucune transaction réelle
            </p>
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
      className="card-premium p-6 md:p-8"
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
      ? order.length
      : step === "error"
        ? order.indexOf("confirm")
        : order.indexOf(step);
  return (
    <ol className="flex items-center gap-2">
      {STEP_LABELS.map((s, i) => {
        const reached = current >= order.indexOf(s.id);
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                reached
                  ? "bg-faso-gradient text-white"
                  : "bg-clay-100 text-ink-muted",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                reached ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <span className="h-px flex-1 bg-clay-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
