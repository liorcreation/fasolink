import { NextResponse } from "next/server";
import { firebasePublicConfig } from "@/lib/firebase-public-config";
import {
  commitFirestoreWrites,
  firestoreBase,
  firestoreString,
  getEdgeServiceAccount,
  getFirestoreAccessToken,
  getFirestoreDocument,
  runFirestoreQuery,
} from "@/lib/firestore-edge-admin";


type FirestoreValue = Record<string, unknown>;
type FirestoreDocument = { name: string; updateTime?: string; fields: Record<string, FirestoreValue> };
type CinetPayCheck = { code?: string; data?: { status?: string; amount?: number | string; currency?: string; transaction_id?: string; site_id?: string } };

function readField(fields: Record<string, FirestoreValue>, key: string) {
  const value = fields[key];
  if (!value) return null;
  if ("stringValue" in value) return String(value.stringValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  return null;
}

async function notificationValues(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json() as Record<string, unknown>;
    return {
      transactionId: String(body.cpm_trans_id ?? body.transaction_id ?? ""),
      siteId: String(body.cpm_site_id ?? body.site_id ?? ""),
    };
  }
  const form = await request.formData();
  return {
    transactionId: String(form.get("cpm_trans_id") ?? form.get("transaction_id") ?? ""),
    siteId: String(form.get("cpm_site_id") ?? form.get("site_id") ?? ""),
  };
}

function monthsFor(plan: unknown) {
  return plan === "annuel" ? 12 : plan === "trimestriel" ? 3 : plan === "mensuel" ? 1 : 0;
}

export async function POST(request: Request) {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apiKey || !siteId) return NextResponse.json({ error: "CinetPay indisponible" }, { status: 503 });

  try {
    const { transactionId, siteId: notifiedSiteId } = await notificationValues(request);
    if (!transactionId || notifiedSiteId !== siteId) {
      return NextResponse.json({ error: "Notification CinetPay invalide" }, { status: 400 });
    }

    // Le contenu de la notification n'est jamais considéré comme une preuve de paiement.
    const verification = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: transactionId }),
    });
    if (!verification.ok) throw new Error("CinetPay transaction verification request failed");
    const checked = await verification.json() as CinetPayCheck;
    const payment = checked.data;
    if (checked.code !== "00" || payment?.status !== "ACCEPTED") {
      return NextResponse.json({ received: true, activated: false });
    }
    if (payment.transaction_id && payment.transaction_id !== transactionId) {
      return NextResponse.json({ error: "Transaction mismatch" }, { status: 400 });
    }
    if (payment.site_id && payment.site_id !== siteId) {
      return NextResponse.json({ error: "Site mismatch" }, { status: 400 });
    }

    const account = getEdgeServiceAccount();
    if (account.project_id !== firebasePublicConfig.projectId) throw new Error("Firebase service account project mismatch");
    const token = await getFirestoreAccessToken(account);
    const rows = await runFirestoreQuery(account, token, {
      from: [{ collectionId: "subscriptions" }],
      where: { fieldFilter: { field: { fieldPath: "reference" }, op: "EQUAL", value: firestoreString(transactionId) } },
      limit: 1,
    });
    const subscription = rows.find((row) => row.document)?.document as FirestoreDocument | undefined;
    if (!subscription) return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
    const data = subscription.fields;
    const shopId = readField(data, "shop_id");
    const amount = readField(data, "amount");
    const months = monthsFor(readField(data, "plan"));
    const status = readField(data, "status");
    if (status === "active") return NextResponse.json({ received: true, activated: true, idempotent: true });
    if (status !== "pending" || typeof shopId !== "string" || typeof amount !== "number" || !months) {
      return NextResponse.json({ error: "Abonnement non payable" }, { status: 409 });
    }
    if (Number(payment.amount) !== amount || (payment.currency && payment.currency !== "XOF")) {
      return NextResponse.json({ error: "Montant/devise invalides" }, { status: 400 });
    }

    const shop = await getFirestoreDocument(`${firestoreBase(account.project_id)}/shops/${encodeURIComponent(shopId)}`, token);
    if (!shop || !subscription.updateTime || !shop.updateTime) throw new Error("Required Firestore version is missing");
    if (readField(shop.fields, "status") === "suspended") {
      return NextResponse.json({ error: "Boutique suspendue; paiement reçu, activation bloquée" }, { status: 409 });
    }
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + months * 30);
    const isoNow = now.toISOString();
    const isoExpiry = expiry.toISOString();
    const subMask = ["status", "started_at", "expires_at", "updated_at"];
    const shopMask = ["status", "updated_at"];

    // Une seule écriture atomique met la licence et la boutique en activité.
    await commitFirestoreWrites(account.project_id, [
      {
        update: { name: subscription.name, fields: {
          status: firestoreString("active"), started_at: firestoreString(isoNow),
          expires_at: firestoreString(isoExpiry), updated_at: firestoreString(isoNow),
        } },
        updateMask: { fieldPaths: subMask },
        currentDocument: { updateTime: subscription.updateTime },
      },
      {
        update: { name: shop.name, fields: { status: firestoreString("active"), updated_at: firestoreString(isoNow) } },
        updateMask: { fieldPaths: shopMask },
        currentDocument: { updateTime: shop.updateTime },
      },
    ], token);
    return NextResponse.json({ received: true, activated: true });
  } catch (error) {
    console.error("[FasoLink] CinetPay webhook:", error);
    return NextResponse.json({ error: "Erreur de traitement du paiement" }, { status: 500 });
  }
}
