import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount, getGuildInfo, getGuildMembers } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("guildmembers")
  .setDescription("Zeigt eine Liste von Mitgliedern deiner Hauptgilde.");

export async function execute(interaction) {
  const apiKey = await getUserKey(interaction.user.id);

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

    if (!guilds || guilds.length === 0) {
      await interaction.editReply("Ich konnte keine Gilden zu deinem Account finden.");
      return;
    }

    // Erstmal simpel: erste Gilde als „Main“
    const mainGuild = guilds[0];

    const members = await getGuildMembers(mainGuild.id, apiKey);

    const lines = members.slice(0, 20).map((m) => {
      const joined = m.joined
        ? new Date(m.joined).toISOString().split("T")[0]
        : "Unbekannt";
      const name = m.name || "Unbekannt";
      return `• **${name}** – Rang: ${m.rank} – Beitritt: ${joined}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`👥 Mitglieder von ${mainGuild.name} [${mainGuild.tag}]`)
      .setDescription(lines.join("\n") || "Keine Mitglieder gefunden.")
      .setFooter({
        text: `Insgesamt: ${members.length} Mitglied(er)`
      })
      .setColor(0x2ecc71);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply(
      "❌ Fehler beim Abrufen der Gildenmitglieder. API-Key & Rechte prüfen?"
    );
  }
}
