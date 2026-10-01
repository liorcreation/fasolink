"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, Loader2, Search, Upload, X } from "lucide-react";

export type PexelsProductPhoto = {
  id: string;
  image_url: string;
  image_credit: string;
  image_source_url: string;
  image_license: string;
  image_license_url: string;
  photographer_url: string | null;
  alt: string;
};

type Props = {
  query: string;
  imageUrl: string | null;
  imageCredit?: string | null;
  imageSourceUrl?: string | null;
  imageLicense?: string | null;
  imageLicenseUrl?: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onPhotoSelect: (photo: PexelsProductPhoto) => void;
  onClear: () => void;
};

export function ProductImagePicker({
  query,
  imageUrl,
  imageCredit,
  imageSourceUrl,
  imageLicense,
  imageLicenseUrl,
  file,
  onFileChange,
  onPhotoSelect,
  onClear,
}: Props) {
  const [searchTerm, setSearchTerm] = useState(query.trim());
  const [photos, setPhotos] = useState<PexelsProductPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const normalizedQuery = useMemo(() => searchTerm.trim(), [searchTerm]);

  useEffect(() => setSearchTerm(query.trim()), [query]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (normalizedQuery.length < 3) {
      setPhotos([]);
      setLoading(false);
      setSearchMessage("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchMessage("");

      try {
        const params = new URLSearchParams({ query: normalizedQuery });
        const response = await fetch(`/api/images/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const payload = await response.json() as { photos?: PexelsProductPhoto[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "La recherche de photos est momentanément indisponible.");
        const matches = payload.photos ?? [];
        setPhotos(matches.slice(0, 8));
        if (matches.length === 0) setSearchMessage("Aucune photo Pexels trouvée. Essaie un terme plus précis ou importe ta propre photo.");
      } catch (error) {
        if (controller.signal.aborted) return;
        setPhotos([]);
        setSearchMessage(error instanceof Error ? error.message : "La recherche de photos a échoué.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 650);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  function handleFile(fileToCheck: File | undefined) {
    setFileError("");
    if (!fileToCheck) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(fileToCheck.type)) {
      setFileError("Choisis une image JPG, PNG ou WebP.");
      return;
    }
    if (fileToCheck.size >= 5 * 1024 * 1024) {
      setFileError("L’image doit faire moins de 5 Mo.");
      return;
    }
    onFileChange(fileToCheck);
  }

  const displayedImage = previewUrl || imageUrl;

  return (
    <div className="sm:col-span-2 rounded-2xl border border-clay-200/80 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold text-ink">Photo du produit <span className="font-medium text-ink-muted">(facultatif)</span></p>
          <p className="mt-1 max-w-xl text-[10px] leading-4 text-ink-muted">Recherche des photos réelles sur Pexels à partir du nom saisi. Vérifie que l’image correspond bien à l’article vendu, ou importe ta propre photo.</p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-clay-200 bg-[#FCFAF6] px-4 text-xs font-bold text-ink transition hover:border-faso-gold hover:bg-faso-gold-soft/20">
          <Upload className="h-4 w-4 text-faso-gold-dark" />Importer une photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <label className="mt-3 block text-[10px] font-bold text-ink-muted">Recherche automatique — modifiable pour affiner les résultats
        <span className="relative mt-1 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Ex. sac à dos, backpack…" className="input-premium h-10 pl-9 text-xs" aria-label="Termes de recherche des photos" />
        </span>
      </label>

      {displayedImage && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-clay-50 p-2.5">
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image src={displayedImage} alt="Aperçu de la photo du produit" fill unoptimized sizes="64px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">{file ? "Ta photo" : imageCredit ? "Photo libre sélectionnée" : "Photo actuelle"}</p>
            {imageCredit && !file && <p className="mt-1 truncate text-[10px] text-ink-muted">Crédit : {imageCredit}</p>}
            {imageLicense && !file && <p className="mt-0.5 text-[10px] text-ink-muted">Licence : {imageLicenseUrl ? <a href={imageLicenseUrl} target="_blank" rel="noreferrer" className="underline">{imageLicense}</a> : imageLicense}{imageSourceUrl && <> · <a href={imageSourceUrl} target="_blank" rel="noreferrer" className="underline">Source</a></>}</p>}
            <p className="mt-1 text-[10px] font-semibold text-faso-gold-dark">Photo illustrative : vérifie qu’elle représente bien ton article.</p>
          </div>
          <button type="button" onClick={onClear} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-faso-red-soft/40 hover:text-faso-red" aria-label="Retirer la photo">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {normalizedQuery.length < 3 ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-clay-50/70 px-3 py-2.5 text-[10px] text-ink-muted">
          <Search className="h-3.5 w-3.5 shrink-0" />Saisis au moins 3 caractères pour rechercher automatiquement des photos réelles.
        </div>
      ) : loading ? (
        <p className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-ink-muted" aria-live="polite"><Loader2 className="h-3.5 w-3.5 animate-spin" />Recherche de photos réelles pour « {normalizedQuery} »…</p>
      ) : searchMessage ? (
        <p className="mt-3 rounded-xl bg-clay-50/70 px-3 py-2.5 text-[10px] leading-4 text-ink-muted" aria-live="polite">{searchMessage}</p>
      ) : photos.length > 0 ? (
        <>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-faso-green-dark"><ImagePlus className="h-3.5 w-3.5" />Photos réelles trouvées sur Pexels — sélectionne celle qui convient</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((photo) => {
              const selected = imageUrl === photo.image_url && !file;
              return (
                <button
                  key={photo.image_source_url}
                  type="button"
                  onClick={() => onPhotoSelect(photo)}
                  aria-pressed={selected}
                  className={`group overflow-hidden rounded-xl border text-left transition ${selected ? "border-faso-green ring-2 ring-faso-green/20" : "border-clay-200 hover:border-faso-gold"}`}
                >
                  <span className="relative block aspect-square bg-clay-50">
                    <Image src={photo.image_url} alt={photo.alt} fill unoptimized sizes="(max-width: 640px) 45vw, 160px" className="object-cover transition-transform group-hover:scale-105" />
                    {selected && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-faso-green text-white"><Check className="h-4 w-4" /></span>}
                  </span>
                  <span className="block truncate px-2 pt-1.5 text-[9px] font-bold text-ink">{photo.image_credit}</span>
                  <span className="block truncate px-2 pb-2 pt-0.5 text-[9px] text-ink-muted">{photo.image_license}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[9px] leading-4 text-ink-muted">Photos by <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">Pexels</a>. Les photos sont sélectionnées par le vendeur; le photographe et la source restent affichés sur la fiche produit.</p>
        </>
      ) : null}

      {fileError && <p className="mt-2 text-[10px] font-semibold text-faso-red-dark" role="alert">{fileError}</p>}
    </div>
  );
}
