import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserKey } from "../storage.js";
import { getCharacters } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("chars")
  .setDescription("Listet deine Charaktere (max. 15).");

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
    const chars = await getCharacters(apiKey);

    if (!chars.length) {
      await interaction.editReply("Ich habe keine Charaktere gefunden.");
      return;
    }

    const lines = chars.slice(0, 15).map(c => {
      const lvl = c.level ?? "?";
      const prof = c.profession ?? "Unbekannt";
      const race = c.race ?? "Unbekannt";
      return `• **${c.name}** – ${prof} (${race}, Stufe ${lvl})`;
    });

    const embed = new EmbedBuilder()
      .setTitle("👥 Deine Charaktere")
      .setDescription(lines.join("\n"))
      .setFooter({ text: `Insgesamt: ${chars.length} Charakter(e)` })
      .setColor(0x9b59b6);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen deiner Charaktere.");
  }
}
