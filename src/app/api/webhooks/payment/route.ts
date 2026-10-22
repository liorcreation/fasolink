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
import {
  assertTransactionIntegrity,
  getCinetPayConfig,
  isValidTransactionId,
  planToMonths,
  processWebhookNotification,
  verifyTransaction,
  verifyWebhookToken,
} from "@/lib/payments/cinetpay";

type FirestoreValue = Record<string, unknown>;
type FirestoreDocument = { name: string; updateTime?: string; fields: Record<string, FirestoreValue> };

function readField(fields: Record<string, FirestoreValue>, key: string) {
  const value = fields[key];
  if (!value) return null;
  if ("stringValue" in value) return String(value.stringValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  return null;
}

export async function POST(request: Request) {
  let config;
  try {
    config = getCinetPayConfig();
  } catch (error) {
    console.error("[FasoLink Security] CinetPay config missing:", error);
    return NextResponse.json({ error: "Service de paiement non disponible" }, { status: 503 });
  }

  try {
    // 1. Cloner la requête pour pouvoir lire le corps brut pour HMAC
    const clone = request.clone();
    const rawBody = await clone.text();

    // 2. Extraire les identifiants de la notification
    const { transactionId, siteId: notifiedSiteId, signature } = await processWebhookNotification(request);

    // 3. Validation de signature HMAC (si configurée)
    const isSignatureValid = await verifyWebhookToken(rawBody, signature, config.secretKey);
    if (!isSignatureValid) {
      console.warn("[FasoLink Security] Webhook signature invalide:", transactionId);
      return NextResponse.json({ error: "Signature webhook non authentifiée" }, { status: 401 });
    }

    // 4. Validation des identifiants
    if (!transactionId || !isValidTransactionId(transactionId) || notifiedSiteId !== config.siteId) {
      return NextResponse.json({ error: "Notification CinetPay invalide ou site incorrect" }, { status: 400 });
    }

    // 5. DOUBLE APPEL SERVEUR OBLIGATOIRE (Zéro confiance dans le webhook)
    const verification = await verifyTransaction(config, transactionId);
    if (!verification.isAccepted || verification.status !== "ACCEPTED") {
      return NextResponse.json({ received: true, activated: false, status: verification.status });
    }

    // 6. Récupération de l'abonnement en base Firestore
    const account = getEdgeServiceAccount();
    if (account.project_id !== firebasePublicConfig.projectId) {
      throw new Error("Firebase service account project mismatch");
    }
    const token = await getFirestoreAccessToken(account);

    const rows = await runFirestoreQuery(account, token, {
      from: [{ collectionId: "subscriptions" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "reference" },
          op: "EQUAL",
          value: firestoreString(transactionId),
        },
      },
      limit: 1,
    });

    const subscription = rows.find((row) => row.document)?.document as FirestoreDocument | undefined;
    if (!subscription) {
      console.warn("[FasoLink Security] Transaction orpheline non trouvée:", transactionId);
      return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
    }

    const data = subscription.fields;
    const shopId = readField(data, "shop_id");
    const amount = readField(data, "amount");
    const plan = readField(data, "plan");
    const months = planToMonths(String(plan));
    const status = readField(data, "status");

    // 7. VERROU D'IDEMPOTENCE STRICT
    // Si déjà activé => réponse immédiate sans toucher aux dates
    if (status === "active") {
      return NextResponse.json({ received: true, activated: true, idempotent: true });
    }

    // Si pas en attente ou données incomplètes => rejet
    if (status !== "pending" || typeof shopId !== "string" || typeof amount !== "number" || !months) {
      return NextResponse.json({ error: "Abonnement dans un état non payable" }, { status: 409 });
    }

    // 8. CONTRÔLE STRICT D'INTÉGRITÉ DU MONTANT ET DE LA DEVISE (Anti-Fraude)
    assertTransactionIntegrity(verification, {
      transactionId,
      siteId: config.siteId,
      amount,
      currency: "XOF",
    });

    // 9. Vérification du statut de la boutique
    const shop = await getFirestoreDocument(
      `${firestoreBase(account.project_id)}/shops/${encodeURIComponent(shopId)}`,
      token,
    );
    if (!shop || !subscription.updateTime || !shop.updateTime) {
      throw new Error("Version de document requise introuvable");
    }
    if (readField(shop.fields, "status") === "suspended") {
      return NextResponse.json(
        { error: "Boutique suspendue; paiement reçu mais activation bloquée par sécurité" },
        { status: 409 },
      );
    }

    // 10. Calcul des dates d'échéance
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + months * 30);
    const isoNow = now.toISOString();
    const isoExpiry = expiry.toISOString();

    // 11. ÉCRITURE TRANSACTIONNELLE ATOMIQUE (Idempotence garantie par Firestore updateTime)
    await commitFirestoreWrites(
      account.project_id,
      [
        {
          update: {
            name: subscription.name,
            fields: {
              status: firestoreString("active"),
              started_at: firestoreString(isoNow),
              expires_at: firestoreString(isoExpiry),
              updated_at: firestoreString(isoNow),
            },
          },
          updateMask: { fieldPaths: ["status", "started_at", "expires_at", "updated_at"] },
          currentDocument: { updateTime: subscription.updateTime },
        },
        {
          update: {
            name: shop.name,
            fields: {
              status: firestoreString("active"),
              updated_at: firestoreString(isoNow),
            },
          },
          updateMask: { fieldPaths: ["status", "updated_at"] },
          currentDocument: { updateTime: shop.updateTime },
        },
      ],
      token,
    );

    return NextResponse.json({ received: true, activated: true });
  } catch (error) {
    console.error("[FasoLink Security] Webhook processing error:", error);
    return NextResponse.json({ error: "Erreur de traitement sécurisé du paiement" }, { status: 500 });
  }
}
