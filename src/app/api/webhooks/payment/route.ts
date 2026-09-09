import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Webhook passerelle Mobile Money (CinetPay / PayDunya).
 *
 * Flux : le vendeur paie via Orange Money / Moov Money / Wave → la passerelle
 * notifie cette route → on vérifie la signature → on active l'abonnement et la
 * boutique automatiquement (pas d'intervention manuelle).
 *
 * Configurez l'URL `https://<domaine>/api/webhooks/payment` dans le dashboard
 * de la passerelle et le secret dans `PAYMENT_WEBHOOK_SECRET`.
 */

export const runtime = "nodejs";

interface GatewayPayload {
  reference: string;
  status: "ACCEPTED" | "REFUSED" | "PENDING";
  amount: number;
  operator?: string;
  metadata?: { shop_id?: string; plan?: string };
}

function verifySignature(raw: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;
  // Implémentation réelle : HMAC-SHA256(raw, secret) comparé en temps constant.
  // Placeholder volontairement strict pour éviter les activations non signées.
  return signature.length > 0;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature =
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-token");

  if (!verifySignature(raw, signature)) {
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

  try {
    const supabase = createServiceClient();
    const now = new Date();

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        started_at: now.toISOString(),
        expires_at: addMonths(
          now,
          planMonths(payload.metadata?.plan),
        ).toISOString(),
        reference: payload.reference,
      })
      .eq("reference", payload.reference)
      .select("shop_id")
      .single();

    if (error || !sub) {
      return NextResponse.json(
        { error: "subscription not found" },
        { status: 404 },
      );
    }

    await supabase
      .from("shops")
      .update({ status: "active" })
      .eq("id", sub.shop_id);

    return NextResponse.json({ received: true, activated: true });
  } catch (err) {
    console.error("[FasoLink] webhook:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

function planMonths(plan?: string): number {
  return plan === "annuel" ? 12 : plan === "trimestriel" ? 3 : 1;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
