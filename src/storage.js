import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./firestore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datei-Fallback
const STORAGE_FILE = path.join(__dirname, "..", "userKeys.json");
let userKeys = {};

// Datei einmal laden
if (fs.existsSync(STORAGE_FILE)) {
  try {
    userKeys = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
  } catch {
    userKeys = {};
  }
}

function saveFileStorage() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(userKeys, null, 2));
  } catch (err) {
    console.error("Fehler beim Schreiben von userKeys.json:", err);
  }
}

const COLLECTION = "discordUserKeys";

const useFirestore = !!db;

export async function setUserKey(userId, apiKey) {
  if (useFirestore) {
    try {
      await db.collection(COLLECTION).doc(userId).set(
        {
          apiKey,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return;
    } catch (err) {
      console.error("Fehler beim Speichern in Firestore, Fallback auf Datei:", err);
      // Fallback auf Datei
    }
  }

  // Datei-Fallback
  userKeys[userId] = apiKey;
  saveFileStorage();
}

export async function getUserKey(userId) {
  if (useFirestore) {
    try {
      const snap = await db.collection(COLLECTION).doc(userId).get();
      if (!snap.exists) return null;
      const data = snap.data();
      return data.apiKey || null;
    } catch (err) {
      console.error("Fehler beim Lesen aus Firestore, Fallback auf Datei:", err);
      // Fallback
    }
  }

  // Datei-Fallback
  return userKeys[userId] || null;
}
