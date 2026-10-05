import { getIdTokenResult } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore/lite";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { COLLECTIONS, auth, db, isFirebaseConfigured, storage } from "@/lib/firebase";
import type {
  Shop,
  ShopStatus,
  AdminAuditLog,
  Subscription,
  SubscriptionPlan,
  VerificationRequest,
  VerificationRequestStatus,
} from "@/lib/database.types";

function withId<T>(snapshot: { id: string; data: () => Record<string, unknown> }): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export async function assertAdmin(): Promise<void> {
  // L’ancien back-office est désormais fusionné dans l’espace Super Admin.
  await assertSuperAdmin();
}

export async function assertSuperAdmin(): Promise<void> {
  if (!isFirebaseConfigured || !auth.currentUser) {
    throw new Error("Accès réservé au super administrateur connecté.");
  }
  const token = await getIdTokenResult(auth.currentUser, true);
  if (token.claims.superAdmin !== true) {
    throw new Error("Votre compte ne possède pas les droits super administrateur.");
  }
}

export async function getAdminCapabilities(): Promise<{ admin: boolean; superAdmin: boolean }> {
  if (!isFirebaseConfigured || !auth.currentUser) return { admin: false, superAdmin: false };
  const token = await getIdTokenResult(auth.currentUser, true);
  return {
    admin: token.claims.admin === true,
    superAdmin: token.claims.superAdmin === true,
  };
}

export async function fetchAdminSnapshot(): Promise<{
  shops: Shop[];
  verifications: VerificationRequest[];
}> {
  await assertAdmin();
  const [shops, verifications] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.shops)),
    getDocs(collection(db, COLLECTIONS.verifications)),
  ]);
  return {
    shops: shops.docs
      .map((snapshot) => withId<Shop>(snapshot))
      .filter((shop) => shop.category === "electronique"),
    verifications: verifications.docs.map((snapshot) =>
      withId<VerificationRequest>(snapshot),
    ),
  };
}

export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  await assertSuperAdmin();
  const snapshot = await getDocs(collection(db, COLLECTIONS.subscriptions));
  return snapshot.docs.map((item) => withId<Subscription>(item));
}

export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  await assertSuperAdmin();
  const snapshot = await getDocs(
    query(collection(db, "admin_audit_logs"), orderBy("created_at", "desc"), limit(25)),
  );
  return snapshot.docs.map((item) => withId<AdminAuditLog>(item));
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export async function grantShopLicense(input: {
  shopId: string;
  plan: SubscriptionPlan;
  months: number;
  amount: number;
  reason: string;
  currentSubscriptions: Subscription[];
}): Promise<void> {
  await assertSuperAdmin();
  if (!auth.currentUser) throw new Error("Session super administrateur expirée.");
  if (!Number.isInteger(input.months) || input.months < 1 || input.months > 24) {
    throw new Error("La durée doit être comprise entre 1 et 24 mois.");
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("Le montant saisi est invalide.");
  }
  const reason = input.reason.trim();
  if (reason.length < 8) throw new Error("Précisez le motif (8 caractères minimum).");

  const now = new Date();
  const currentExpiry = input.currentSubscriptions
    .filter((item) => item.shop_id === input.shopId && ["active", "trialing"].includes(item.status))
    .map((item) => item.expires_at ? new Date(item.expires_at) : null)
    .filter((expiry): expiry is Date => Boolean(expiry && !Number.isNaN(expiry.getTime()) && expiry > now))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const startsAt = currentExpiry ?? now;
  const expiresAt = addMonths(startsAt, input.months);
  const batch = writeBatch(db);
  const subscriptionRef = doc(collection(db, COLLECTIONS.subscriptions));
  const auditRef = doc(collection(db, "admin_audit_logs"));
  const nowIso = now.toISOString();
  const startsIso = startsAt.toISOString();
  const expiresIso = expiresAt.toISOString();
  const reference = `LIC-${now.getTime().toString(36).toUpperCase()}-${subscriptionRef.id.slice(0, 5).toUpperCase()}`;

  batch.set(subscriptionRef, {
    shop_id: input.shopId,
    plan: input.plan,
    status: "active",
    provider: null,
    gateway: "manual_superadmin",
    amount: input.amount,
    phone: null,
    reference,
    trial_ends_at: null,
    started_at: startsIso,
    expires_at: expiresIso,
    created_at: nowIso,
    updated_at: nowIso,
    license_type: input.amount === 0 ? "complimentary" : "manual_paid",
    granted_by: auth.currentUser.uid,
    grant_reason: reason,
  });
  batch.update(doc(db, COLLECTIONS.shops, input.shopId), { status: "active", updated_at: nowIso });
  batch.set(auditRef, {
    action: "license_granted",
    actor_uid: auth.currentUser.uid,
    shop_id: input.shopId,
    subscription_id: subscriptionRef.id,
    reason,
    details: JSON.stringify({ plan: input.plan, months: input.months, amount: input.amount, starts_at: startsIso, expires_at: expiresIso, reference }),
    created_at: nowIso,
  });
  await batch.commit();
}

