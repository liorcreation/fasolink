import { NextResponse } from "next/server";
import { TRIAL_DAYS, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { firebasePublicConfig } from "@/lib/firebase-public-config";
import {
  commitFirestoreWrites,
  firestoreBase,
  firestoreString,
  getEdgeServiceAccount,
  getFirestoreAccessToken,
  getFirestoreDocument,
} from "@/lib/firestore-edge-admin";


function field(fields: Record<string, Record<string, unknown>>, name: string) {
  const value = fields[name];
  return value && "stringValue" in value ? String(value.stringValue) : "";
}

export async function POST(request: Request) {
  try {
    const { idToken, shopId, plan } = await request.json() as { idToken?: string; shopId?: string; plan?: string };
    if (!idToken || !shopId || !/^[a-zA-Z0-9_-]{1,128}$/.test(shopId)) {
      return NextResponse.json({ error: "Connexion ou boutique invalide." }, { status: 400 });
    }
    if (!SUBSCRIPTION_PLANS.some((item) => item.id === plan)) {
      return NextResponse.json({ error: "Formule invalide." }, { status: 400 });
    }
    const identityResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebasePublicConfig.apiKey)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }),
    });
    if (!identityResponse.ok) return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });
    const identity = await identityResponse.json() as { users?: Array<{ localId?: string }> };
    const uid = identity.users?.[0]?.localId;
    if (!uid) return NextResponse.json({ error: "Session utilisateur invalide." }, { status: 401 });

    const account = getEdgeServiceAccount();
    if (account.project_id !== firebasePublicConfig.projectId) throw new Error("Firebase service account project mismatch");
    const accessToken = await getFirestoreAccessToken(account);
    const shopPath = `${firestoreBase(account.project_id)}/shops/${encodeURIComponent(shopId)}`;
    const shop = await getFirestoreDocument(shopPath, accessToken);
    if (!shop || field(shop.fields, "owner_id") !== uid) return NextResponse.json({ error: "Cette boutique ne vous appartient pas." }, { status: 403 });
    if (field(shop.fields, "status") !== "pending") return NextResponse.json({ error: "L’essai gratuit est réservé à une boutique en attente." }, { status: 409 });
    if (!shop.updateTime) throw new Error("Shop update version is missing");
    if (await getFirestoreDocument(`${firestoreBase(account.project_id)}/subscriptions/${encodeURIComponent(shopId)}`, accessToken)) {
      return NextResponse.json({ error: "Cette boutique a déjà utilisé son essai gratuit." }, { status: 409 });
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + TRIAL_DAYS);
    const nowIso = now.toISOString();
    const expiresIso = expires.toISOString();
    const subscriptionPath = `${firestoreBase(account.project_id)}/subscriptions/${encodeURIComponent(shopId)}`;
    await commitFirestoreWrites(account.project_id, [
      {
        update: { name: subscriptionPath, fields: {
          shop_id: firestoreString(shopId), plan: firestoreString(plan!), status: firestoreString("trialing"),
          provider: { nullValue: null }, gateway: firestoreString("CinetPay"), amount: { integerValue: "0" },
          phone: { nullValue: null }, reference: firestoreString(`TRIAL-${shopId}`),
          trial_ends_at: firestoreString(expiresIso), started_at: firestoreString(nowIso),
          expires_at: firestoreString(expiresIso), created_at: firestoreString(nowIso), updated_at: firestoreString(nowIso),
        } },
        currentDocument: { exists: false },
      },
      {
        update: { name: shop.name, fields: { status: firestoreString("active"), updated_at: firestoreString(nowIso) } },
        updateMask: { fieldPaths: ["status", "updated_at"] },
        currentDocument: { updateTime: shop.updateTime },
      },
    ], accessToken);
    return NextResponse.json({ activated: true, expiresAt: expiresIso, reference: `TRIAL-${shopId}` });
  } catch (error) {
    console.error("[FasoLink] trial activation:", error);
    return NextResponse.json({ error: "Impossible d’activer l’essai maintenant. Réessayez." }, { status: 500 });
  }
}
