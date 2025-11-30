import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Zeigt die aktuelle Bot-Latenz an.");

export async function execute(interaction) {
  const sent = Date.now();
  await interaction.reply({ content: "⏱ Ping wird gemessen...", ephemeral: true });

  const latency = Date.now() - sent;
  const wsPing = interaction.client.ws.ping;

  await interaction.editReply(
    `🏓 Pong!\n` +
    `• Antwort-Latenz: **${latency}ms**\n` +
    `• WebSocket-Ping: **${wsPing}ms**`
  );
}
