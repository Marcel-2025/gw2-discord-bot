import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const config = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  gw2ApiBase: process.env.GW2_API_BASE || "https://api.guildwars2.com"
};

export default config;

