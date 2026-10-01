import { NextResponse } from "next/server";

export const runtime = "edge";

type PexelsPhoto = {
  id?: number;
  width?: number;
  height?: number;
  photographer?: string;
  photographer_url?: string;
  url?: string;
  alt?: string;
  src?: { medium?: string; large?: string };
};

function safeHttpsUrl(value: unknown, hosts: string[]): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && hosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 240) : fallback;
}

export async function GET(request: Request) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Pexels n’est pas encore configuré sur le serveur." }, { status: 503 });
  }

  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ error: "Le terme de recherche doit contenir entre 2 et 100 caractères." }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ query, locale: "fr-FR", per_page: "12", page: "1" });
    const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey, Accept: "application/json" },
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({ error: "La clé Pexels configurée sur le serveur est invalide." }, { status: 502 });
    }
    if (!response.ok) return NextResponse.json({ error: "Pexels est momentanément indisponible." }, { status: 502 });

    const payload = await response.json() as { photos?: PexelsPhoto[] };
    const photos = (payload.photos ?? []).map((photo) => {
      const imageUrl = safeHttpsUrl(photo.src?.large ?? photo.src?.medium, ["images.pexels.com"]);
      const sourceUrl = safeHttpsUrl(photo.url, ["www.pexels.com", "pexels.com"]);
      const photographerUrl = safeHttpsUrl(photo.photographer_url, ["www.pexels.com", "pexels.com"]);
      if (!imageUrl || !sourceUrl) return null;
      const photographer = cleanText(photo.photographer, "Photographe Pexels");
      return {
        id: String(photo.id ?? sourceUrl),
        image_url: imageUrl,
        image_credit: `Photo de ${photographer} / Pexels`,
        image_source_url: sourceUrl,
        image_license: "Pexels License",
        image_license_url: "https://www.pexels.com/license/",
        photographer_url: photographerUrl,
        alt: cleanText(photo.alt, `Photo de ${query}`),
        width: photo.width ?? null,
        height: photo.height ?? null,
      };
    }).filter(Boolean);

    return NextResponse.json({ photos }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch (error) {
    console.error("[FasoLink] Pexels search:", error);
    return NextResponse.json({ error: "La recherche de photos a échoué." }, { status: 502 });
  }
}
