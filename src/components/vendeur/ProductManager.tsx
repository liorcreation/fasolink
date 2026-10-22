"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, CircleDollarSign, Download, Edit3, Loader2, Package, PackagePlus, Search, Trash2, X } from "lucide-react";
import type { Product, ProductAvailability, ProductCondition, ProductSpecifications } from "@/lib/database.types";
import {
  createProduct,
  deleteProduct,
  uploadProductImage,
  updateProduct,
  type ProductDraft,
} from "@/lib/vendor";
import { formatCFA } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductImagePicker, type PexelsProductPhoto } from "@/components/vendeur/ProductImagePicker";

const AVAILABILITY: { id: ProductAvailability; label: string }[] = [
  { id: "in_stock", label: "En stock" },
  { id: "on_order", label: "Sur commande" },
  { id: "out_of_stock", label: "Rupture" },
];

const CONDITIONS: { id: ProductCondition | ""; label: string }[] = [
  { id: "", label: "Non précisé" },
  { id: "new", label: "Neuf" },
  { id: "used", label: "Occasion" },
  { id: "refurbished", label: "Reconditionné" },
];

const EMPTY_SPECS: ProductSpecifications = {
  brand: "", model: "", condition: null, ram: "", storage: "", warranty: "",
};

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  availability: "in_stock",
  specifications: EMPTY_SPECS,
  image_url: null,
  image_credit: null,
  image_source_url: null,
  image_license: null,
  image_license_url: null,
};

