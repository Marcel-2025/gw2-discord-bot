import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUserKeyFirestore, setUserKeyFirestore } from "./firestoreStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_FILE = path.join(__dirname, "..", "userKeys.json");
let userKeys = {};
let useFirestore = false;

// Entscheiden: Firestore oder Datei
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  useFirestore = true;
  console.log("🔐 UserKey-Storage: Firestore aktiviert.");
} else {
  console.log("💾 UserKey-Storage: Fallback auf userKeys.json.");
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      userKeys = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
    } catch {
      userKeys = {};
    }
  }
}

function saveToFile() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(userKeys, null, 2));
}

// 🔹 nach außen weiterhin dieselbe API, aber async
export async function setUserKey(discordUserId, apiKey) {
  if (useFirestore) {
    return setUserKeyFirestore(discordUserId, apiKey);
  } else {
    userKeys[discordUserId] = apiKey;
    saveToFile();
  }
}

export async function getUserKey(discordUserId) {
  if (useFirestore) {
    return getUserKeyFirestore(discordUserId);
  } else {
    return userKeys[discordUserId] || null;
  }
}
