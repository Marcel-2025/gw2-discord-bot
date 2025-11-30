import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import config from "../configLoader.js";
import { getUserKey } from "../storage.js";
import { getAccount } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("healthcheck")
  .setDescription("Prüft Bot-, Railway- und GW2-API-Status.");

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const wsPing = interaction.client.ws.ping;

  // Erkennen, ob wir auf Railway laufen
  const onRailway =
    !!process.env.RAILWAY_ENVIRONMENT ||
    !!process.env.RAILWAY_PROJECT_ID ||
    !!process.env.RAILWAY_PUBLIC_DOMAIN;

  const runtimeEnv = onRailway ? "Railway" : "Lokal";

  // 1) Public GW2 API Check
  const gw2Base = config.gw2ApiBase || "https://api.guildwars2.com";
  let gw2ApiOk = false;
  let gw2ApiLatency = null;

  try {
    const start = Date.now();
    const res = await fetch(`${gw2Base}/v2/build`);
    gw2ApiLatency = Date.now() - start;
    gw2ApiOk = res.ok;
  } catch (e) {
    gw2ApiOk = false;
  }

  // 2) Optional: Account-API-Key testen, falls verknüpft
  const apiKey = getUserKey(interaction.user.id);
  let accountApiOk = null;

  if (apiKey) {
    try {
      await getAccount(apiKey);
      accountApiOk = true;
    } catch (e) {
      accountApiOk = false;
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("🩺 Healthcheck")
    .setDescription("Statusübersicht des Bots, der Umgebung und der GW2-API.")
    .addFields(
      {
        name: "🤖 Discord",
        value:
          `Status: **online**\n` +
          `WebSocket-Ping: **${wsPing}ms**`,
        inline: false
      },
      {
        name: "🖥 Laufzeit-Umgebung",
        value:
          `Modus: **${runtimeEnv}**\n` +
          `GW2 API Base: \`${gw2Base}\``,
        inline: false
      },
      {
        name: "🌐 GW2 Public API",
        value: gw2ApiOk
          ? `✅ Erreichbar\nLatenz: **${gw2ApiLatency}ms**`
          : "❌ Keine Verbindung zur GW2 Public API",
        inline: false
      },
      {
        name: "🔐 Dein GW2 Account-API-Key",
        value:
          apiKey === null
            ? "ℹ️ Kein API-Key verknüpft (`/linkaccount` nutzen)."
            : accountApiOk === true
              ? "✅ Account-API abrufbar."
              : accountApiOk === false
                ? "❌ Fehler beim Abrufen deines Accounts (API-Key prüfen?)."
                : "ℹ️ Kein Status verfügbar.",
        inline: false
      }
    )
    .setColor(0x00aeff)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
