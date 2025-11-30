import admin from "firebase-admin";

let db = null;

if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    db = admin.firestore();
    console.log("✅ Firestore initialisiert (Service Account).");
  } catch (err) {
    console.error("❌ Fehler beim Initialisieren von Firestore:", err);
  }
} else {
  console.warn("⚠️ GCP_SERVICE_ACCOUNT_JSON nicht gesetzt – Firestore wird nicht verwendet.");
}

export { db };
