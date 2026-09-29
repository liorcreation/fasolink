import { NextResponse } from "next/server";
import { firestoreBase, firestoreString, getEdgeServiceAccount, getFirestoreAccessToken, patchFirestoreDocument, runFirestoreQuery } from "@/lib/firestore-edge-admin";

export const runtime = "edge";

interface GatewayPayload { reference: string; status: "ACCEPTED" | "REFUSED" | "PENDING"; amount: number; operator?: string; metadata?: { shop_id?: string; plan?: string }; }
interface SubscriptionData { shop_id: string; plan: "mensuel" | "trimestriel" | "annuel"; amount: number; status: string; }

async function verifySignature(raw: string, signature: string | null) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const received = signature.trim().toLowerCase().replace(/^sha256=/, "");
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < expected.length; index++) diff |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  return diff === 0;
}

function planMonths(plan: string) { return plan === "annuel" ? 12 : plan === "trimestriel" ? 3 : 1; }

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-payment-signature") ?? request.headers.get("x-token");
  if (!(await verifySignature(raw, signature))) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  let payload: GatewayPayload;
  try { payload = JSON.parse(raw) as GatewayPayload; } catch { return NextResponse.json({ error: "invalid payload" }, { status: 400 }); }
  if (!payload.reference || payload.status !== "ACCEPTED") return NextResponse.json({ received: true, activated: false });

  try {
    const account = getEdgeServiceAccount();
    const accessToken = await getFirestoreAccessToken(account);
    const rows = await runFirestoreQuery(account, accessToken, {
      from: [{ collectionId: "subscriptions" }],
      where: { fieldFilter: { field: { fieldPath: "reference" }, op: "EQUAL", value: firestoreString(payload.reference) } },
      limit: 1,
    });
    const document = rows.find((row) => row.document)?.document;
    if (!document) return NextResponse.json({ error: "subscription not found" }, { status: 404 });
    const data = Object.fromEntries(Object.entries(document.fields).map(([key, value]) => [key, "stringValue" in value ? value.stringValue : "integerValue" in value ? Number(value.integerValue) : null])) as unknown as SubscriptionData;
    if (payload.metadata?.shop_id && payload.metadata.shop_id !== data.shop_id) return NextResponse.json({ error: "shop mismatch" }, { status: 400 });
    if (Number(payload.amount) !== Number(data.amount)) return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
    if (data.status === "active") return NextResponse.json({ received: true, activated: true, idempotent: true });
    if (data.status !== "pending") return NextResponse.json({ error: "subscription is not payable" }, { status: 409 });
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + planMonths(data.plan));
    await patchFirestoreDocument(document.name, { status: firestoreString("active"), started_at: firestoreString(now.toISOString()), expires_at: firestoreString(expires.toISOString()), updated_at: firestoreString(now.toISOString()) }, accessToken);
    await patchFirestoreDocument(`${firestoreBase(account.project_id)}/shops/${encodeURIComponent(data.shop_id)}`, { status: firestoreString("active"), updated_at: firestoreString(now.toISOString()) }, accessToken);
    return NextResponse.json({ received: true, activated: true });
  } catch (error) {
    console.error("[FasoLink] payment webhook:", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
