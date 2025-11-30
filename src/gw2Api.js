import fetch from "node-fetch";
import config from "./configLoader.js";

const BASE = config.gw2ApiBase || "https://api.guildwars2.com";

async function gw2Request(path, apiKey) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!res.ok) throw new Error(`GW2 API error ${res.status} for ${path}`);
  return res.json();
}

export const getAccount = apiKey => gw2Request("/v2/account", apiKey);
export const getCharacters = apiKey => gw2Request("/v2/characters?ids=all", apiKey);
export const getWallet = apiKey => gw2Request("/v2/account/wallet", apiKey);

export async function getGuildInfo(apiKey) {
  const acc = await getAccount(apiKey);

  // Falls der Account in keiner Gilde ist:
  if (!acc.guilds || acc.guilds.length === 0) return [];

  const guilds = [];

  for (const id of acc.guilds) {
    try {
      // Einzelne Gilde korrekt abrufen
      const guild = await gw2Request(`/v2/guild/${id}`, apiKey);
      guilds.push(guild);
    } catch (err) {
      // Wenn eine Gilde 404 ist, loggen wir nur und machen weiter
      if (String(err.message).includes("404")) {
        console.warn("Gilde nicht gefunden oder nicht sichtbar:", id);
        continue;
      }
      // Andere Fehler nach oben durchreichen
      throw err;
    }
  }

  return guilds;
}

