import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_FILE = path.join(__dirname, "..", "userKeys.json");
let userKeys = {};

if (fs.existsSync(STORAGE_FILE)) {
  try { userKeys = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8")); }
  catch { userKeys = {}; }
}

function save() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(userKeys, null, 2));
}

export const setUserKey = (id, key) => { userKeys[id] = key; save(); };
export const getUserKey = id => userKeys[id] || null;
