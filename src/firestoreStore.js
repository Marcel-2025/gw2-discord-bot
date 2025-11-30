import admin from "firebase-admin";

let app;
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT ENV ist nicht gesetzt.");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  app = admin.app();
}

const db = admin.firestore();
const collection = db.collection("gw2UserKeys");

export async function setUserKeyFirestore(discordUserId, apiKey) {
  await collection.doc(discordUserId).set(
    {
      apiKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function getUserKeyFirestore(discordUserId) {
  const doc = await collection.doc(discordUserId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return data.apiKey || null;
}
