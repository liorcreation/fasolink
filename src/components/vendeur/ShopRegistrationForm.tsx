"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  ArrowRight,
  Check,
  CircleCheck,
  ImagePlus,
  LockKeyhole,
  Loader2,
  MapPin,
  Phone,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import type { ShopCategory, ShopSubcategory } from "@/lib/database.types";
import { BURKINA_CITIES, CATEGORY_MAP, ELECTRONICS_SUBCATEGORIES } from "@/lib/constants";
import { cn, isValidBurkinaPhone } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createShopWithAssets, VendorError } from "@/lib/vendor";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

interface FormState {
  name: string;
  category: ShopCategory | "";
  subcategory: ShopSubcategory | "";
  city: string;
  neighborhood: string;
  whatsapp: string;
  description: string;
}

const initial: FormState = {
  name: "",
  category: "electronique",
  subcategory: "",
  city: "",
  neighborhood: "",
  whatsapp: "",
  description: "",
};

const MAX_GALLERY = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isAllowedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size < MAX_IMAGE_BYTES;
}

export function ShopRegistrationForm() {
  const router = useRouter();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const reduceMotion = useReducedMotion();
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

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [galleryPreviews, logoPreview]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid =
    form.name.trim().length > 1 &&
    form.category !== "" &&
    (form.category !== "electronique" || form.subcategory !== "") &&
    form.city !== "" &&
    isValidBurkinaPhone(form.whatsapp) &&
    form.description.trim().length > 20;
  const category = CATEGORY_MAP[form.category || "electronique"];
  const completedFields = [
    form.name.trim().length > 1,
    Boolean(form.category) && (form.category !== "electronique" || Boolean(form.subcategory)),
    Boolean(form.city),
    isValidBurkinaPhone(form.whatsapp),
    form.description.trim().length > 20,
  ].filter(Boolean).length;
  const completion = Math.round((completedFields / 5) * 100);

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
            subcategory: form.category === "electronique" ? form.subcategory as ShopSubcategory : null,
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
    const selected = Array.from(list);
    const invalid = selected.filter((file) => !isAllowedImage(file));
    const validFiles = selected.filter(isAllowedImage);
    const availableSlots = MAX_GALLERY - gallery.length;
    const accepted = validFiles.slice(0, availableSlots);
    setGallery((prev) => [...prev, ...accepted]);
    if (invalid.length) {
      setError("Choisissez des images JPG, PNG ou WebP de moins de 5 Mo chacune.");
    } else if (validFiles.length > availableSlots) {
      setError(`La galerie est limitée à ${MAX_GALLERY} photos. ${accepted.length} ajoutée${accepted.length > 1 ? "s" : ""}.`);
    } else {
      setError(null);
    }
  }

  function onLogoPick(file: File | null) {
    if (file && !isAllowedImage(file)) {
      setError("Le logo doit être une image JPG, PNG ou WebP de moins de 5 Mo.");
      return;
    }
    setError(null);
    setLogo(file);
  }

  if (authLoading) {
    return (
      <div className="card-premium mx-auto flex min-h-48 max-w-xl items-center justify-center gap-3 rounded-[1.75rem] p-8 text-sm text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin text-faso-red" />
        Vérification de votre session sécurisée…
      </div>
    );
  }

  if (!isConfigured || !user || user.isAnonymous) {
    const returnTo = encodeURIComponent("/vendeur/inscription");
    return (
      <section className="card-premium relative isolate mx-auto max-w-2xl overflow-hidden rounded-[2rem] p-6 text-center shadow-premium sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-faso-gold/10 blur-3xl" />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-faso-gold-soft/40 text-faso-gold-dark">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.2em] text-faso-red">Création de boutique sécurisée</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          {!isConfigured ? "Connexion momentanément indisponible" : "Connectez-vous pour continuer"}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-muted">
          {!isConfigured
            ? "La création d’une boutique exige un compte FasoLink vérifié. Réessayez lorsque l’authentification sera disponible."
            : "Chaque boutique doit être rattachée à un compte personnel afin que son propriétaire puisse la gérer et la retrouver."}
        </p>
        {isConfigured && (
          <>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href={`/connexion?returnTo=${returnTo}`} size="lg" className="w-full sm:w-auto">Me connecter</ButtonLink>
              <ButtonLink href={`/inscription?returnTo=${returnTo}`} variant="outline" size="lg" className="w-full sm:w-auto">Créer un compte</ButtonLink>
            </div>
            <p className="mt-4 text-[11px] text-ink-muted">Après connexion, revenez ici pour terminer la création de votre boutique.</p>
          </>
        )}
      </section>
    );
  }

  if (status === "done") {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-7">
      <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-last lg:col-start-2 lg:row-start-1">
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#17120E] p-5 text-white shadow-premium-lg sm:p-6">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0,rgba(220,166,55,.24),transparent_44%)]" />
          <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F3D88E]"><Building2 className="h-3.5 w-3.5" /> Votre progression</span><span className="text-xs font-black text-white">{completion}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Progression du formulaire" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}><motion.div initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: completion / 100 }} transition={{ duration: reduceMotion ? 0 : .45, ease: "easeOut" }} className="h-full origin-left rounded-full bg-faso-gold" /></div>
          <div className="mt-5 flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/10 text-faso-gold">{logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- Local object URL preview.
            <img src={logoPreview} alt="" className="h-full w-full object-cover" />
          ) : <Building2 className="h-4 w-4" />}</span><span className="min-w-0"><span className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-white/45">Aperçu de la vitrine</span><span className="mt-0.5 block truncate text-sm font-extrabold text-white">{form.name.trim() || "Nom de votre boutique"}</span></span></div>
          <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1 text-[10px] font-bold text-white/75">{category?.label ?? "Catégorie"}</span>{form.subcategory && <span className="rounded-full border border-faso-gold/30 bg-faso-gold/10 px-2.5 py-1 text-[10px] font-bold text-[#F3D88E]">{ELECTRONICS_SUBCATEGORIES.find((item) => item.id === form.subcategory)?.label}</span>}<span className="rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1 text-[10px] font-bold text-white/75">{form.city || "Votre ville"}</span></div>
          <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-xs leading-5 text-white/55">{form.description.trim() || "Votre description donnera aux clients un premier aperçu de votre activité et de votre savoir-faire."}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/65"><Phone className="h-3.5 w-3.5" /></span><span className="truncate text-[11px] font-semibold text-white/75">{form.whatsapp || "Votre contact WhatsApp"}</span></div>
        </section>
        <section className="rounded-[1.5rem] border border-clay-200/80 bg-white p-5 shadow-[0_7px_25px_rgba(51,37,23,.04)]">
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">Votre parcours</p>
          <div className="mt-4 space-y-4"><StepLine number="01" title="Créer la vitrine" detail="Informations & identité" active /><StepLine number="02" title="Choisir un abonnement" detail="Activation de la boutique" /></div>
          <p className="mt-4 rounded-xl bg-faso-green-soft/25 px-3 py-2.5 text-[10px] leading-4 text-faso-green-dark">Vous pourrez compléter les photos de votre boutique après cette étape.</p>
        </section>
      </aside>
      <div className="order-2 space-y-5 lg:col-start-1 lg:row-start-1">
      {/* Identité */}
      <fieldset className="card-premium space-y-5 rounded-[1.75rem] p-5 sm:p-7">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <Building2 className="h-4 w-4 text-faso-red" />
          Identité de la boutique
        </legend>

        <Field label="Nom de la boutique" required controlId="shop-name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex. Faso Mobile, Ouaga Digital…"
            maxLength={100}
            autoComplete="organization"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Univers de la boutique">
          <div className="flex items-center gap-3 rounded-2xl border border-faso-green/15 bg-faso-green-soft/20 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-faso-green-dark shadow-sm"><Smartphone className="h-5 w-5" /></span>
            <span><span className="block text-sm font-extrabold text-ink">Produits électroniques</span><span className="mt-0.5 block text-xs leading-5 text-ink-muted">Choisissez maintenant la spécialité principale de votre boutique.</span></span>
          </div>
        </Field>

        {form.category === "electronique" && (
          <Field label="Votre spécialité tech" required hint="Choisissez le domaine principal de votre boutique. Vous pourrez toujours proposer plusieurs types de produits." groupId="shop-subcategory">
            <div id="shop-subcategory" role="group" aria-labelledby="shop-subcategory-label" aria-describedby="shop-subcategory-hint" className="grid gap-2 sm:grid-cols-2">
              {ELECTRONICS_SUBCATEGORIES.map((item, index) => {
                const selected = form.subcategory === item.id;
                return (
                  <motion.button
                    type="button"
                    key={item.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.025 }}
                    aria-pressed={selected}
                    onClick={() => update("subcategory", item.id)}
                    className={cn(
                      "group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold",
                      selected
                        ? "border-faso-gold bg-faso-gold-soft/25 shadow-[0_8px_24px_rgba(244,169,60,.14)]"
                        : "border-clay-200/80 bg-white hover:-translate-y-0.5 hover:border-faso-gold/70 hover:shadow-sm",
                    )}
                  >
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black transition-colors", selected ? "bg-faso-gradient text-white" : "bg-clay-100 text-ink-soft group-hover:bg-faso-gold-soft/50")}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-ink-muted">{item.description}</span>
                    </span>
                    {selected && <CircleCheck className="h-5 w-5 shrink-0 text-faso-green" />}
                  </motion.button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Description" required hint={`${form.description.trim().length}/3 000 caractères · minimum 21`} controlId="shop-description">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            maxLength={3000}
            placeholder="Marques et catégories proposées, état des appareils, garanties annoncées, livraison et service après-vente…"
            className={cn(inputCls, "resize-none")}
            required
          />
        </Field>
      </fieldset>

      {/* Localisation & contact */}
      <fieldset className="card-premium space-y-5 rounded-[1.75rem] p-5 sm:p-7">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <MapPin className="h-4 w-4 text-faso-green" />
          Localisation & contact
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ville" required controlId="shop-city">
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

          <Field label="Quartier / secteur" controlId="shop-neighborhood">
            <input
              type="text"
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Ex. Ouaga 2000, Secteur 15"
              maxLength={100}
              autoComplete="address-level3"
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label="Numéro WhatsApp Business"
          required
          hint="Format local (70 00 00 00) ou international (+226…)"
          controlId="shop-whatsapp"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-clay-200 bg-white px-4 transition-all focus-within:border-faso-gold focus-within:shadow-[0_0_0_4px_rgba(244,169,60,0.14)]">
            <Phone className="h-4 w-4 text-ink-muted" />
            <input
              type="tel"
              id="shop-whatsapp"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="70 12 34 56"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.whatsapp && !isValidBurkinaPhone(form.whatsapp))}
              aria-describedby={form.whatsapp && !isValidBurkinaPhone(form.whatsapp) ? "shop-whatsapp-error" : "shop-whatsapp-hint"}
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
              required
            />
          </div>
          {form.whatsapp && !isValidBurkinaPhone(form.whatsapp) && <span id="shop-whatsapp-error" className="mt-1 block text-xs font-medium text-faso-red-dark">Numéro invalide : 8 chiffres burkinabè attendus, par exemple 05 88 27 68 ou +226 70 00 00 00.</span>}
        </Field>
      </fieldset>

      {/* Médias */}
      <fieldset className="card-premium space-y-5 rounded-[1.75rem] p-5 sm:p-7">
        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-ink">
          <ImagePlus className="h-4 w-4 text-faso-gold-dark" />
          Logo & photos
        </legend>

        <div className="flex flex-col gap-4 rounded-2xl border border-clay-200/75 bg-[#FCFAF6] p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-dashed border-clay-300 bg-white shadow-sm">
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
          <div className="min-w-0">
            <input
              ref={logoInput}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              aria-label="Choisir le logo de la boutique"
              className="hidden"
              onChange={(e) => { onLogoPick(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-describedby="shop-image-help"
              onClick={() => logoInput.current?.click()}
            >
              {logo ? "Changer le logo" : "Ajouter le logo"}
            </Button>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="ml-2 inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-faso-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red"
              >
                Retirer
              </button>
            )}
            <p id="shop-image-help" className="mt-2 text-[10px] leading-4 text-ink-muted">Carré de préférence · JPG, PNG ou WebP · moins de 5 Mo</p>
            {logo && <p className="mt-1 max-w-xs truncate text-[10px] font-semibold text-faso-green-dark">{logo.name}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-bold text-ink">
              Photos de la boutique{" "}
              <span className="text-ink-muted">
                ({gallery.length}/{MAX_GALLERY})
              </span>
            </p><p id="shop-gallery-help" className="mt-1 text-[10px] text-ink-muted">JPG, PNG ou WebP · moins de 5 Mo chacune · jusqu’à {MAX_GALLERY} photos.</p></div>
            <input
              ref={galleryInput}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              aria-label="Choisir les photos de la boutique"
              className="hidden"
              onChange={(e) => { onGalleryPick(e.target.files); e.currentTarget.value = ""; }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-describedby="shop-gallery-help"
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
                    className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-lg bg-ink/75 text-white opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 motion-reduce:transition-none"
                    aria-label={`Supprimer la photo ${i + 1}${p.name ? ` (${p.name})` : ""}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryPreviews.length === 0 && <div className="mt-3 flex min-h-20 items-center justify-center gap-2 rounded-2xl border border-dashed border-clay-300 bg-[#FCFAF6] px-4 py-5 text-center text-[11px] font-medium text-ink-muted"><ImagePlus className="h-4 w-4 text-faso-gold-dark" />Vos photos apparaîtront ici après sélection.</div>}
        </div>
      </fieldset>
      </div>
      </div>

      {error && (
          <p id="shop-form-error" role="alert" aria-live="assertive" className="rounded-xl border border-faso-red/20 bg-faso-red-soft/40 px-4 py-3 text-sm font-medium text-faso-red-dark">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border border-clay-200/70 bg-white/80 p-5 shadow-sm sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-[10px] leading-5 text-ink-muted sm:text-left"><strong className="text-ink-soft">{completedFields}/5 informations essentielles</strong><br />L’abonnement se choisit à l’étape suivante.</p>
        <Button
          type="submit"
          size="lg"
          disabled={!valid || status === "saving"}
          className="w-full sm:w-auto"
          aria-busy={status === "saving"}
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>Continuer vers l’abonnement <ArrowRight className="h-4 w-4" /></>
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
  "input-premium";

function Field({
  label,
  required,
  hint,
  controlId,
  groupId,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  controlId?: string;
  groupId?: string;
  children: React.ReactNode;
}) {
  const hintId = (controlId || groupId) && hint ? `${controlId || groupId}-hint` : undefined;
  return (
    <div className="block">
      {controlId ? (
        <label htmlFor={controlId} className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
          {label}{required && <span className="text-faso-red" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (obligatoire)</span>}
        </label>
      ) : (
        <span id={groupId ? `${groupId}-label` : undefined} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}{required && <span className="text-faso-red" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (obligatoire)</span>}
        </span>
      )}
      {children}
      {hint && <span id={hintId ?? (groupId ? `${groupId}-hint` : undefined)} className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </div>
  );
}

function StepLine({ number, title, detail, active = false }: { number: string; title: string; detail: string; active?: boolean }) {
  return <div className="flex items-start gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black ${active ? "bg-faso-red text-white" : "bg-clay-100 text-ink-muted"}`}>{active ? <CircleCheck className="h-4 w-4" /> : number}</span><span><span className={`block text-xs font-extrabold ${active ? "text-ink" : "text-ink-muted"}`}>{title}</span><span className="mt-0.5 block text-[10px] text-ink-muted">{detail}</span></span></div>;
}
