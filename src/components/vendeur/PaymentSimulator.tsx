"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BadgeCheck, Check, Gift, Loader2, LockKeyhole, ShieldCheck, Smartphone, Store, Zap } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/database.types";
import { SUBSCRIPTION_PLANS, TRIAL_DAYS } from "@/lib/constants";
import { cn, formatCFA } from "@/lib/utils";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { Button, ButtonLink } from "@/components/ui/Button";

type Step = "plan" | "method" | "confirm" | "processing" | "success" | "trial" | "error";

export function PaymentSimulator({ shopId }: { shopId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("plan");
  const [planId, setPlanId] = useState<SubscriptionPlan>("trimestriel");
  const [trialMode, setTrialMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [returnPending, setReturnPending] = useState(false);
  const plan = SUBSCRIPTION_PLANS.find((item) => item.id === planId)!;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentReference = params.get("reference");
    if (params.get("payment") !== "return" || !paymentReference) return;
    setReference(paymentReference);
    setStep("processing");
    setReturnPending(true);
    void fetch("/api/payments/cinetpay/verify", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference: paymentReference }),
    }).then(async (response) => {
      const result = await response.json() as { activated?: boolean; error?: string };
      if (result.activated) {
        setTrialMode(false);
        setStep("success");
      } else {
        setErrorMsg(result.error || "Paiement en cours de confirmation. Consultez votre espace vendeur dans un instant.");
        setStep("error");
      }
    }).catch(() => {
      setErrorMsg("Le paiement a été transmis. Sa confirmation peut prendre quelques instants; votre boutique ne sera activée qu’après vérification CinetPay.");
      setStep("error");
    }).finally(() => setReturnPending(false));
  }, []);

  function goToShop() {
    if (shopId) router.push(`/boutiques/${shopId}?published=1`);
    else router.push("/vendeur/dashboard");
  }

  async function startTrial() {
    if (!shopId) {
      setErrorMsg("Sélectionnez d’abord la boutique concernée.");
      setStep("error");
      return;
    }
    setStep("processing");
    setTrialMode(true);
    setErrorMsg(null);
    try {
      const user = auth.currentUser;
      if (!user || user.isAnonymous) throw new Error("Connectez-vous à votre compte vendeur avant d’activer l’essai.");
      const response = await fetch("/api/payments/trial", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(), shopId, plan: planId }),
      });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Impossible d’activer l’essai.");
      setReference(result.reference || "");
      setStep("success");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Impossible d’activer l’essai pour le moment.");
      setStep("error");
    }
  }

  async function payWithCinetPay() {
    if (!shopId) {
      setErrorMsg("Sélectionnez d’abord la boutique concernée.");
      setStep("error");
      return;
    }
    if (!isFirebaseConfigured || !auth.currentUser || auth.currentUser.isAnonymous) {
      setErrorMsg("Connectez-vous à votre compte vendeur avant de payer.");
      setStep("error");
      return;
    }
    setStep("processing");
    setTrialMode(false);
    setErrorMsg(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/payments/cinetpay/initialize", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken, shopId, plan: planId }),
      });
      const result = await response.json() as { paymentUrl?: string; reference?: string; error?: string };
      if (!response.ok || !result.paymentUrl) throw new Error(result.error || "CinetPay n’a pas pu démarrer le paiement.");
      setReference(result.reference || "");
      window.location.assign(result.paymentUrl);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Impossible de préparer le paiement.");
      setStep("error");
    }
  }

  function trialEndLabel() {
    const date = new Date();
    date.setDate(date.getDate() + TRIAL_DAYS);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  }

  const trialSelected = step === "trial" || trialMode;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
      <div className="order-2 space-y-5 lg:order-1">
        <Stepper step={step} />
        <AnimatePresence mode="wait">
          {step === "plan" && <Panel key="plan">
            <Eyebrow>Une formule pour chaque étape</Eyebrow>
            <h2 className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">Choisissez votre durée</h2>
            <p className="mt-1 text-xs text-ink-muted">Un règlement sécurisé, confirmé directement par CinetPay.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((item) => <button key={item.id} type="button" onClick={() => setPlanId(item.id)} aria-pressed={planId === item.id} className={cn("relative flex min-h-[11rem] flex-col rounded-[1.35rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5", planId === item.id ? "border-faso-gold bg-faso-gold-soft/20 shadow-premium ring-1 ring-faso-gold/40" : "border-clay-200/80 bg-white hover:border-faso-gold/50")}>
                {item.highlight && <span className="absolute -top-2.5 right-3 rounded-full bg-faso-gradient px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white">Préférée</span>}
                <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">{item.months} mois</span>
                <span className="mt-1 text-sm font-black text-ink">{item.label}</span>
                <span className="mt-4 text-2xl font-black tracking-tight text-ink">{formatCFA(item.price)}</span>
                <span className="text-[11px] font-semibold text-ink-muted">{formatCFA(item.perMonth)} / mois</span>
              </button>)}
            </div>
            <div className="mt-5 rounded-2xl border border-clay-200/70 bg-[#FCFAF6] p-4"><p className="text-xs font-extrabold text-ink">Inclus dans l’offre {plan.label}</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{plan.perks.map((perk) => <li key={perk} className="flex items-start gap-2 text-xs leading-5 text-ink-soft"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faso-green" />{perk}</li>)}</ul></div>
            <div className="mt-6 flex flex-col gap-3">
              <Button size="lg" onClick={() => setStep("method")} className="w-full justify-center rounded-full">Continuer · {formatCFA(plan.price)} <ArrowRight className="h-4 w-4" /></Button>
              <button type="button" onClick={() => setStep("trial")} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-faso-green/20 bg-faso-green-soft/20 px-6 py-3 text-xs font-extrabold text-faso-green-dark hover:bg-faso-green-soft/40"><Gift className="h-4 w-4" />Démarrer avec {TRIAL_DAYS} jours gratuits <span className="font-medium text-ink-muted">· sans carte</span></button>
            </div>
          </Panel>}

          {step === "trial" && <Panel key="trial"><div className="flex flex-col items-center py-4 text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="grid h-16 w-16 place-items-center rounded-full bg-faso-green text-white"><Gift className="h-8 w-8" /></motion.div><h2 className="mt-5 text-2xl font-bold text-ink">{TRIAL_DAYS} jours offerts — c’est parti</h2><p className="mt-2 max-w-sm text-sm text-ink-soft">Votre boutique sera publiée immédiatement après activation de l’essai. Aucun paiement avant le {trialEndLabel()}.</p><dl className="mt-5 w-full max-w-xs space-y-2 rounded-2xl bg-clay-50 p-4 text-sm"><Row label="Formule à l’issue" value={`Plan ${plan.label}`} /><Row label="À payer aujourd’hui" value="0 FCFA" strong /></dl><div className="mt-6 flex w-full max-w-xs flex-col gap-2"><Button size="lg" onClick={startTrial}><Zap className="h-5 w-5" />Publier ma boutique maintenant</Button><button type="button" onClick={() => setStep("plan")} className="text-xs font-semibold text-ink-muted">Revenir aux formules</button></div></div></Panel>}

          {step === "method" && <Panel key="method"><Eyebrow>Paiement sécurisé</Eyebrow><h2 className="mt-1 text-xl font-black tracking-tight text-ink">Réglez avec CinetPay</h2><p className="mt-2 text-sm leading-6 text-ink-soft">Vous serez redirigé vers la page officielle CinetPay pour choisir le moyen Mobile Money disponible et confirmer le paiement auprès de votre opérateur.</p><div className="mt-5 flex items-start gap-3 rounded-2xl border border-faso-green/15 bg-faso-green-soft/20 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-faso-green-dark"><Smartphone className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-ink">Orange Money · Moov Money</p><p className="mt-1 text-xs leading-5 text-ink-soft">Les moyens proposés dépendent des canaux activés sur votre compte marchand CinetPay.</p></div></div><p className="mt-4 flex items-start gap-2 rounded-xl border border-faso-gold/20 bg-faso-gold-soft/20 p-3 text-xs leading-5 text-ink-soft"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold-dark" />FasoLink ne collecte jamais votre code PIN ni les informations de votre portefeuille.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row"><Button variant="ghost" size="lg" onClick={() => setStep("plan")}>Retour</Button><Button size="lg" className="flex-1" onClick={() => setStep("confirm")}>Continuer vers le récapitulatif</Button></div></Panel>}

          {step === "confirm" && <Panel key="confirm"><Eyebrow>Dernière vérification</Eyebrow><h2 className="mt-1 text-xl font-black tracking-tight text-ink">Votre abonnement</h2><dl className="mt-5 space-y-3 rounded-2xl border border-clay-200/70 bg-[#FCFAF6] p-4 text-sm sm:p-5"><Row label="Formule" value={`Abonnement ${plan.label}`} /><Row label="Passerelle" value="CinetPay" /><Row label="Boutique" value={shopId || "Non sélectionnée"} /><div className="my-2 border-t border-clay-200" /><Row label="Total à payer" value={formatCFA(plan.price)} strong /></dl><p className="mt-4 flex items-start gap-2 rounded-2xl border border-faso-gold/20 bg-faso-gold-soft/20 p-4 text-xs leading-5 text-ink-soft"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold-dark" />La boutique ne sera activée qu’après vérification du paiement par l’API CinetPay.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row"><Button variant="ghost" size="lg" onClick={() => setStep("method")}>Retour</Button><Button size="lg" className="flex-1" onClick={payWithCinetPay}>Payer {formatCFA(plan.price)} avec CinetPay <ArrowRight className="h-4 w-4" /></Button></div></Panel>}

          {step === "processing" && <Panel key="processing"><div className="flex flex-col items-center py-10 text-center"><Loader2 className="h-12 w-12 animate-spin text-faso-gold" /><h2 className="mt-5 text-xl font-bold text-ink">{returnPending ? "Vérification du paiement" : "Préparation de votre paiement"}</h2><p className="mt-2 max-w-sm text-sm text-ink-muted">Nous vérifions le statut auprès de CinetPay. Ne fermez pas cette page.</p></div></Panel>}

          {step === "success" && <Panel key="success"><div className="flex flex-col items-center py-6 text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="grid h-16 w-16 place-items-center rounded-full bg-faso-green text-white"><Check className="h-8 w-8" /></motion.div><h2 className="mt-5 text-2xl font-bold text-ink">{trialMode ? "Essai activé" : "Paiement confirmé"}</h2><p className="mt-2 max-w-sm text-sm text-ink-soft">{trialMode ? "Votre boutique est prête pour sa période d’essai." : "CinetPay a confirmé le règlement et la boutique est activée."}</p>{reference && <p className="mt-3 text-xs text-ink-muted">Référence · {reference}</p>}<ButtonLink href="/vendeur/dashboard" size="lg" className="mt-6"><Store className="h-5 w-5" />Voir mon tableau de bord</ButtonLink>{trialMode && <button type="button" onClick={goToShop} className="mt-3 text-xs font-semibold text-ink-muted">Voir ma vitrine</button>}</div></Panel>}

          {step === "error" && <Panel key="error"><div className="flex flex-col items-center py-6 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-faso-red-soft/50 text-faso-red-dark"><AlertTriangle className="h-8 w-8" /></span><h2 className="mt-5 text-2xl font-bold text-ink">{returnPending ? "Confirmation en cours" : "Paiement non terminé"}</h2><p className="mt-2 max-w-sm text-sm text-ink-soft">{errorMsg}</p><div className="mt-6 flex w-full max-w-xs flex-col gap-2"><Button size="lg" onClick={() => setStep("plan")}>Revenir aux formules</Button><ButtonLink href="/vendeur/dashboard" variant="ghost" size="md">Voir mon espace vendeur</ButtonLink></div></div></Panel>}
        </AnimatePresence>
      </div>
      <aside className="order-first lg:sticky lg:top-24 lg:order-2 lg:self-start"><div className="overflow-hidden rounded-[1.7rem] border border-clay-200/80 bg-white shadow-[0_12px_38px_rgba(51,37,23,.06)]"><div className="relative isolate overflow-hidden bg-[#17120E] p-5 text-white sm:p-6"><span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F3D88E]"><BadgeCheck className="h-3.5 w-3.5" />Votre récapitulatif</span><p className="mt-3 text-xl font-black tracking-tight">{trialSelected ? "Essai gratuit" : `Formule ${plan.label}`}</p><p className="mt-1 text-xs text-white/55">{trialSelected ? `${TRIAL_DAYS} jours · sans carte bancaire` : `${plan.months} mois · ${formatCFA(plan.perMonth)} / mois`}</p><div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs font-semibold text-white/55">{trialSelected ? "À payer aujourd’hui" : "Total de la formule"}</span><strong className="text-2xl font-black tracking-tight text-white">{trialSelected ? "0 FCFA" : formatCFA(plan.price)}</strong></div></div><div className="space-y-3 p-5 sm:p-6">{!trialSelected && <><Row label="Frais de service" value="Offerts" /><div className="border-t border-clay-100" /><Row label="Total" value={formatCFA(plan.price)} strong /></>}<ul className="space-y-2 pt-1">{plan.perks.slice(0, 3).map((perk) => <li key={perk} className="flex items-start gap-2 text-[11px] leading-4 text-ink-soft"><Check className="mt-0.5 h-3 w-3 shrink-0 text-faso-green" />{perk}</li>)}</ul><p className="flex items-start gap-2 rounded-xl border border-faso-green/10 bg-faso-green-soft/20 px-3 py-2.5 text-[10px] leading-4 text-faso-green-dark"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />Aucun code PIN collecté. Activation uniquement après confirmation CinetPay.</p>{shopId && <p className="truncate text-[9px] font-medium text-ink-muted">Boutique · {shopId}</p>}</div></div></aside>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">{children}</p>;
}

function Panel({ children, ...rest }: { children: React.ReactNode; key?: string }) {
  return <motion.div {...rest} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="card-premium rounded-[1.7rem] p-5 sm:p-7 lg:p-8">{children}</motion.div>;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3"><dt className="text-ink-muted">{label}</dt><dd className={cn("text-right", strong ? "text-base font-extrabold text-ink" : "font-semibold text-ink")}>{value}</dd></div>;
}

const STEP_LABELS = ["Formule", "Paiement", "Confirmation", "Terminé"];
function Stepper({ step }: { step: Step }) {
  const current = step === "trial" ? 0 : step === "method" ? 1 : ["confirm", "processing", "error"].includes(step) ? 2 : step === "success" ? 3 : 0;
  return <ol aria-label="Étapes de l’abonnement" className="flex items-center gap-1 rounded-2xl border border-clay-200/75 bg-white/85 px-3 py-3 shadow-sm sm:gap-2 sm:px-4">{STEP_LABELS.map((label, index) => <li key={label} aria-current={index === current ? "step" : undefined} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2"><span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold sm:h-9 sm:w-9 sm:text-xs", current >= index ? "bg-faso-gradient text-white" : "bg-clay-100 text-ink-muted")}>{current > index ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={cn("hidden truncate text-[10px] font-extrabold sm:block", current === index ? "text-faso-red" : current > index ? "text-ink" : "text-ink-muted")}>{label}</span>{index < STEP_LABELS.length - 1 && <span className={cn("h-px min-w-1 flex-1", current > index ? "bg-faso-green/50" : "bg-clay-200")} />}</li>)}</ol>;
}
