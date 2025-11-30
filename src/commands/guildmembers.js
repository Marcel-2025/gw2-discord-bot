import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount, getGuildInfo, getGuildMembers } from "../gw2Api.js";

function pickMainGuild(guilds) {
  if (!guilds || !guilds.length) return null;

  const preferredTags = ["KKev"];
  const preferredNames = ["Käsekuchen Ev"];

  let main =
    guilds.find(g => preferredTags.includes(g.tag)) ||
    guilds.find(g => preferredNames.includes(g.name));

  if (main) return main;

  return [...guilds].sort((a, b) => (b.level ?? 0) - (a.level ?? 0))[0];
}

export const data = new SlashCommandBuilder()
  .setName("guildmembers")
  .setDescription("Zeigt eine Liste von Mitgliedern deiner Hauptgilde.");

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
    const account = await getAccount(apiKey);
    const guilds = await getGuildInfo(apiKey);

    if (!guilds.length) {
      await interaction.editReply("Ich konnte keine Gilden zu deinem Account finden.");
      return;
    }

    const mainGuild = pickMainGuild(guilds);
    if (!mainGuild) {
      await interaction.editReply("Ich konnte keine Hauptgilde bestimmen.");
      return;
    }

    const members = await getGuildMembers(mainGuild.id, apiKey);

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
    await interaction.editReply("❌ Fehler beim Abrufen der Gildenmitglieder. API-Key & Rechte prüfen?");
  }
}
