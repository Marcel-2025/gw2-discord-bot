import { SlashCommandBuilder } from "discord.js";
import { setUserKey } from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("linkaccount")
  .setDescription("Verknüpft deinen GW2-Account über deinen API-Key.")
  .addStringOption(o=>o.setName("apikey").setDescription("GW2 API Key").setRequired(true));

export async function execute(interaction) {
  const key = interaction.options.getString("apikey", true);
  if (key.length < 30) {
    await interaction.reply({ content: "Der API-Key wirkt zu kurz, bitte prüfe ihn nochmal.", ephemeral: true });
    return;
  }
  setUserKey(interaction.user.id, key);
  await interaction.reply({ content: "✅ API-Key gespeichert!", ephemeral: true });
}