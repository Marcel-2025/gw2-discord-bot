import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Erst versuchen, config.json zu laden (für lokale Entwicklung)
let fileConfig = {};
try {
  const configPath = path.join(__dirname, "..", "config.json");
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (err) {
  console.warn("Konnte config.json nicht laden, nutze nur ENV Variablen:", err.message);
}

// Dann ENV-Variablen drüberlegen (z.B. für Railway)
const config = {
  discordToken: process.env.DISCORD_TOKEN ?? fileConfig.discordToken,
  clientId: process.env.CLIENT_ID ?? fileConfig.clientId,
  guildId: process.env.GUILD_ID ?? fileConfig.guildId,
  gw2ApiBase: process.env.GW2_API_BASE ?? fileConfig.gw2ApiBase ?? "https://api.guildwars2.com"
};

if (!config.discordToken) {
  console.warn("⚠️ Kein Discord Token gefunden (weder ENV noch config.json).");
}

if (!config.clientId) {
  console.warn("⚠️ Keine Client ID gefunden (weder ENV noch config.json). Slash Commands können nicht registriert werden.");
}

export default config;
