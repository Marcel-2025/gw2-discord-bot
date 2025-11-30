import fetch from "node-fetch";
import config from "./configLoader.js";

const BASE = config.gw2ApiBase || "https://api.guildwars2.com";

// Hilfsfunktion für GW2-Requests
async function gw2Request(path, apiKey) {
  const headers = {};
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${BASE}${path}`, { headers });

  if (!res.ok) {
    throw new Error(`GW2 API error ${res.status} for ${path}`);
  }

  return res.json();
}

// Account-Infos
export const getAccount = (apiKey) => gw2Request("/v2/account", apiKey);

// Alle Charaktere
export const getCharacters = (apiKey) =>
  gw2Request("/v2/characters?ids=all", apiKey);

// Wallet / Währungen
export const getWallet = (apiKey) => gw2Request("/v2/account/wallet", apiKey);

// Gildeninfos (alle Gilden des Accounts, mit Fallback für 404)
export async function getGuildInfo(apiKey) {
  const acc = await getAccount(apiKey);

  if (!acc.guilds || acc.guilds.length === 0) {
    return [];
  }

  const guilds = [];

  for (const id of acc.guilds) {
    try {
      const g = await gw2Request(`/v2/guild/${id}`, apiKey);
      guilds.push(g);
    } catch (err) {
      if (String(err.message).includes("404")) {
        console.warn("Gilde nicht gefunden oder nicht sichtbar:", id);
        continue;
      }
      throw err;
    }
  }

  return guilds;
}

// 🔹 NEU: Gildenmitglieder (für /guildmembers)
export async function getGuildMembers(guildId, apiKey) {
  return gw2Request(`/v2/guild/${guildId}/members`, apiKey);
}

// 🔹 TP-Preis (für /tpprice)
export async function getTpPrice(itemId) {
  return gw2Request(`/v2/commerce/prices/${itemId}`, null);
}
