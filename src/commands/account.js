import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("account")
  .setDescription("Zeigt Account Infos");

export async function execute(interaction) {
  const key = await getUserKey(interaction.user.id); // 👈 wichtig: await
  if (!key) {
    await interaction.reply({
      content: "Du hast noch keinen API-Key verknüpft. Nutze zuerst `/linkaccount`.",
      ephemeral: true
    });
    return;
  }

  try {
    const acc = await getAccount(key);
    const embed = new EmbedBuilder()
      .setTitle(`Account ${acc.name}`)
      .addFields(
        { name: "Welt", value: String(acc.world), inline: true },
        { name: "Fraktal", value: String(acc.fractal_level), inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "Fehler beim Abrufen deines Accounts. Bitte Key prüfen.",
      ephemeral: true
    });
  }
}
