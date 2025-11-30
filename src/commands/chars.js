import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getCharacters } from "../gw2Api.js";

export const data = new SlashCommandBuilder().setName("chars").setDescription("Listet Charaktere");

export async function execute(interaction) {
  const key = getUserKey(interaction.user.id);
  if (!key) return interaction.reply({ content: "Bitte /linkaccount.", ephemeral: true });
  await interaction.deferReply();

  const chars = await getCharacters(key);
  const lines = chars.slice(0, 10).map(c=>`• **${c.name}** – ${c.profession}`);
  const embed = new EmbedBuilder().setTitle("Chars").setDescription(lines.join("\n"));
  await interaction.editReply({ embeds: [embed] });
}