"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  CircleHelp,
  FileCheck2,
  Fingerprint,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { getBrowserPosition } from "@/lib/geo";
import { submitVerificationRequest, VendorError } from "@/lib/vendor";
import { Button } from "@/components/ui/Button";

const DOC_TYPES = [
  { id: "cnib", label: "CNIB", detail: "Carte nationale" },
  { id: "passeport", label: "Passeport", detail: "Document de voyage" },
  { id: "nif", label: "NIF", detail: "Entreprise" },
] as const;

export function VerificationForm({
  shopId,
  demo = false,
}: {
  shopId: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [docType, setDocType] = useState("cnib");
  const [docNumber, setDocNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rectoRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);

  const valid =
    docNumber.trim().length >= 4 &&
    fullName.trim().length > 3 &&
    recto &&
    geo === "ok";
  const progress = [Boolean(docNumber.trim().length >= 4 && fullName.trim().length > 3 && recto), geo === "ok"];
  const completedSteps = progress.filter(Boolean).length;

  async function confirmLocation() {
    setGeo("loading");
    try {
      const coords = await getBrowserPosition();
      setPosition(coords);
      setGeo("ok");
    } catch {
      setGeo("error");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !recto) return;
    setStatus("sending");
    setError(null);
    try {
      if (demo) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        await submitVerificationRequest({
          shopId,
          documentType: docType as "cnib" | "passeport" | "nif",
          documentNumber: docNumber,
          fullName,
          recto,
          verso,
          latitude: position?.lat ?? null,
          longitude: position?.lng ?? null,
        });
      }
      setStatus("done");
    } catch (cause) {
      setError(
        cause instanceof VendorError || cause instanceof Error
          ? cause.message
          : "Impossible d’envoyer le dossier. Réessayez.",
      );
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-faso-green/15 bg-white p-8 text-center shadow-premium md:p-12"
      >
        <div className="page-ambient" aria-hidden="true" />
        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-faso-green-soft/40 text-faso-green shadow-inner">
          <BadgeCheck className="h-10 w-10" />
        </div>
        <span className="section-kicker mt-6 justify-center">Dossier transmis</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Votre demande est en examen</h2>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-ink-soft">
          L’équipe FasoLink va examiner les informations et justificatifs fournis. Vous pourrez suivre l’état de votre demande depuis votre espace vendeur.
        </p>
        <div className="mx-auto mt-7 flex max-w-lg items-start gap-3 rounded-2xl border border-clay-200 bg-clay-50 p-4 text-left text-sm leading-6 text-ink-soft">
          <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-faso-green" />
          <span>Le badge « Vendeur vérifié » sera attribué après validation du dossier.</span>
        </div>
        <Button className="mt-7" onClick={() => router.push("/vendeur/dashboard")}>
          Retour au tableau de bord
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-clay-200/80 bg-white/75 px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-bold text-ink">Un parcours simple et sécurisé</p>
          <p className="mt-1 text-xs text-ink-muted">Préparez votre pièce et autorisez la localisation de la boutique.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-faso-green-soft/30 px-3 py-2 text-xs font-bold text-faso-green-dark">
          <ShieldCheck className="h-4 w-4" /> Contrôle par FasoLink
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={submit} className="space-y-5">
          <fieldset className="card-premium space-y-6 p-5 sm:p-7 md:p-8">
            <legend className="sr-only">Étape 1 — Identité et justificatifs</legend>
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-red-soft/40 text-faso-red"><Fingerprint className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-faso-red">Étape 01</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink">Identité du responsable</h2>
                <p className="mt-1 text-sm leading-6 text-ink-soft">Utilisez les informations lisibles sur le justificatif que vous transmettez.</p>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-ink">Type de justificatif</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Type de justificatif">
                {DOC_TYPES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={docType === d.id}
                    onClick={() => setDocType(d.id)}
                    className={`rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red focus-visible:ring-offset-2 ${docType === d.id ? "border-faso-red/40 bg-faso-red-soft/20 shadow-sm" : "border-clay-200 bg-white hover:border-faso-gold"}`}
                  >
                    <span className="flex items-center justify-between text-sm font-bold text-ink">{d.label}{docType === d.id && <Check className="h-4 w-4 text-faso-red" />}</span>
                    <span className="mt-1 block text-xs text-ink-muted">{d.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Numéro du document</span>
                <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="Ex. B1234567" autoComplete="off" className="input-premium" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Nom complet</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Comme sur le document" autoComplete="name" className="input-premium" />
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">Photos du justificatif</span>
                <span className="text-xs text-ink-muted">Image nette · 5 Mo maximum par fichier</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Recto", file: recto, set: setRecto, ref: rectoRef, required: true },
                  { label: "Verso", file: verso, set: setVerso, ref: versoRef, required: false },
                ].map((f) => (
                  <div key={f.label}>
                    <input ref={f.ref} type="file" accept="image/*" className="sr-only" aria-label={`Choisir le ${f.label.toLowerCase()} du justificatif`} onChange={(e) => f.set(e.target.files?.[0] ?? null)} />
                    <button
                      type="button"
                      onClick={() => f.ref.current?.click()}
                      className={`group flex min-h-28 w-full items-center gap-4 rounded-2xl border border-dashed p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red focus-visible:ring-offset-2 ${f.file ? "border-faso-green/50 bg-faso-green-soft/15" : "border-clay-300 bg-clay-50/80 hover:border-faso-gold hover:bg-white"}`}
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${f.file ? "bg-faso-green text-white" : "bg-white text-ink-soft shadow-sm"}`}>{f.file ? <Check className="h-5 w-5" /> : <Upload className="h-5 w-5" />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">{f.label}{f.required ? " · obligatoire" : " · facultatif"}</span>
                        <span className="mt-1 block truncate text-xs text-ink-muted">{f.file?.name ?? "Choisir une photo claire"}</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="card-premium space-y-5 p-5 sm:p-7 md:p-8">
            <legend className="sr-only">Étape 2 — Localisation de la boutique</legend>
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-green-soft/30 text-faso-green"><MapPin className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-faso-green">Étape 02</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink">Localisation de la boutique</h2>
                <p className="mt-1 text-sm leading-6 text-ink-soft">Placez-vous dans votre boutique et autorisez votre navigateur à partager la position pour confirmer son emplacement.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-clay-200 bg-clay-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-sm leading-6 text-ink-soft">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold-dark" />
                <span>La position précise est jointe à la demande afin de permettre son examen par l’équipe FasoLink.</span>
              </div>
              <Button type="button" variant={geo === "ok" ? "secondary" : "outline"} onClick={confirmLocation} disabled={geo === "loading"} className="shrink-0">
                {geo === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : geo === "ok" ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {geo === "loading" ? "Localisation…" : geo === "ok" ? "Position confirmée" : "Confirmer ma position"}
              </Button>
            </div>
            {geo === "error" && <p role="alert" className="rounded-xl bg-faso-red-soft/40 px-4 py-3 text-sm text-faso-red-dark">Position indisponible. Vérifiez l’autorisation de localisation dans votre navigateur et réessayez.</p>}
          </fieldset>

          <div className="rounded-[1.75rem] border border-clay-200 bg-white p-5 shadow-premium sm:p-6">
            {error && <p role="alert" className="mb-4 rounded-xl bg-faso-red-soft/40 px-4 py-3 text-sm text-faso-red-dark">{error}</p>}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-sm leading-6 text-ink-soft">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-faso-green" />
                <span>Vos justificatifs sont transmis à FasoLink pour l’examen de votre demande. Ne transmettez que des documents vous appartenant.</span>
              </div>
              <Button type="submit" size="lg" disabled={!valid || status === "sending"} className="w-full shrink-0 sm:w-auto">
                {status === "sending" ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi du dossier…</> : <><BadgeCheck className="h-5 w-5" /> Envoyer ma demande</>}
              </Button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-ink p-5 text-white shadow-premium-lg sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Votre progression</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{completedSteps}/2 étapes</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Progression de la vérification" aria-valuemin={0} aria-valuemax={2} aria-valuenow={completedSteps}>
              <motion.div initial={false} animate={{ width: `${completedSteps * 50}%` }} transition={{ duration: 0.35 }} className="h-full rounded-full bg-gradient-to-r from-faso-gold to-faso-green" />
            </div>
            <ol className="mt-5 space-y-4">
              {[
                { title: "Identité et pièce", done: progress[0] },
                { title: "Localisation", done: progress[1] },
              ].map((step, index) => (
                <li key={step.title} className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold ${step.done ? "bg-faso-green text-white" : "border border-white/20 bg-white/5 text-white/70"}`}>{step.done ? <Check className="h-4 w-4" /> : `0${index + 1}`}</span>
                  <span className={`text-sm ${step.done ? "font-semibold text-white" : "text-white/65"}`}>{step.title}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-faso-gold" />
                <p className="text-xs leading-5 text-white/75">Après validation, le badge rassure les clients sur l’identité et l’emplacement de votre boutique.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-clay-200 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink"><CircleHelp className="h-4 w-4 text-faso-gold-dark" /> Avant l’envoi</div>
            <p className="mt-2 text-xs leading-5 text-ink-muted">Vérifiez que le nom et le numéro sont lisibles et correspondent au document. Une photo floue peut ralentir l’examen.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
