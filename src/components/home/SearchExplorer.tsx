"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  LayoutGrid,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import type { ShopCategory, ShopWithProducts } from "@/lib/database.types";
import { BURKINA_CITIES, CATEGORIES, NEIGHBORHOODS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  getBrowserPosition,
  haversineKm,
  shopCoords,
  type Coords,
} from "@/lib/geo";
import { getOpenState } from "@/lib/hours";
import { ShopCard } from "@/components/shops/ShopCard";
import { ShopGridSkeleton } from "@/components/ui/Skeletons";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Reveal } from "@/components/ui/Reveal";

type GeoState = "off" | "loading" | "on" | "denied";
const RADII = [3, 5, 10, 25];

export function SearchExplorer({ shops }: { shops: ShopWithProducts[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ShopCategory | "all">("all");
  const [city, setCity] = useState<string>("all");
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [geo, setGeo] = useState<GeoState>("off");
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [originLabel, setOriginLabel] = useState("ma position");
  const [radius, setRadius] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const cityNeighborhoods = useMemo(
    () =>
      NEIGHBORHOODS.filter((n) => city === "all" || n.city === city).map(
        (n) => n.name,
      ),
    [city],
  );

  function changeCity(value: string) {
    setCity(value);
    if (
      value !== "all" &&
      neighborhood !== "all" &&
      !NEIGHBORHOODS.some((n) => n.name === neighborhood && n.city === value)
    ) {
      setNeighborhood("all");
    }
  }

  async function useMyLocation() {
    setGeo("loading");
    try {
      const pos = await getBrowserPosition();
      setOrigin(pos);
      setOriginLabel("ma position");
      setGeo("on");
    } catch {
      setGeo("denied");
    }
  }

  function pickReferenceNeighborhood(name: string) {
    if (!name) {
      setOrigin(null);
      setGeo("off");
      return;
    }
    const n = NEIGHBORHOODS.find((q) => q.name === name);
    if (n) {
      setOrigin({ lat: n.lat, lng: n.lng });
      setOriginLabel(n.name);
      setGeo("on");
    }
  }

  const activeFilters =
    (category !== "all" ? 1 : 0) +
    (city !== "all" ? 1 : 0) +
    (neighborhood !== "all" ? 1 : 0) +
    (openOnly ? 1 : 0);

  function resetFilters() {
    setCategory("all");
    setCity("all");
    setNeighborhood("all");
    setOpenOnly(false);
  }

  const hasQuery = query.trim().length > 0;

  /** Réinitialise la recherche complète (mot-clé + tous les filtres). */
  function resetAll() {
    resetFilters();
    setQuery("");
    setSheetOpen(false);
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = shops.map((s) => {
      const c = origin ? shopCoords(s) : null;
      const distanceKm = c ? haversineKm(origin!, c) : null;
      return { shop: s, distanceKm };
    });

    list = list.filter(({ shop, distanceKm }) => {
      if (category !== "all" && shop.category !== category) return false;
      if (city !== "all" && shop.city !== city) return false;
      if (neighborhood !== "all" && shop.neighborhood !== neighborhood)
        return false;
      if (openOnly && !getOpenState(shop.opening_hours).isOpen) return false;
      if (origin && radius && (distanceKm ?? Infinity) > radius) return false;
      if (!q) return true;
      const haystack = [
        shop.name,
        shop.description,
        shop.city,
        shop.neighborhood ?? "",
        ...shop.products.map((p) => p.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    if (origin) {
      list.sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    }
    return list;
  }, [shops, query, category, city, neighborhood, openOnly, origin, radius]);

  /** Nombre de produits correspondants parmi les boutiques affichées. */
  const productMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return results.reduce((total, { shop }) => {
      const matched = q
        ? shop.products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.description ?? "").toLowerCase().includes(q),
          ).length
        : shop.products.length;
      return total + matched;
    }, 0);
  }, [results, query]);

  return (
    <section id="explorer" className="container-faso-wide section-y scroll-mt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Explorer
        </span>
        <span className="accent-line mx-auto mt-2" />
        <h2 className="mt-3 font-editorial text-display-2 font-semibold text-ink">
          Trouvez une boutique près de chez vous
        </h2>
        <p className="mt-3 text-ink-muted">
          Recherche instantanée parmi les commerçants vérifiés du Burkina Faso.
        </p>
      </Reveal>

      {/* Barre de recherche + géo */}
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        <div className="card-premium flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-clay-50 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bissap, pagne tissé, climatiseur…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              aria-label="Rechercher une boutique ou un produit"
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
              geo === "on"
                ? "bg-faso-green text-white"
                : "bg-clay-50 text-ink-soft hover:bg-clay-100",
            )}
          >
            {geo === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Proche de moi
          </button>
        </div>

        {/* Ligne géo secondaire */}
        <AnimatePresence>
          {(geo === "on" || geo === "denied") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 overflow-hidden px-1 text-sm"
            >
              {geo === "denied" && (
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <MapPin className="h-4 w-4" />
                  Localisation refusée — choisissez un quartier :
                </span>
              )}
              {geo === "on" && (
                <span className="flex items-center gap-1.5 font-semibold text-faso-green-dark">
                  <MapPin className="h-4 w-4" />
                  Autour de {originLabel}
                </span>
              )}
              <select
                onChange={(e) => pickReferenceNeighborhood(e.target.value)}
                className="rounded-full border border-clay-200 bg-white px-3 py-1.5 text-xs font-medium outline-none"
                aria-label="Quartier de référence"
                defaultValue=""
              >
                <option value="">Choisir un quartier…</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={`${n.city}-${n.name}`} value={n.name}>
                    {n.name} ({n.city})
                  </option>
                ))}
              </select>
              <span className="ml-1 flex items-center gap-1.5">
                {RADII.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(radius === r ? null : r)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                      radius === r
                        ? "border-transparent bg-faso-green text-white"
                        : "border-clay-200 bg-white text-ink-soft hover:border-faso-green",
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barre de filtres : chips défilables + bouton « Filtres » (mobile) */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-clay-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft shadow-premium sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-faso-red text-[11px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </button>

        <div
          id="categories"
          className="snap-row no-scrollbar -mx-5 flex flex-1 scroll-mt-24 gap-2.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          <FilterChip
            className="snap-item"
            active={category === "all"}
            onClick={() => setCategory("all")}
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Tout"
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              className="snap-item"
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              icon={<c.icon className="h-4 w-4" />}
              label={c.label}
            />
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-clay-200 sm:block" />
          <FilterChip
            className="snap-item"
            active={openOnly}
            onClick={() => setOpenOnly((v) => !v)}
            icon={<Clock className="h-4 w-4" />}
            label="Ouvert maintenant"
            tone="green"
          />
        </div>
      </div>

      {/* Sélecteurs ville / quartier — visibles dès sm (le mobile passe par le tiroir) */}
      <div className="mt-3 hidden items-center gap-3 sm:flex">
        <LocationSelect
          label="Ville"
          value={city}
          onChange={changeCity}
          options={["all", ...BURKINA_CITIES]}
          allLabel="Toutes les villes"
        />
        <LocationSelect
          label="Quartier"
          value={neighborhood}
          onChange={setNeighborhood}
          options={["all", ...cityNeighborhoods]}
          allLabel="Tous les quartiers"
          disabled={cityNeighborhoods.length === 0}
        />
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-faso-red hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Résultats */}
      <div className="mt-6 flex items-center justify-between text-sm text-ink-muted">
        <span aria-live="polite">
          {loading ? (
            "Chargement…"
          ) : (
            <>
              <strong className="text-ink">{results.length}</strong> boutique
              {results.length > 1 ? "s" : ""}
              {productMatches > 0 && (
                <>
                  {" · "}
                  <strong className="text-ink">{productMatches}</strong> produit
                  {productMatches > 1 ? "s" : ""}
                </>
              )}
              {(hasQuery || activeFilters > 0) && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="ml-3 inline-flex items-center gap-1 text-xs font-semibold text-faso-red hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Effacer
                </button>
              )}
            </>
          )}
        </span>
        {origin && !loading && results.length > 0 && (
          <span className="text-xs">Triées par distance</span>
        )}
      </div>

      {loading ? (
        <div className="mt-6">
          <ShopGridSkeleton count={6} />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            <motion.div
              layout
              className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {results.map(({ shop, distanceKm }, i) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  index={i}
                  distanceKm={origin ? distanceKm : undefined}
                />
              ))}
            </motion.div>
          ) : (
            <NoResults query={query} onReset={resetAll} />
          )}
        </AnimatePresence>
      )}

      {/* Tiroir de filtres (mobile) */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtres"
        footer={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="btn-base h-11 flex-1 border-2 border-clay-200 bg-white text-sm text-ink"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="btn-base h-11 flex-[1.4] bg-faso-gradient text-sm text-white"
            >
              Voir {results.length} boutique{results.length > 1 ? "s" : ""}
            </button>
          </div>
        }
      >
        <div className="space-y-6 pb-4">
          <SheetGroup label="Catégorie">
            <div className="flex flex-wrap gap-2">
              <SheetChip
                active={category === "all"}
                onClick={() => setCategory("all")}
              >
                Tout
              </SheetChip>
              {CATEGORIES.map((c) => (
                <SheetChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </SheetChip>
              ))}
            </div>
          </SheetGroup>

          <SheetGroup label="Ville">
            <div className="flex flex-wrap gap-2">
              <SheetChip active={city === "all"} onClick={() => changeCity("all")}>
                Toutes
              </SheetChip>
              {BURKINA_CITIES.map((c) => (
                <SheetChip
                  key={c}
                  active={city === c}
                  onClick={() => changeCity(c)}
                >
                  {c}
                </SheetChip>
              ))}
            </div>
          </SheetGroup>

          <SheetGroup
            label="Quartier"
            hint={
              city === "all"
                ? "Tous quartiers confondus"
                : `Quartiers de ${city}`
            }
          >
            <div className="flex flex-wrap gap-2">
              <SheetChip
                active={neighborhood === "all"}
                onClick={() => setNeighborhood("all")}
              >
                Tous
              </SheetChip>
              {cityNeighborhoods.map((n) => (
                <SheetChip
                  key={n}
                  active={neighborhood === n}
                  onClick={() => setNeighborhood(n)}
                >
                  {n}
                </SheetChip>
              ))}
              {cityNeighborhoods.length === 0 && (
                <span className="text-xs text-ink-muted">
                  Aucun quartier référencé pour cette ville.
                </span>
              )}
            </div>
          </SheetGroup>

          <SheetGroup label="Disponibilité">
            <SheetChip
              active={openOnly}
              onClick={() => setOpenOnly((v) => !v)}
            >
              <Clock className="h-4 w-4" />
              Ouvert maintenant
            </SheetChip>
          </SheetGroup>
        </div>
      </BottomSheet>
    </section>
  );
}

