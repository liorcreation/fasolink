import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { firebasePublicConfig } from "@/lib/firebase-public-config";
import {
  createFirestoreDocument,
  firestoreBase,
  firestoreString,
  getEdgeServiceAccount,
  getFirestoreAccessToken,
  getFirestoreDocument,
} from "@/lib/firestore-edge-admin";


const text = (fields: Record<string, Record<string, unknown>>, key: string) => {
  const value = fields[key];
  return value && "stringValue" in value ? String(value.stringValue) : "";
};

export async function POST(request: Request) {
  try {
    const { idToken, shopId, plan } = await request.json() as { idToken?: string; shopId?: string; plan?: string };
    if (!idToken || !shopId || !/^[a-zA-Z0-9_-]{1,128}$/.test(shopId)) {
      return NextResponse.json({ error: "Connexion ou boutique invalide." }, { status: 400 });
    }
    const selectedPlan = SUBSCRIPTION_PLANS.find((item) => item.id === plan);
    if (!selectedPlan || selectedPlan.price % 5 !== 0) {
      return NextResponse.json({ error: "Formule d’abonnement invalide." }, { status: 400 });
    }

    const identityResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebasePublicConfig.apiKey)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }),
    });
    if (!identityResponse.ok) return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });
    const identity = await identityResponse.json() as { users?: Array<{ localId?: string; email?: string; displayName?: string; phoneNumber?: string }> };
    const user = identity.users?.[0];
    if (!user?.localId) return NextResponse.json({ error: "Session utilisateur invalide." }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: "Un compte avec adresse e-mail est requis pour payer." }, { status: 400 });

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    const appBaseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");
    if (!apiKey || !siteId || !appBaseUrl || !appBaseUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Le paiement CinetPay n’est pas encore configuré côté serveur." }, { status: 503 });
    }

    const account = getEdgeServiceAccount();
    if (account.project_id !== firebasePublicConfig.projectId) throw new Error("Firebase service account project mismatch");
    const accessToken = await getFirestoreAccessToken(account);
    const shop = await getFirestoreDocument(`${firestoreBase(account.project_id)}/shops/${encodeURIComponent(shopId)}`, accessToken);
    if (!shop || text(shop.fields, "owner_id") !== user.localId) {
      return NextResponse.json({ error: "Cette boutique ne vous appartient pas." }, { status: 403 });
    }
    if (text(shop.fields, "status") === "suspended") {
      return NextResponse.json({ error: "Cette boutique est suspendue. Contactez le support." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const transactionId = `FL${Date.now()}${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const subscription = await createFirestoreDocument(
      `${firestoreBase(account.project_id)}/subscriptions`, transactionId,
      {
        shop_id: firestoreString(shopId), plan: firestoreString(selectedPlan.id),
        status: firestoreString("pending"), provider: { nullValue: null },
        gateway: firestoreString("CinetPay"), amount: { integerValue: String(selectedPlan.price) },
        phone: { nullValue: null }, reference: firestoreString(transactionId),
        started_at: { nullValue: null }, expires_at: { nullValue: null },
        created_at: firestoreString(now), updated_at: firestoreString(now),
      }, accessToken,
    );

    const paymentResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey, site_id: siteId, transaction_id: transactionId,
        amount: selectedPlan.price, currency: "XOF",
        description: `Abonnement FasoLink ${selectedPlan.label} — ${text(shop.fields, "name")}`,
        notify_url: `${appBaseUrl}/api/webhooks/payment`,
        return_url: `${appBaseUrl}/vendeur/paiement?shop=${encodeURIComponent(shopId)}&payment=return&reference=${encodeURIComponent(transactionId)}`,
        channels: "MOBILE_MONEY", customer_id: user.localId,
        customer_name: user.displayName?.trim().split(/\s+/)[0] || "Client",
        customer_surname: user.displayName?.trim().split(/\s+/).slice(1).join(" ") || "FasoLink",
        customer_email: user.email,
        customer_phone_number: user.phoneNumber || text(shop.fields, "whatsapp"),
        customer_address: text(shop.fields, "city") || "Ouagadougou",
        customer_city: text(shop.fields, "city") || "Ouagadougou",
        customer_country: "BF", customer_state: "BF", customer_zip_code: "00000",
        metadata: JSON.stringify({ shop_id: shopId, plan: selectedPlan.id }),
      }),
    });
    const payment = await paymentResponse.json() as { code?: string | number; message?: string; data?: { payment_url?: string } };
    if (!paymentResponse.ok || String(payment.code) !== "201" || !payment.data?.payment_url) {
      console.error("[FasoLink] CinetPay initialization rejected", payment.code, payment.message);
      return NextResponse.json({ error: "CinetPay n’a pas pu préparer le paiement. Réessayez dans un instant." }, { status: 502 });
    }
    return NextResponse.json({ paymentUrl: payment.data.payment_url, reference: transactionId, subscription: subscription.name });
  } catch (error) {
    console.error("[FasoLink] CinetPay initialize:", error);
    return NextResponse.json({ error: "Impossible de préparer le paiement pour le moment." }, { status: 500 });
  }
}
