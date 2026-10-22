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
import {
  generateTransactionId,
  getCinetPayConfig,
  initializePayment,
} from "@/lib/payments/cinetpay";
import { validatePaymentInitPayload, ValidationError } from "@/lib/validation";

const text = (fields: Record<string, Record<string, unknown>>, key: string) => {
  const value = fields[key];
  return value && "stringValue" in value ? String(value.stringValue) : "";
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    let validated;
    try {
      validated = validatePaymentInitPayload(rawBody);
    } catch (valErr) {
      return NextResponse.json(
        { error: valErr instanceof ValidationError ? valErr.message : "Données de requête invalides." },
        { status: 400 },
      );
    }
    const { idToken, shopId, plan } = validated;

    // 2. Le montant NE provient JAMAIS du client : lookup serveur strict
    const selectedPlan = SUBSCRIPTION_PLANS.find((item) => item.id === plan);
    if (!selectedPlan || selectedPlan.price <= 0 || selectedPlan.price % 5 !== 0) {
      return NextResponse.json({ error: "Formule d’abonnement non reconnue." }, { status: 400 });
    }

    // 3. Authentification vérifiée auprès de Google Identity Toolkit
    const identityResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebasePublicConfig.apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!identityResponse.ok) {
      return NextResponse.json({ error: "Session expirée ou non autorisée. Reconnectez-vous." }, { status: 401 });
    }
    const identity = (await identityResponse.json()) as {
      users?: Array<{ localId?: string; email?: string; displayName?: string; phoneNumber?: string }>;
    };
    const user = identity.users?.[0];
    if (!user?.localId) {
      return NextResponse.json({ error: "Session utilisateur invalide." }, { status: 401 });
    }
    if (!user.email) {
      return NextResponse.json(
        { error: "Un compte avec adresse e-mail vérifiée est requis pour souscrire." },
        { status: 400 },
      );
    }

    // 4. Configuration serveur CinetPay
    const config = getCinetPayConfig();

    // 5. Contrôle d'appartenance de la boutique (Zero Trust Vendeur)
    const account = getEdgeServiceAccount();
    if (account.project_id !== firebasePublicConfig.projectId) {
      throw new Error("Firebase service account project mismatch");
    }
    const accessToken = await getFirestoreAccessToken(account);
    const shop = await getFirestoreDocument(
      `${firestoreBase(account.project_id)}/shops/${encodeURIComponent(shopId)}`,
      accessToken,
    );

    if (!shop || text(shop.fields, "owner_id") !== user.localId) {
      return NextResponse.json({ error: "Cette boutique ne vous appartient pas." }, { status: 403 });
    }
    if (text(shop.fields, "status") === "suspended") {
      return NextResponse.json({ error: "Cette boutique est suspendue. Action impossible." }, { status: 409 });
    }

    // 6. Création de l'enregistrement de souscription 'pending' en base
    const now = new Date().toISOString();
    const transactionId = generateTransactionId();
    const subscription = await createFirestoreDocument(
      `${firestoreBase(account.project_id)}/subscriptions`,
      transactionId,
      {
        shop_id: firestoreString(shopId),
        plan: firestoreString(selectedPlan.id),
        status: firestoreString("pending"),
        provider: { nullValue: null },
        gateway: firestoreString("CinetPay"),
        amount: { integerValue: String(selectedPlan.price) },
        phone: { nullValue: null },
        reference: firestoreString(transactionId),
        started_at: { nullValue: null },
        expires_at: { nullValue: null },
        created_at: firestoreString(now),
        updated_at: firestoreString(now),
      },
      accessToken,
    );

    // 7. Initialisation de la session auprès de CinetPay
    const shopName = text(shop.fields, "name") || "Boutique FasoLink";
    const payment = await initializePayment(config, {
      transactionId,
      amount: selectedPlan.price,
      currency: "XOF",
      description: `Abonnement FasoLink ${selectedPlan.label} — ${shopName}`,
      notifyUrl: `${config.appBaseUrl}/api/webhooks/payment`,
      returnUrl: `${config.appBaseUrl}/vendeur/paiement?shop=${encodeURIComponent(shopId)}&payment=return&reference=${encodeURIComponent(transactionId)}`,
      channels: "MOBILE_MONEY",
      customer: {
        id: user.localId,
        name: user.displayName?.trim().split(/\s+/)[0] || "Client",
        surname: user.displayName?.trim().split(/\s+/).slice(1).join(" ") || "FasoLink",
        email: user.email,
        phone: user.phoneNumber || text(shop.fields, "whatsapp"),
        address: text(shop.fields, "neighborhood") || text(shop.fields, "city") || "Ouagadougou",
        city: text(shop.fields, "city") || "Ouagadougou",
        country: "BF",
      },
      metadata: {
        shop_id: shopId,
        plan: selectedPlan.id,
      },
    });

    return NextResponse.json({
      paymentUrl: payment.paymentUrl,
      reference: transactionId,
      subscription: subscription.name,
    });
  } catch (error) {
    console.error("[FasoLink Security] CinetPay initialize error:", error);
    return NextResponse.json(
      { error: "Impossible de préparer le paiement sécurisé pour le moment." },
      { status: 500 },
    );
  }
}
