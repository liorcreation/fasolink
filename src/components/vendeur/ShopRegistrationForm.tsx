"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Trash2,
  Upload,
} from "lucide-react";
import type { ShopCategory } from "@/lib/database.types";
import { BURKINA_CITIES, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createShopWithAssets, VendorError } from "@/lib/vendor";
import { Button } from "@/components/ui/Button";

interface FormState {
  name: string;
  category: ShopCategory | "";
  city: string;
  neighborhood: string;
  whatsapp: string;
  description: string;
}

const initial: FormState = {
  name: "",
  category: "",
  city: "",
  neighborhood: "",
  whatsapp: "",
  description: "",
};

const MAX_GALLERY = 6;

export function ShopRegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [logo, setLogo] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : null),
    [logo],
  );
  const galleryPreviews = useMemo(
    () => gallery.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [gallery],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid =
    form.name.trim().length > 1 &&
    form.category !== "" &&
    form.city !== "" &&
    /\d{6,}/.test(form.whatsapp) &&
    form.description.trim().length > 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "saving") return;
    setStatus("saving");
    setError(null);

    try {
      if (isFirebaseConfigured) {
        const shop = await createShopWithAssets(
          {
            name: form.name,
            category: form.category as ShopCategory,
            city: form.city,
            neighborhood: form.neighborhood || null,
            whatsapp: form.whatsapp,
            description: form.description,
          },
          logo,
          gallery,
        );
        setStatus("done");
        router.push(`/vendeur/paiement?shop=${shop.id}`);
        return;
      }

      // Mode démo — pas de backend connecté
      await new Promise((r) => setTimeout(r, 900));
      setStatus("done");
      router.push("/vendeur/paiement?demo=1");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof VendorError
          ? err.message
          : "L'enregistrement a échoué. Vérifiez votre connexion et réessayez.",
      );
      setStatus("error");
    }
  }

  function onGalleryPick(list: FileList | null) {
    if (!list) return;
    setGallery((prev) =>
      [...prev, ...Array.from(list)].slice(0, MAX_GALLERY),
    );
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium mx-auto max-w-lg p-10 text-center"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-faso-green text-white">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-ink">Boutique enregistrée</h2>
        <p className="mt-2 text-ink-soft">
          Redirection vers l&apos;abonnement…
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      {/* Identité */}
      <fieldset className="card-premium space-y-5 p-6 md:p-8">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <Building2 className="h-4 w-4 text-faso-red" />
          Identité de la boutique
        </legend>

        <Field label="Nom de la boutique" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex. Faso Délices"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Catégorie" required>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => update("category", c.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  form.category === c.id
                    ? "border-transparent bg-faso-gradient text-white shadow-premium"
                    : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold",
                )}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description" required hint="Minimum 20 caractères">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="Décrivez vos produits, votre savoir-faire, vos délais de livraison…"
            className={cn(inputCls, "resize-none")}
            required
          />
        </Field>
      </fieldset>

      {/* Localisation & contact */}
      <fieldset className="card-premium space-y-5 p-6 md:p-8">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <MapPin className="h-4 w-4 text-faso-green" />
          Localisation & contact
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ville" required>
            <select
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Sélectionner…</option>
              {BURKINA_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Quartier / secteur">
            <input
              type="text"
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Ex. Ouaga 2000, Secteur 15"
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label="Numéro WhatsApp Business"
          required
          hint="Format local (70 00 00 00) ou international (+226…)"
        >
          <div className="flex items-center gap-2 rounded-xl border border-clay-200 bg-white px-3 focus-within:border-faso-gold">
            <Phone className="h-4 w-4 text-ink-muted" />
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="70 12 34 56"
              className="h-11 w-full bg-transparent text-sm outline-none"
              required
            />
          </div>
        </Field>
      </fieldset>

      {/* Médias */}
      <fieldset className="card-premium space-y-5 p-6 md:p-8">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <ImagePlus className="h-4 w-4 text-faso-gold-dark" />
          Logo & photos
        </legend>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-dashed border-clay-300 bg-clay-50">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Aperçu du logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-ink-muted">
                <Upload className="h-6 w-6" />
              </span>
            )}
          </div>
          <div>
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoInput.current?.click()}
            >
              {logo ? "Changer le logo" : "Téléverser un logo"}
            </Button>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="ml-3 text-xs font-semibold text-faso-red hover:underline"
              >
                Retirer
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">
              Galerie produits{" "}
              <span className="text-ink-muted">
                ({gallery.length}/{MAX_GALLERY})
              </span>
            </p>
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onGalleryPick(e.target.files)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => galleryInput.current?.click()}
              disabled={gallery.length >= MAX_GALLERY}
            >
              <ImagePlus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>

          {galleryPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {galleryPreviews.map((p, i) => (
                <div
                  key={p.url}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-clay-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGallery((g) => g.filter((_, idx) => idx !== i))
                    }
                    className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-lg bg-ink/70 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    aria-label="Supprimer la photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-xl bg-faso-red-soft/40 px-4 py-3 text-sm font-medium text-faso-red-dark">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={!valid || status === "saving"}
          className="w-full sm:w-auto"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement…
            </>
          ) : (
            "Continuer vers l'abonnement"
          )}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          Votre boutique sera visible après validation du paiement.
        </p>
      </div>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-clay-200 bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-faso-gold";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-faso-red">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}
