import type { Product, Shop, ShopWithProducts } from "@/lib/database.types";
import { NEIGHBORHOODS } from "@/lib/constants";
import { STANDARD_HOURS } from "@/lib/hours";

/**
 * Jeu de données de démonstration (seed) — 9 boutiques locales, 27 produits.
 * Utilisé tant que Firebase n'est pas connecté (ou en secours si la requête
 * échoue). Images : Unsplash (autorisées dans next.config.mjs).
 *
 * Pour injecter ce jeu dans Firestore : `npm run seed` (voir scripts/seed.ts).
 */

const now = "2026-02-01T09:00:00.000Z";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

type ShopSeed = Omit<
  Shop,
  | "created_at"
  | "updated_at"
  | "status"
  | "rating_count"
  | "gallery"
  | "latitude"
  | "longitude"
  | "opening_hours"
  | "verification_status"
  | "whatsapp_clicks"
> &
  Partial<
    Pick<
      Shop,
      | "gallery"
      | "rating_count"
      | "status"
      | "opening_hours"
      | "verification_status"
      | "whatsapp_clicks"
      | "latitude"
      | "longitude"
    >
  >;

type ProductSeed = Omit<
  Product,
  "created_at" | "updated_at" | "currency" | "shop_id" | "availability"
> &
  Partial<Pick<Product, "availability">>;

type ReviewSeed = {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
};

function coordsFor(neighborhood: string | null, city: string) {
  const n = NEIGHBORHOODS.find(
    (q) => q.name === neighborhood && q.city === city,
  );
  return n ? { latitude: n.lat, longitude: n.lng } : {};
}

function mk(
  shop: ShopSeed,
  products: ProductSeed[],
  reviews: ReviewSeed[] = [],
): ShopWithProducts {
  const rc = reviews.length || shop.rating_count || 18;
  return {
    created_at: now,
    updated_at: now,
    status: "active",
    verification_status: "verified",
    whatsapp_clicks: 0,
    opening_hours: STANDARD_HOURS,
    gallery: [],
    latitude: null,
    longitude: null,
    ...coordsFor(shop.neighborhood, shop.city),
    ...shop,
    rating_count: rc,
    products: products.map((p) => ({
      currency: "XOF",
      availability: "in_stock" as const,
      created_at: now,
      updated_at: now,
      shop_id: shop.id,
      ...p,
    })),
    reviews: reviews.map((r) => ({
      ...r,
      shop_id: shop.id,
      created_at: now,
      author_id: null,
      is_verified: true,
    })),
  };
}

