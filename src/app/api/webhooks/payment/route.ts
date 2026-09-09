import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore/lite";
import { COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Webhook passerelle Mobile Money (CinetPay / PayDunya).
 *
 * Flux : le vendeur paie via Orange Money / Moov Money / Wave → la passerelle
 * notifie cette route → vérification de signature HMAC → activation de
 * l'abonnement (`subscriptions`) et publication de la boutique (`shops`).
 *
 * Prod : pour un accès Firestore privilégié, déployer cette logique en
 * **Firebase Cloud Function** ou signer un JWT de compte de service. Ici, on
 * écrit via le SDK `firestore/lite` (Edge) — les règles Firestore doivent
 * autoriser la mise à jour ciblée (voir firestore.rules).
 */

export const runtime = "edge";

interface GatewayPayload {
  reference: string;
  status: "ACCEPTED" | "REFUSED" | "PENDING";
  amount: number;
  operator?: string;
  metadata?: { shop_id?: string; plan?: string };
}

/** Vérifie la signature HMAC-SHA256 du corps brut (Web Crypto — compatible Edge). */
async function verifySignature(
  raw: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(raw),
  );
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const got = signature.trim().toLowerCase().replace(/^sha256=/, "");
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function planMonths(plan?: string): number {
  return plan === "annuel" ? 12 : plan === "trimestriel" ? 3 : 1;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature =
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-token");

  if (!(await verifySignature(raw, signature))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: GatewayPayload;
  try {
    payload = JSON.parse(raw) as GatewayPayload;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (payload.status !== "ACCEPTED") {
    return NextResponse.json({ received: true, activated: false });
  }

  if (!isFirebaseConfigured) {
    return NextResponse.json(
      { error: "firebase not configured" },
      { status: 503 },
    );
  }

  try {
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + planMonths(payload.metadata?.plan));

    const subSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.subscriptions),
        where("reference", "==", payload.reference),
        limit(1),
      ),
    );

    if (subSnap.empty) {
      return NextResponse.json(
        { error: "subscription not found" },
        { status: 404 },
      );
    }

    const subDoc = subSnap.docs[0];
    const shopId = (subDoc.data() as { shop_id: string }).shop_id;

    await updateDoc(subDoc.ref, {
      status: "active",
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      updated_at: now.toISOString(),
    });

    if (shopId) {
      await updateDoc(doc(db, COLLECTIONS.shops, shopId), {
        status: "active",
        updated_at: now.toISOString(),
      });
    }

    return NextResponse.json({ received: true, activated: true });
  } catch (err) {
    console.error("[FasoLink] webhook:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
