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
  if (!acc.guilds?.length) return [];
  const guildIds = acc.guilds.join(",");
  return gw2Request(`/v2/guild?ids=${guildIds}`, apiKey);
}
