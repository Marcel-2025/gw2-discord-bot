import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import config from "../configLoader.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Zeigt den Verbindungsstatus des Bots (Discord / Railway / Config).");

export async function execute(interaction) {
  const wsPing = interaction.client.ws.ping;

  const onRailway =
    !!process.env.RAILWAY_ENVIRONMENT ||
    !!process.env.RAILWAY_PROJECT_ID ||
    !!process.env.RAILWAY_PUBLIC_DOMAIN;

  const runtimeEnv = onRailway ? "Railway" : "Lokal";

  const discordTokenSource = process.env.DISCORD_TOKEN
    ? "ENV-Variable (z. B. Railway)"
    : "config.json (lokal)";

  const clientIdSource = process.env.CLIENT_ID
    ? "ENV-Variable"
    : "config.json";

  const embed = new EmbedBuilder()
    .setTitle("📡 Verbindungsstatus")
    .setDescription("Überblick über den aktuellen Status des Bots.")
    .addFields(
      {
        name: "🤖 Discord",
        value:
          `Status: **online**\n` +
          `WebSocket-Ping: **${wsPing}ms**`
      },
      {
        name: "🖥 Laufzeit-Umgebung",
        value:
          `Modus: **${runtimeEnv}**\n` +
          `GW2 API Base: \`${config.gw2ApiBase}\``
      },
      {
        name: "🔐 Konfiguration",
        value:
          `discordToken: **${discordTokenSource}**\n` +
          `clientId: **${clientIdSource}**\n` +
          `guildId: \`${config.guildId || "nicht gesetzt"}\``
      }
    )
    .setColor(0x00aeff)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
