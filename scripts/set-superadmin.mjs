import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFile } from "node:fs/promises";

const email = process.argv[2]?.trim().toLowerCase();
const raw = process.env.FIREBASE_SERVICE_ACCOUNT ?? await readFile(
  new URL("../firebase-service-account.json", import.meta.url),
  "utf8",
).catch(() => "");

if (!email || !raw) {
  console.error("Usage: npm run superadmin:set -- proprietaire@domaine.bf");
  console.error("Ajoutez FIREBASE_SERVICE_ACCOUNT à .env.local ou placez firebase-service-account.json à la racine.");
  process.exit(1);
}

if (!getApps().length) {
  const account = JSON.parse(raw);
  initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

const adminAuth = getAuth();
const user = await adminAuth.getUserByEmail(email);
await adminAuth.setCustomUserClaims(user.uid, {
  ...user.customClaims,
  admin: true,
  superAdmin: true,
});
console.log(`Rôle super administrateur activé pour ${email}.`);
console.log("Le propriétaire doit se déconnecter puis se reconnecter dans FasoLink.");
