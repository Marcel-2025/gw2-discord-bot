import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserKey } from "../storage.js";
import { getGuildInfo } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("guildinfo")
  .setDescription("Zeigt Basisinformationen zu deinen Gilden.");

export async function execute(interaction) {
  const apiKey = getUserKey(interaction.user.id);
  if (!apiKey) {
    await interaction.reply({
      content: "Du hast noch keinen API-Key verknüpft. Nutze zuerst `/linkaccount`.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const guilds = await getGuildInfo(apiKey);

    if (!guilds.length) {
      await interaction.editReply("Ich habe keine Gilden zu deinem Account gefunden.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🏰 Deine Gilden")
      .setColor(0x3498db);

    guilds.forEach(g => {
      embed.addFields({
        name: `${g.name} [${g.tag}]`,
        value: `Level: **${g.level ?? "?"}**\nID: \`${g.id}\``
      });
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen der Gildeninformationen.");
  }
}