export function ProductManager({
  shopId,
  initialProducts,
  demo = false,
  onProductsChange,
}: {
  shopId: string;
  initialProducts: Product[];
  demo?: boolean;
  onProductsChange?: (products: Product[]) => void;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [availabilityBusyId, setAvailabilityBusyId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<ProductAvailability | "all">("all");
  const [productSort, setProductSort] = useState<"updated" | "name" | "price-asc" | "price-desc">("updated");

  const visibleProducts = useMemo(() => {
    const query = productQuery.trim().toLocaleLowerCase("fr");
    const filtered = products.filter((product) => {
      const searchable = `${product.name} ${product.description ?? ""} ${product.specifications?.brand ?? ""} ${product.specifications?.model ?? ""}`.toLocaleLowerCase("fr");
      return (!query || searchable.includes(query)) && (productStatusFilter === "all" || product.availability === productStatusFilter);
    });
    if (productSort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (productSort === "price-asc") return filtered.sort((a, b) => a.price - b.price);
    if (productSort === "price-desc") return filtered.sort((a, b) => b.price - a.price);
    return filtered.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [productQuery, productSort, productStatusFilter, products]);

  const productListFiltered = Boolean(productQuery.trim()) || productStatusFilter !== "all" || productSort !== "updated";

  function resetProductFilters() {
    setProductQuery("");
    setProductStatusFilter("all");
    setProductSort("updated");
  }

  function exportCatalog() {
    if (products.length === 0) return;
    const rows = [
      ["Produit", "Prix (FCFA)", "Disponibilite", "Marque", "Modele", "Etat", "RAM", "Stockage", "Garantie declaree", "Description", "Image"],
      ...products.map((product) => [
        product.name,
        String(product.price),
        AVAILABILITY.find((item) => item.id === product.availability)?.label ?? product.availability,
        product.specifications?.brand ?? "",
        product.specifications?.model ?? "",
        CONDITIONS.find((item) => item.id === product.specifications?.condition)?.label ?? "",
        product.specifications?.ram ?? "",
        product.specifications?.storage ?? "",
        product.specifications?.warranty ?? "",
        product.description ?? "",
        product.image_url ?? "",
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `fasolink-catalogue-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    setExportNotice("Votre fichier catalogue a été téléchargé.");
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setImageFile(null);
    setEditingId(null);
    setError(null);
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setImageFile(null);
    setDraft({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      availability: product.availability,
      specifications: { ...EMPTY_SPECS, ...product.specifications },
      image_url: product.image_url,
      image_credit: product.image_credit ?? null,
      image_source_url: product.image_source_url ?? null,
      image_license: product.image_license ?? null,
      image_license_url: product.image_license_url ?? null,
    });
    setError(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || draft.price < 0 || busy || availabilityBusyId) return;
    setBusy(true);
    setError(null);
    try {
      const submittedDraft: ProductDraft = imageFile
        ? {
            ...draft,
            image_url: demo ? null : await uploadProductImage(shopId, imageFile),
            image_credit: null,
            image_source_url: null,
            image_license: null,
            image_license_url: null,
          }
        : draft;
      if (editingId) {
        if (!demo) await updateProduct(editingId, submittedDraft);
        const nextProducts = products.map((product) =>
          product.id === editingId
            ? { ...product, ...submittedDraft, name: submittedDraft.name.trim(), description: submittedDraft.description.trim() || null, updated_at: new Date().toISOString() }
            : product,
        );
        setProducts(nextProducts);
        onProductsChange?.(nextProducts);
      } else if (demo) {
        const now = new Date().toISOString();
        const nextProducts = [
          ...products,
          {
            id: `demo-${Date.now()}`,
            shop_id: shopId,
            name: submittedDraft.name.trim(),
            description: submittedDraft.description.trim() || null,
            price: Number(submittedDraft.price),
            currency: "FCFA",
            image_url: submittedDraft.image_url ?? null,
            image_credit: submittedDraft.image_credit ?? null,
            image_source_url: submittedDraft.image_source_url ?? null,
            image_license: submittedDraft.image_license ?? null,
            image_license_url: submittedDraft.image_license_url ?? null,
            availability: submittedDraft.availability,
            specifications: submittedDraft.specifications,
            created_at: now,
            updated_at: now,
          },
        ];
        setProducts(nextProducts);
        onProductsChange?.(nextProducts);
      } else {
        const created = await createProduct(shopId, submittedDraft);
        const nextProducts = [...products, created];
        setProducts(nextProducts);
        onProductsChange?.(nextProducts);
      }
      reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer le produit.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(product: Product) {
    if (busy || availabilityBusyId || !window.confirm(`Supprimer « ${product.name} » ?`)) return;
    setBusy(true);
    setError(null);
    try {
      if (!demo) await deleteProduct(product.id);
      const nextProducts = products.filter((item) => item.id !== product.id);
      setProducts(nextProducts);
      onProductsChange?.(nextProducts);
      if (editingId === product.id) reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de supprimer le produit.");
    } finally {
      setBusy(false);
    }
  }

  async function changeAvailability(product: Product, availability: ProductAvailability) {
    if (product.availability === availability || busy || availabilityBusyId) return;
    const updatedProduct = { ...product, availability, updated_at: new Date().toISOString() };
    const previousProducts = products;
    const nextProducts = products.map((item) => item.id === product.id ? updatedProduct : item);
    setAvailabilityBusyId(product.id);
    setStockError(null);
    setProducts(nextProducts);
    onProductsChange?.(nextProducts);
    if (editingId === product.id) setDraft((current) => ({ ...current, availability }));
    try {
      if (!demo) await updateProduct(product.id, productToDraft(updatedProduct));
    } catch (cause) {
      setProducts(previousProducts);
      onProductsChange?.(previousProducts);
      if (editingId === product.id) setDraft((current) => ({ ...current, availability: product.availability }));
      setStockError(cause instanceof Error ? cause.message : "Le stock n’a pas pu être mis à jour. Réessayez.");
    } finally {
      setAvailabilityBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-clay-200/80 bg-white shadow-[0_12px_38px_rgba(51,37,23,.055)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-clay-100 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-faso-red-soft/35 text-faso-red"><Package className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Votre boutique tech</p><h3 className="mt-0.5 text-lg font-black tracking-tight text-ink">Catalogue électronique</h3><p className="mt-0.5 text-xs text-ink-muted">Indiquez les caractéristiques utiles et la disponibilité réelle de chaque appareil.</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-faso-green/10 bg-faso-green-soft/35 px-3 py-1.5 text-[11px] font-extrabold text-faso-green-dark"><Package className="h-3.5 w-3.5" />{products.length} produit{products.length === 1 ? "" : "s"}</span>
          <button type="button" onClick={exportCatalog} disabled={products.length === 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-clay-200 bg-white px-3 text-xs font-extrabold text-ink-soft transition hover:border-faso-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"><Download className="h-4 w-4" />Exporter CSV</button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{exportNotice ?? ""}</p>

      <div className="p-5 sm:p-7">
        {products.length === 0 && (
          <div className="mb-5 grid justify-items-center rounded-2xl border border-dashed border-clay-200 bg-clay-50/70 px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-faso-gold-dark shadow-sm"><PackagePlus className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-ink">Votre catalogue prend vie ici</p><p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">Publiez un téléphone, un ordinateur ou un accessoire avec ses informations exactes.</p></div>
        )}
        {products.length > 0 && <>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="relative flex min-h-11 min-w-0 items-center rounded-xl border border-clay-200 bg-white px-3 focus-within:border-faso-gold focus-within:ring-2 focus-within:ring-faso-gold/15 sm:col-span-2 lg:col-span-1">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <span className="sr-only">Rechercher dans mes produits</span>
            <input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Rechercher un produit…" className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-ink outline-none placeholder:text-ink-muted/70" />
            {productQuery && <button type="button" onClick={() => setProductQuery("")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-clay-50" aria-label="Effacer la recherche produit"><X className="h-3.5 w-3.5" /></button>}
          </label>
          <label className="sr-only" htmlFor="seller-product-status">Filtrer mes produits par disponibilité</label>
          <select id="seller-product-status" value={productStatusFilter} onChange={(event) => setProductStatusFilter(event.target.value as ProductAvailability | "all")} className="min-h-11 min-w-0 rounded-xl border border-clay-200 bg-white px-3 text-xs font-bold text-ink outline-none focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15">
            <option value="all">Toutes disponibilités</option>
            {AVAILABILITY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="seller-product-sort">Trier mes produits</label>
          <select id="seller-product-sort" value={productSort} onChange={(event) => setProductSort(event.target.value as typeof productSort)} className="min-h-11 min-w-0 rounded-xl border border-clay-200 bg-white px-3 text-xs font-bold text-ink outline-none focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15">
            <option value="updated">Dernière mise à jour</option>
            <option value="name">Nom du produit</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
        <p className="mb-3 text-[11px] font-semibold text-ink-muted" aria-live="polite">{visibleProducts.length} sur {products.length} produit{products.length === 1 ? "" : "s"}</p>
        {visibleProducts.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">
        {visibleProducts.map((product) => {
          const tone = product.availability === "in_stock" ? "bg-faso-green-soft/40 text-faso-green-dark" : product.availability === "on_order" ? "bg-faso-gold-soft/45 text-faso-gold-dark" : "bg-clay-100 text-ink-muted";
          return <article key={product.id} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-clay-200/75 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-faso-gold/40 hover:shadow-[0_10px_24px_rgba(51,37,23,.06)] sm:p-3.5">
            <span className="relative grid h-[4.25rem] w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-xl bg-clay-50 text-clay-300">{product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="68px" className="object-cover" /> : <Package className="h-6 w-6" />}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-ink">{product.name}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-faso-green-dark"><CircleDollarSign className="h-3.5 w-3.5" />{formatCFA(product.price)}</p><select value={product.availability} disabled={busy || availabilityBusyId !== null} onChange={(event) => void changeAvailability(product, event.target.value as ProductAvailability)} aria-label={`Modifier la disponibilité de ${product.name}`} className={`mt-1.5 min-h-7 max-w-full rounded-full px-2 py-1 text-[9px] font-extrabold outline-none ring-1 ring-inset ring-transparent transition focus:ring-faso-gold ${tone} disabled:cursor-wait disabled:opacity-60`}>{AVAILABILITY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" disabled={busy || availabilityBusyId !== null} onClick={() => edit(product)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-clay-100 hover:text-ink disabled:opacity-40" aria-label={`Modifier ${product.name}`} title="Modifier">
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" disabled={busy || availabilityBusyId !== null} onClick={() => void remove(product)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-faso-red-soft/40 hover:text-faso-red-dark disabled:opacity-40" aria-label={`Supprimer ${product.name}`} title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>;
        })}
        </div> : <div className="grid justify-items-center rounded-2xl border border-dashed border-clay-200 bg-clay-50/70 px-5 py-8 text-center"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-muted"><Search className="h-4 w-4" /></span><p className="mt-3 text-sm font-bold text-ink">Aucun produit correspondant</p><p className="mt-1 text-xs text-ink-muted">Essayez un autre terme ou un autre filtre.</p>{productListFiltered && <button type="button" onClick={resetProductFilters} className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-white">Réinitialiser</button>}</div>}
        </>}
        {stockError && <p className="mt-3 rounded-xl bg-faso-red-soft/40 px-3 py-2 text-xs text-faso-red-dark" role="alert">{stockError}</p>}
      </div>

      <form onSubmit={save} className="mx-5 mb-5 rounded-[1.5rem] border border-clay-200/80 bg-[#FCFAF6] p-4 sm:mx-7 sm:mb-7 sm:p-5">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-faso-gold-soft/45 text-faso-gold-dark"><PackagePlus className="h-4 w-4" /></span>
          <p className="text-sm font-extrabold text-ink">{editingId ? "Modifier le produit" : "Ajouter un appareil"}</p></div>
          {editingId && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-ink-muted transition hover:bg-clay-100 hover:text-ink">
              <X className="h-3.5 w-3.5" /> Annuler
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[11px] font-bold text-ink-soft">Nom / modèle<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Ex. Samsung Galaxy A55 5G" className="input-premium mt-1.5" required /></label>
          <label className="text-[11px] font-bold text-ink-soft">Prix (FCFA)<input type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Ex. 12 500" className="input-premium mt-1.5" required /></label>
          <label className="text-[11px] font-bold text-ink-soft sm:col-span-2">Disponibilité<select value={draft.availability} onChange={(event) => setDraft((current) => ({ ...current, availability: event.target.value as ProductAvailability }))} className="input-premium mt-1.5">
            {AVAILABILITY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select></label>
          <div className="grid gap-3 rounded-2xl border border-clay-200/70 bg-white p-3 sm:col-span-2 sm:grid-cols-2 sm:p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-faso-red sm:col-span-2">Fiche technique <span className="font-semibold normal-case tracking-normal text-ink-muted">— champs facultatifs, déclarés par le vendeur</span></p>
            <label className="text-[11px] font-bold text-ink-soft">Marque<input maxLength={60} value={draft.specifications.brand ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, brand: event.target.value } }))} placeholder="Ex. Samsung" className="input-premium mt-1.5" /></label>
            <label className="text-[11px] font-bold text-ink-soft">Modèle / référence<input maxLength={80} value={draft.specifications.model ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, model: event.target.value } }))} placeholder="Ex. Galaxy A55 5G" className="input-premium mt-1.5" /></label>
            <label className="text-[11px] font-bold text-ink-soft">État<select value={draft.specifications.condition ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, condition: (event.target.value || null) as ProductCondition | null } }))} className="input-premium mt-1.5">{CONDITIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="text-[11px] font-bold text-ink-soft">Mémoire vive / RAM<input maxLength={40} value={draft.specifications.ram ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, ram: event.target.value } }))} placeholder="Ex. 8 Go" className="input-premium mt-1.5" /></label>
            <label className="text-[11px] font-bold text-ink-soft">Stockage<input maxLength={40} value={draft.specifications.storage ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, storage: event.target.value } }))} placeholder="Ex. 256 Go" className="input-premium mt-1.5" /></label>
            <label className="text-[11px] font-bold text-ink-soft">Garantie annoncée<input maxLength={100} value={draft.specifications.warranty ?? ""} onChange={(event) => setDraft((current) => ({ ...current, specifications: { ...current.specifications, warranty: event.target.value } }))} placeholder="Ex. 3 mois" className="input-premium mt-1.5" /></label>
          </div>
          <label className="text-[11px] font-bold text-ink-soft sm:col-span-2">Description et autres détails <span className="font-medium text-ink-muted">(facultatif)</span><textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Couleur, accessoires inclus, facture disponible, état esthétique, conditions particulières…" rows={3} className="input-premium mt-1.5 h-auto py-3 sm:col-span-2" /></label>
          <ProductImagePicker
            query={draft.name}
            imageUrl={draft.image_url ?? null}
            imageCredit={draft.image_credit}
            imageSourceUrl={draft.image_source_url}
            imageLicense={draft.image_license}
            imageLicenseUrl={draft.image_license_url}
            file={imageFile}
            onFileChange={(file) => {
              setImageFile(file);
              setDraft((current) => ({ ...current, image_url: null, image_credit: null, image_source_url: null, image_license: null, image_license_url: null }));
            }}
            onPhotoSelect={(photo: PexelsProductPhoto) => {
              setImageFile(null);
              setDraft((current) => ({ ...current, ...photo }));
            }}
            onClear={() => {
              setImageFile(null);
              setDraft((current) => ({ ...current, image_url: null, image_credit: null, image_source_url: null, image_license: null, image_license_url: null }));
            }}
          />
        </div>
        {error && <p className="mt-3 rounded-xl bg-faso-red-soft/40 px-3 py-2 text-xs text-faso-red-dark">{error}</p>}
        <Button type="submit" className="mt-4" disabled={busy || availabilityBusyId !== null || !draft.name.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editingId ? "Enregistrer les modifications" : "Ajouter au catalogue"}
        </Button>
      </form>
    </section>
  );
}

function csvCell(value: string) {
  const safeValue = /^[\u0000-\u0020]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function productToDraft(product: Product): ProductDraft {
  return {
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    availability: product.availability,
    specifications: { ...EMPTY_SPECS, ...product.specifications },
    image_url: product.image_url,
    image_credit: product.image_credit ?? null,
    image_source_url: product.image_source_url ?? null,
    image_license: product.image_license ?? null,
    image_license_url: product.image_license_url ?? null,
  };
}
