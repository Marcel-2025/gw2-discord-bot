import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount } from "../gw2Api.js";

export const data = new SlashCommandBuilder().setName("account").setDescription("Zeigt Account Infos");

export async function execute(interaction) {
  const key = getUserKey(interaction.user.id);
  if (!key) return interaction.reply({ content: "Bitte /linkaccount nutzen.", ephemeral: true });

  try {
    const acc = await getAccount(key);
    const embed = new EmbedBuilder()
      .setTitle(`Account ${acc.name}`)
      .addFields(
        { name: "Welt", value: String(acc.world), inline: true },
        { name: "Fraktal", value: String(acc.fractal_level), inline: true }
      );
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Fehler beim Abrufen.", ephemeral: true });
  }
}