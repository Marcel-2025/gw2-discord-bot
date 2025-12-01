import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount, getGuildInfo, getGuildMembers } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("guildmembers")
  .setDescription("Zeigt eine Liste von Mitgliedern deiner Hauptgilde.");

export async function execute(interaction) {
  const apiKey = getUserKey(interaction.user.id);
  if (!apiKey) {
    await interaction.reply({
      content: "Du hast noch keinen API-Key verknüpft. Nutze zuerst `/linkaccount`.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const account = await getAccount(apiKey);
    const guilds = await getGuildInfo(apiKey);

    if (!guilds.length) {
      await interaction.editReply("Ich konnte keine Gilden zu deinem Account finden.");
      return;
    }

    // aktuell: einfach erste Gilde als „Main“
    const mainGuild = guilds[0];

    let members;
    try {
      members = await getGuildMembers(mainGuild.id, apiKey);
    } catch (err) {
      const msg = String(err.message || "");
      if (msg.includes("403")) {
        await interaction.editReply(
          `❌ Dein API-Key hat keine Berechtigung, die Mitgliederliste von **${mainGuild.name} [${mainGuild.tag}]** zu lesen.\n` +
          "Stelle sicher, dass der Key das Recht `guilds` hat und dein Account genügend Rechte in der Gilde besitzt."
        );
        return;
      }
      console.error("Fehler bei getGuildMembers:", err);
      await interaction.editReply("❌ Fehler beim Abrufen der Gildenmitglieder.");
      return;
    }

    const lines = members.slice(0, 20).map(m => {
      const joined = m.joined ? new Date(m.joined).toISOString().split("T")[0] : "Unbekannt";
      return `• **${m.name || "Unbekannt"}** – Rang: ${m.rank} – Beitritt: ${joined}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`👥 Mitglieder von ${mainGuild.name} [${mainGuild.tag}]`)
      .setDescription(lines.join("\n") || "Keine Mitglieder gefunden.")
      .setFooter({ text: `Insgesamt: ${members.length} Mitglied(er)` })
      .setColor(0x2ecc71);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Allgemeiner Fehler beim Abrufen der Gildeninfos.");
  }
}
