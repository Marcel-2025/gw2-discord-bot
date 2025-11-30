import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Zeigt alle verfügbaren Befehle dieses Bots an.");

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("📘 Verfügbare Befehle")
    .setDescription("Hier sind alle Commands, die du nutzen kannst:")
    .addFields(
      { name: "/help", value: "Zeigt diese Hilfe an." },
      { name: "/linkaccount", value: "Verknüpft deinen GW2-Account per API-Key." },
      { name: "/account", value: "Zeigt GW2-Account Infos." },
      { name: "/chars", value: "Listet deine Charaktere." },
      { name: "/wallet", value: "Zeigt wichtige Währungen." },
      { name: "/guildinfo", value: "Zeigt Infos zu deinen Gilden." }
    )
    .setColor(0x0099ff);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