function NoResults({
  query,
  onReset,
}: {
  query: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-clay-200 bg-white/60 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay-100 text-ink-muted">
        <SearchX className="h-7 w-7" />
      </span>
      <p className="text-lg font-bold text-ink">Aucun résultat trouvé</p>
      <p className="max-w-sm text-sm text-ink-muted">
        {query.trim()
          ? `Rien ne correspond à « ${query.trim()} » avec ces filtres.`
          : "Aucune boutique ne correspond à ces filtres."}{" "}
        Essayez d&apos;élargir votre recherche.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="btn-base mt-1 h-11 bg-faso-red px-6 text-sm text-white"
      >
        <RotateCcw className="h-4 w-4" />
        Réinitialiser la recherche
      </button>
    </motion.div>
  );
}

function FilterChip({
  active,
  onClick,
  icon,
  label,
  tone = "faso",
  className,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: "faso" | "green";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
        active
          ? tone === "green"
            ? "border-faso-green bg-faso-green-soft/40 text-faso-green-dark ring-1 ring-faso-green"
            : "border-faso-gold bg-faso-gold-soft/30 text-ink ring-1 ring-faso-gold"
          : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold hover:text-ink",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function LocationSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-ink-muted">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-clay-200 bg-white px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "all" ? allLabel : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SheetGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">
        {label}
        {hint && (
          <span className="ml-2 text-xs font-medium text-ink-muted">{hint}</span>
        )}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SheetChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all active:scale-95",
        active
          ? "border-faso-gold bg-faso-gold-soft/30 text-ink ring-1 ring-faso-gold"
          : "border-clay-200 bg-white text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}
