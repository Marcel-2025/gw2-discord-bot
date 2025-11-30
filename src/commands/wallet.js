import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserKey } from "../storage.js";
import { getWallet } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("wallet")
  .setDescription("Zeigt wichtige Währungen deines Accounts an.");

const CURRENCY_LABELS = {
  1: "Karma",
  2: "Laurels",
  3: "WvW-Marken",
  4: "Geistes-Scherben",
  5: "Gold",
  6: "Edelsteine"
};

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
    const wallet = await getWallet(apiKey);

    const lines = wallet
      .filter(c => CURRENCY_LABELS[c.id])
      .map(c => `• **${CURRENCY_LABELS[c.id]}**: ${c.value.toLocaleString("de-DE")}`);

    const embed = new EmbedBuilder()
      .setTitle("💰 Wallet")
      .setDescription(
        lines.length
          ? lines.join("\n")
          : "Es konnten keine unterstützten Währungen gefunden werden."
      )
      .setColor(0xf1c40f);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen deiner Wallet.");
  }
}
