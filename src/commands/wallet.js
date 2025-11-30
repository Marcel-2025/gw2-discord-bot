import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getWallet } from "../gw2Api.js";

const CUR = {
  1: "Karma",
  2: "Laurels",
  3: "Badges of Honor",
  4: "Geistersplitter",
  6: "Gems"
};

export const data = new SlashCommandBuilder()
  .setName("wallet")
  .setDescription("Zeigt wichtige Währungen an.");

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
    const wallet = await getWallet(key);
    const lines = wallet
      .filter(c => CUR[c.id])
      .map(c => `• **${CUR[c.id]}**: ${c.value}`);

    const embed = new EmbedBuilder()
      .setTitle("💰 Wallet")
      .setDescription(lines.join("\n") || "Keine passenden Währungen gefunden.");

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen deiner Wallet.");
  }
}
