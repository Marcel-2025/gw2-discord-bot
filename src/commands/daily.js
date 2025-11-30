import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

const DAILY_URL = "https://api.guildwars2.com/v2/achievements/daily";

export const data = new SlashCommandBuilder()
  .setName("daily")
  .setDescription("Zeigt eine Übersicht der heutigen Dailies (Basisinfos).");

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const res = await fetch(DAILY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const daily = await res.json();

    const fields = [];

    const addCategory = (key, label) => {
      if (!daily[key]) return;
      fields.push({
        name: label,
        value: `${daily[key].length} Erfolge`,
        inline: true
      });
    };

    addCategory("pve", "🌲 PvE");
    addCategory("pvp", "⚔ PvP");
    addCategory("wvw", "🏹 WvW");
    addCategory("fractals", "🌀 Fraktale");
    addCategory("special", "⭐ Spezial");

    const embed = new EmbedBuilder()
      .setTitle("📅 Heutige Dailies")
      .setDescription("Basisübersicht der heutigen täglichen Erfolge.")
      .addFields(fields.length ? fields : [{
        name: "Keine Daten",
        value: "Konnte keine Dailies laden."
      }])
      .setFooter({ text: "Details / Namen können wir später noch einbauen 😈" })
      .setColor(0x00aeff)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Konnte die GW2 Dailies nicht abrufen.");
  }
}
