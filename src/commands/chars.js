import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getCharacters } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("chars")
  .setDescription("Listet deine Charaktere (max. 10).");

export async function execute(interaction) {
  const key = await getUserKey(interaction.user.id);
  if (!key) {
    await interaction.reply({
      content: "Du hast noch keinen API-Key verknüpft. Nutze zuerst `/linkaccount`.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const chars = await getCharacters(key);
    const lines = chars.slice(0, 10).map(c => `• **${c.name}** – ${c.profession} (${c.level})`);

    const embed = new EmbedBuilder()
      .setTitle("👥 Deine Charaktere")
      .setDescription(lines.join("\n") || "Keine Charaktere gefunden.");

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen deiner Charaktere.");
  }
}