export const MOCK_SHOPS: ShopWithProducts[] = [
  // ─────────────────────────── Alimentation ───────────────────────────
  mk(
    {
      id: "faso-delices",
      owner_id: "demo-1",
      name: "Faso Délices",
      slug: "faso-delices",
      category: "alimentation",
      description:
        "Producteurs de jus de bissap, gingembre et tamarin 100 % naturels, préparés à Ouagadougou sans conservateurs. Livraison quartier disponible.",
      city: "Ouagadougou",
      neighborhood: "Ouaga 2000",
      whatsapp: "+22670112233",
      logo_url: img("1544787219-7f47ccb76574", 200),
      cover_url: img("1600271886742-f049cd451bba", 1200),
      gallery: [img("1613478223719-2ab802602423"), img("1625944529391-9d1d5b5b1e6f")],
      is_featured: true,
      rating: 4.9,
    },
    [
      {
        id: "p-bissap-1l",
        name: "Jus de Bissap 1L",
        description: "Fleur d'hibiscus, menthe fraîche, sucre de canne.",
        price: 1500,
        image_url: img("1497534446932-c925b458314e", 600),
      },
      {
        id: "p-gingembre",
        name: "Jus de Gingembre 50cl",
        description: "Gingembre pressé, citron, ananas.",
        price: 1000,
        image_url: img("1571950006418-f226dc106482", 600),
      },
      {
        id: "p-tamarin",
        name: "Jus de Tamarin 1L",
        description: "Pulpe de tamarin, vanille de Bobo.",
        price: 1800,
        availability: "on_order",
        image_url: img("1621263764928-df1444c5e859", 600),
      },
    ],
    [
      {
        id: "r-fd-1",
        author_name: "Aïcha O.",
        rating: 5,
        comment:
          "Le bissap est excellent, livré en 30 min à Ouaga 2000. Je recommande !",
      },
      {
        id: "r-fd-2",
        author_name: "Boukary S.",
        rating: 5,
        comment: "Produits vraiment naturels, on sent la différence. Top.",
      },
      {
        id: "r-fd-3",
        author_name: "Nadège K.",
        rating: 4,
        comment: "Très bon, juste un peu sucré à mon goût.",
      },
    ],
  ),
  mk(
    {
      id: "beurre-de-karite-nafa",
      owner_id: "demo-6",
      name: "Karité Nafa",
      slug: "beurre-de-karite-nafa",
      category: "alimentation",
      description:
        "Coopérative féminine de production de beurre de karité brut et savons naturels. Récolte et transformation dans la région des Cascades.",
      city: "Banfora",
      neighborhood: "Centre",
      whatsapp: "+22677889900",
      logo_url: img("1556228578-8c89e6adf883", 200),
      cover_url: img("1608571423902-eed4a5ad8108", 1200),
      gallery: [img("1601049676869-702ea24cfd58")],
      is_featured: false,
      rating: 4.9,
    },
    [
      {
        id: "p-karite-500",
        name: "Beurre de karité brut 500g",
        description: "Non raffiné, pressé à froid, pot réutilisable.",
        price: 2500,
        image_url: img("1600857544200-b2f666a9a2ec", 600),
      },
      {
        id: "p-savon-karite",
        name: "Savon au karité & miel",
        description: "Lot de 3 savons artisanaux.",
        price: 3000,
        image_url: img("1584305574647-0cc949a2bb9f", 600),
      },
      {
        id: "p-karite-1kg",
        name: "Beurre de karité 1kg (revendeur)",
        description: "Format grossiste pour salons et pharmacies.",
        price: 4500,
        availability: "on_order",
        image_url: img("1612817288484-6f916006741a", 600),
      },
    ],
    [
      {
        id: "r-kn-1",
        author_name: "Mariam C.",
        rating: 5,
        comment: "Karité pur et onctueux, parfait pour la peau des enfants.",
      },
      {
        id: "r-kn-2",
        author_name: "Ousmane L.",
        rating: 5,
        comment: "Belle initiative, produits de qualité. Fier d'acheter local.",
      },
    ],
  ),

  // ─────────────────────────── Habillement / Mode ───────────────────────────
  mk(
    {
      id: "atelier-faso-dan-fani",
      owner_id: "demo-2",
      name: "Atelier Faso Dan Fani",
      slug: "atelier-faso-dan-fani",
      category: "habillement",
      description:
        "Tissage traditionnel du Faso Dan Fani et confection sur mesure. Chemises, ensembles pagne tissé et accessoires, faits main à Koudougou.",
      city: "Koudougou",
      neighborhood: "Secteur 4",
      whatsapp: "+22676445566",
      logo_url: img("1523381210434-271e8be1f52b", 200),
      cover_url: img("1558769132-cb1aea458c5e", 1200),
      gallery: [img("1520006403909-838d6b92c22e"), img("1490481651871-ab68de25d43d")],
      is_featured: true,
      rating: 4.8,
    },
    [
      {
        id: "p-ensemble-homme",
        name: "Ensemble homme pagne tissé",
        description: "Haut + pantalon, coton filé main, broderie au col.",
        price: 35000,
        availability: "on_order",
        image_url: img("1594633312681-425c7b97ccd1", 600),
      },
      {
        id: "p-robe-femme",
        name: "Robe cocktail Dan Fani",
        description: "Coupe cintrée, motifs bicolores tissés.",
        price: 42000,
        availability: "on_order",
        image_url: img("1595777457583-95e059d581b8", 600),
      },
      {
        id: "p-sac-tisse",
        name: "Sac à main tissé",
        description: "Anses cuir, doublure intérieure.",
        price: 12000,
        image_url: img("1584917865442-de89df76afd3", 600),
      },
    ],
    [
      {
        id: "r-adf-1",
        author_name: "Fatoumata Z.",
        rating: 5,
        comment:
          "Confection impeccable, aux mesures exactes. Le tissage est superbe.",
      },
      {
        id: "r-adf-2",
        author_name: "Ismaël T.",
        rating: 5,
        comment: "Délai respecté (10 jours) et finitions haut de gamme.",
      },
    ],
  ),
  mk(
    {
      id: "wendata-mode",
      owner_id: "demo-7",
      name: "Wendata Mode",
      slug: "wendata-mode",
      category: "habillement",
      description:
        "Prêt-à-porter afro-contemporain : boubous modernes, chemises en wax, tenues enfant et accessoires. Retouches offertes sur le premier achat.",
      city: "Ouagadougou",
      neighborhood: "Gounghin",
      whatsapp: "+22665221144",
      logo_url: img("1441986300917-64674bd600d8", 200),
      cover_url: img("1483985988355-763728e1935b", 1200),
      gallery: [img("1445205170230-053b83016050"), img("1487222477894-8943e31ef7b2")],
      is_featured: true,
      verification_status: "verified",
      rating: 4.7,
    },
    [
      {
        id: "p-boubou-moderne",
        name: "Boubou homme brodé",
        description: "Bazin riche, broderie machine, 3 pièces.",
        price: 28000,
        image_url: img("1516826957135-700dedea698c", 600),
      },
      {
        id: "p-chemise-wax",
        name: "Chemise wax cintrée",
        description: "100 % coton, coupe slim, tailles S à XXL.",
        price: 9000,
        image_url: img("1602810318383-e386cc2a3ccf", 600),
      },
      {
        id: "p-tenue-enfant",
        name: "Tenue enfant en wax",
        description: "Ensemble chemise + short, 2 à 10 ans.",
        price: 6500,
        availability: "on_order",
        image_url: img("1519238263530-99bdd11df2ea", 600),
      },
    ],
    [
      {
        id: "r-wm-1",
        author_name: "Prisca Y.",
        rating: 5,
        comment: "Coupe parfaite et retouche faite en 20 minutes. Au top.",
      },
      {
        id: "r-wm-2",
        author_name: "Adama K.",
        rating: 4,
        comment: "Beau tissu, livraison un jour de retard mais rien de grave.",
      },
    ],
  ),

  // ─────────────────────────── Électronique ───────────────────────────
  mk(
    {
      id: "sahel-tech",
      owner_id: "demo-3",
      name: "Sahel Tech Store",
      slug: "sahel-tech",
      category: "electronique",
      description:
        "Smartphones, accessoires et petits électroménagers avec garantie locale. Service après-vente et réparation express à Bobo-Dioulasso.",
      city: "Bobo-Dioulasso",
      neighborhood: "Accart-Ville",
      whatsapp: "+22678990011",
      logo_url: img("1511707171634-5f897ff02aa9", 200),
      cover_url: img("1550009158-9ebf69173e03", 1200),
      is_featured: false,
      verification_status: "verified",
      rating: 4.6,
    },
    [
      {
        id: "p-powerbank",
        name: "Batterie externe 20 000 mAh",
        description: "Charge rapide double USB, lampe intégrée.",
        price: 9500,
        image_url: img("1609592806596-b43bada2f4bb", 600),
      },
      {
        id: "p-ecouteurs",
        name: "Écouteurs sans fil",
        description: "Bluetooth 5.3, boîtier de charge, 24h d'autonomie.",
        price: 14000,
        image_url: img("1590658268037-6bf12165a8df", 600),
      },
      {
        id: "p-ventilo",
        name: "Ventilateur rechargeable",
        description: "3 vitesses, autonomie 8h, idéal coupures.",
        price: 18000,
        availability: "out_of_stock",
        image_url: img("1618477388954-7852f32655ec", 600),
      },
    ],
    [
      {
        id: "r-st-1",
        author_name: "Rasmané P.",
        rating: 5,
        comment: "Téléphone reçu scellé, garantie honorée sans discuter.",
      },
      {
        id: "r-st-2",
        author_name: "Clarisse W.",
        rating: 4,
        comment: "Bon service, réparation faite en 1h comme promis.",
      },
    ],
  ),
  mk(
    {
      id: "ouaga-digital-store",
      owner_id: "demo-8",
      name: "Ouaga Digital Store",
      slug: "ouaga-digital-store",
      category: "electronique",
      description:
        "Ordinateurs portables, imprimantes, onduleurs et kits bureautiques pour PME et étudiants. Facture, installation et formation incluses.",
      city: "Ouagadougou",
      neighborhood: "Patte d'Oie",
      whatsapp: "+22674556677",
      logo_url: img("1517336714731-489689fd1ca8", 200),
      cover_url: img("1498050108023-c5249f4df085", 1200),
      is_featured: false,
      rating: 4.5,
    },
    [
      {
        id: "p-laptop",
        name: "PC portable 14\" i5 / 8 Go",
        description: "SSD 256 Go, Windows 11, garantie 12 mois.",
        price: 285000,
        availability: "on_order",
        image_url: img("1496181133206-80ce9b88a853", 600),
      },
      {
        id: "p-imprimante",
        name: "Imprimante multifonction",
        description: "Impression, scan, photocopie, Wi-Fi.",
        price: 65000,
        image_url: img("1612815154858-60aa4c59eaad", 600),
      },
      {
        id: "p-onduleur",
        name: "Onduleur 650 VA",
        description: "Protège vos appareils des coupures et surtensions.",
        price: 22000,
        image_url: img("1558002038-1055907df827", 600),
      },
    ],
    [
      {
        id: "r-ods-1",
        author_name: "Serge B.",
        rating: 5,
        comment: "PC configuré et livré au bureau, avec la facture. Sérieux.",
      },
    ],
  ),

  // ─────────────────────────── Artisanat ───────────────────────────
  mk(
    {
      id: "bronze-de-ouaga",
      owner_id: "demo-4",
      name: "Bronze de Ouaga",
      slug: "bronze-de-ouaga",
      category: "artisanat",
      description:
        "Sculptures en bronze à la cire perdue, masques et bijoux inspirés du patrimoine mossi. Pièces uniques signées par nos artisans fondeurs.",
      city: "Ouagadougou",
      neighborhood: "Zone du Bois",
      whatsapp: "+22672334455",
      logo_url: img("1610030469983-98e550d6193c", 200),
      cover_url: img("1531771686035-25f47595c87a", 1200),
      gallery: [img("1582560475093-ba66accbc424"), img("1578632749014-ca77efd052eb")],
      is_featured: true,
      rating: 5.0,
    },
    [
      {
        id: "p-masque-bronze",
        name: "Masque en bronze",
        description: "Hauteur 30 cm, patine ancienne, socle bois.",
        price: 55000,
        availability: "on_order",
        image_url: img("1610030469983-98e550d6193c", 600),
      },
      {
        id: "p-bracelet",
        name: "Bracelet jonc bronze",
        description: "Motifs géométriques gravés main.",
        price: 8000,
        image_url: img("1611591437281-460bfbe1220a", 600),
      },
      {
        id: "p-statuette",
        name: "Statuette cavalier mossi",
        description: "Pièce de 40 cm, cire perdue, signée.",
        price: 78000,
        availability: "on_order",
        image_url: img("1564399579883-451a5d44ec08", 600),
      },
    ],
    [
      {
        id: "r-bo-1",
        author_name: "Jean-Marc D.",
        rating: 5,
        comment: "Pièce magnifique, emballage soigné pour l'expédition.",
      },
      {
        id: "r-bo-2",
        author_name: "Awa T.",
        rating: 5,
        comment: "Un vrai savoir-faire. La statuette trône dans mon salon.",
      },
    ],
  ),
  mk(
    {
      id: "zaka-deco",
      owner_id: "demo-9",
      name: "Zaka Déco",
      slug: "zaka-deco",
      category: "artisanat",
      description:
        "Décoration intérieure faite main : paniers en paille, lampes en calebasse, poteries et tapis tissés. Fabrication à Ouagadougou et à Kaya.",
      city: "Ouagadougou",
      neighborhood: "Dassasgho",
      whatsapp: "+22679334422",
      logo_url: img("1513519245088-0e12902e5a38", 200),
      cover_url: img("1524758631624-e2822e304c36", 1200),
      gallery: [img("1522708323590-d24dbb6b0267"), img("1493666438817-866a91353ca9")],
      is_featured: false,
      verification_status: "pending",
      rating: 4.8,
    },
    [
      {
        id: "p-panier-paille",
        name: "Panier en paille tressé",
        description: "Grand modèle, anses cuir, pour linge ou marché.",
        price: 7500,
        image_url: img("1590422749897-47036da0b0e0", 600),
      },
      {
        id: "p-lampe-calebasse",
        name: "Lampe en calebasse ajourée",
        description: "Douille E27, câble tressé 2 m, motifs perforés.",
        price: 15000,
        image_url: img("1517991104123-1d56a6e81ed9", 600),
      },
      {
        id: "p-tapis-tisse",
        name: "Tapis tissé 120 × 180",
        description: "Coton recyclé, motif géométrique bicolore.",
        price: 24000,
        availability: "on_order",
        image_url: img("1600166898405-da9535204843", 600),
      },
    ],
    [
      {
        id: "r-zd-1",
        author_name: "Lucie N.",
        rating: 5,
        comment: "Les paniers sont solides et magnifiques. Livraison rapide.",
      },
    ],
  ),

  // ─────────────────────────── Services ───────────────────────────
  mk(
    {
      id: "faso-clim-services",
      owner_id: "demo-5",
      name: "Faso Clim & Services",
      slug: "faso-clim-services",
      category: "services",
      description:
        "Installation et entretien de climatiseurs, groupes électrogènes et panneaux solaires. Intervention rapide à domicile sur tout Ouagadougou.",
      city: "Ouagadougou",
      neighborhood: "Tanghin",
      whatsapp: "+22675667788",
      logo_url: img("1581092160607-ee22621dd758", 200),
      cover_url: img("1621905251189-08b45d6a269e", 1200),
      is_featured: false,
      verification_status: "pending",
      rating: 4.7,
    },
    [
      {
        id: "p-install-clim",
        name: "Installation climatiseur split",
        description: "Pose complète, mise en service, garantie 6 mois.",
        price: 25000,
        availability: "on_order",
        image_url: img("1631545806609-c2b999c5b2b5", 600),
      },
      {
        id: "p-entretien-groupe",
        name: "Entretien groupe électrogène",
        description: "Vidange, filtres, contrôle complet.",
        price: 15000,
        availability: "on_order",
        image_url: img("1487875961445-47a00398c267", 600),
      },
      {
        id: "p-kit-solaire",
        name: "Kit solaire 300W",
        description: "Panneau, batterie, régulateur — installation incluse.",
        price: 180000,
        image_url: img("1509391366360-2e959784a276", 600),
      },
    ],
    [
      {
        id: "r-fcs-1",
        author_name: "Salif B.",
        rating: 5,
        comment: "Intervenu le jour même, clim posée nickel. Prix correct.",
      },
    ],
  ),
];

/** Alias historique. */
export const DEMO_SHOPS = MOCK_SHOPS;

export function getMockShop(id: string): ShopWithProducts | undefined {
  return MOCK_SHOPS.find((s) => s.id === id || s.slug === id);
}

export const getDemoShop = getMockShop;

/** Tous les produits, à plat (pour l'index de recherche). */
export const MOCK_PRODUCTS: Product[] = MOCK_SHOPS.flatMap((s) => s.products);