export async function revokeShopLicense(input: {
  subscription: Subscription;
  reason: string;
  currentSubscriptions: Subscription[];
}): Promise<void> {
  await assertSuperAdmin();
  if (!auth.currentUser) throw new Error("Session super administrateur expirée.");
  if (input.subscription.status !== "active" && input.subscription.status !== "trialing") {
    throw new Error("Cette licence n'est plus active.");
  }
  const reason = input.reason.trim();
  if (reason.length < 8) throw new Error("Précisez le motif (8 caractères minimum).");

  const now = new Date();
  const nowIso = now.toISOString();
  const anotherValidLicense = input.currentSubscriptions.some((item) =>
    item.id !== input.subscription.id && item.shop_id === input.subscription.shop_id &&
    ["active", "trialing"].includes(item.status) &&
    (!item.started_at || new Date(item.started_at) <= now) &&
    Boolean(item.expires_at && new Date(item.expires_at) > now),
  );
  const batch = writeBatch(db);
  const subscriptionRef = doc(db, COLLECTIONS.subscriptions, input.subscription.id);
  const auditRef = doc(collection(db, "admin_audit_logs"));
  batch.update(subscriptionRef, {
    status: "cancelled",
    cancelled_at: nowIso,
    cancelled_by: auth.currentUser.uid,
    cancellation_reason: reason,
    updated_at: nowIso,
  });
  batch.update(doc(db, COLLECTIONS.shops, input.subscription.shop_id), {
    status: anotherValidLicense ? "active" : "suspended",
    updated_at: nowIso,
  });
  batch.set(auditRef, {
    action: "license_revoked",
    actor_uid: auth.currentUser.uid,
    shop_id: input.subscription.shop_id,
    subscription_id: input.subscription.id,
    reason,
    details: JSON.stringify({ previous_status: input.subscription.status, another_valid_license: anotherValidLicense }),
    created_at: nowIso,
  });
  await batch.commit();
}

export async function reviewVerification(
  request: VerificationRequest,
  status: VerificationRequestStatus,
  rejectionReason?: string,
): Promise<void> {
  await assertAdmin();
  const now = new Date().toISOString();
  await updateDoc(doc(db, COLLECTIONS.verifications, request.id), {
    status,
    rejection_reason: status === "rejected" ? rejectionReason ?? null : null,
    updated_at: now,
  });
  await updateDoc(doc(db, COLLECTIONS.shops, request.shop_id), {
    verification_status: status === "approved" ? "verified" : "unverified",
    updated_at: now,
  });
  if (status === "approved") {
    await Promise.allSettled(
      [request.recto_path, request.verso_path]
        .filter((path): path is string => Boolean(path))
        .map((path) => deleteObject(ref(storage, path))),
    );
  }
}

export async function getVerificationMedia(request: VerificationRequest) {
  await assertAdmin();
  const [recto, verso] = await Promise.all([
    getDownloadURL(ref(storage, request.recto_path)),
    request.verso_path
      ? getDownloadURL(ref(storage, request.verso_path))
      : Promise.resolve(null),
  ]);
  return { recto, verso };
}

export async function updateShopStatus(
  shopId: string,
  status: ShopStatus,
): Promise<void> {
  await assertAdmin();
  await updateDoc(doc(db, COLLECTIONS.shops, shopId), {
    status,
    updated_at: new Date().toISOString(),
  });
}
