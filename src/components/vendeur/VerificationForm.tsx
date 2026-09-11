"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Fingerprint,
  Loader2,
  MapPin,
  Upload,
} from "lucide-react";
import { getBrowserPosition } from "@/lib/geo";
import { Button } from "@/components/ui/Button";

const DOC_TYPES = [
  { id: "cnib", label: "CNIB" },
  { id: "passeport", label: "Passeport" },
  { id: "nif", label: "NIF (entreprise)" },
];

export function VerificationForm() {
  const [docType, setDocType] = useState("cnib");
  const [docNumber, setDocNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const rectoRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);

  const valid =
    docNumber.trim().length >= 4 &&
    fullName.trim().length > 3 &&
    recto &&
    geo === "ok";

  async function confirmLocation() {
    setGeo("loading");
    try {
      await getBrowserPosition();
      setGeo("ok");
    } catch {
      setGeo("error");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium mx-auto max-w-lg p-10 text-center"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-faso-gold text-white">
          <BadgeCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-ink">Dossier envoyé</h2>
        <p className="mt-2 text-ink-soft">
          Notre équipe vérifie votre CNIB / NIF et votre localisation. Vous
          recevrez le badge <strong>« Vendeur Vérifié »</strong> sous 48h
          ouvrées, par notification WhatsApp.
        </p>
        <Button
          className="mt-6"
          onClick={() => (window.location.href = "/vendeur/dashboard")}
        >
          Retour au tableau de bord
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <fieldset className="card-premium space-y-5 p-6 md:p-8">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <Fingerprint className="h-4 w-4 text-faso-red" />
          Pièce d&apos;identité
        </legend>

        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDocType(d.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                docType === d.id
                  ? "border-transparent bg-faso-gradient text-white"
                  : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Numéro du document
          </span>
          <input
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="Ex. B1234567"
            className="h-11 w-full rounded-xl border border-clay-200 bg-white px-3 text-sm outline-none focus:border-faso-gold"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Nom complet (tel qu&apos;écrit sur la pièce)
          </span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Prénom NOM"
            className="h-11 w-full rounded-xl border border-clay-200 bg-white px-3 text-sm outline-none focus:border-faso-gold"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Recto", file: recto, set: setRecto, ref: rectoRef },
            { label: "Verso", file: verso, set: setVerso, ref: versoRef },
          ].map((f) => (
            <div key={f.label}>
              <input
                ref={f.ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => f.set(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => f.ref.current?.click()}
                className={`flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs font-semibold transition-colors ${
                  f.file
                    ? "border-faso-green bg-faso-green-soft/20 text-faso-green-dark"
                    : "border-clay-300 bg-clay-50 text-ink-muted hover:border-faso-gold"
                }`}
              >
                {f.file ? (
                  <>
                    <Check className="h-5 w-5" />
                    {f.label} ajouté
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    {f.label} de la pièce
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card-premium space-y-4 p-6 md:p-8">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <MapPin className="h-4 w-4 text-faso-green" />
          Localisation physique
        </legend>
        <p className="text-sm text-ink-soft">
          Confirmez que vous vous trouvez actuellement dans votre boutique. Nous
          enregistrons uniquement les coordonnées approximatives du quartier.
        </p>
        <Button
          type="button"
          variant={geo === "ok" ? "secondary" : "outline"}
          onClick={confirmLocation}
          disabled={geo === "loading"}
        >
          {geo === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {geo === "ok" ? (
            <>
              <Check className="h-4 w-4" />
              Position confirmée
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Confirmer ma position
            </>
          )}
        </Button>
        {geo === "error" && (
          <p className="text-xs text-faso-red-dark">
            Impossible d&apos;obtenir votre position. Autorisez la
            géolocalisation puis réessayez.
          </p>
        )}
      </fieldset>

      <div className="flex flex-col items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={!valid || status === "sending"}
          className="w-full sm:w-auto"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Envoi du dossier…
            </>
          ) : (
            <>
              <BadgeCheck className="h-5 w-5" />
              Soumettre pour vérification
            </>
          )}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          Vos documents sont chiffrés et supprimés après validation (RGPD /
          Loi 010-2004 BF sur la protection des données).
        </p>
      </div>
    </form>
  );
}
