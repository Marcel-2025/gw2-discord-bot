import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount, getGuildInfo, getCharacters } from "../gw2Api.js";

function pickMainGuild(guilds) {
  if (!guilds || !guilds.length) return null;

  const preferredTags = ["KKev"];           // <- hier kannst du später deine Tags ändern
  const preferredNames = ["Käsekuchen Ev"]; // <- oder Namen ändern

  let main =
    guilds.find(g => preferredTags.includes(g.tag)) ||
    guilds.find(g => preferredNames.includes(g.name));

  if (main) return main;

  return [...guilds].sort((a, b) => (b.level ?? 0) - (a.level ?? 0))[0];
}

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Zeigt ein kompaktes Profil deines GW2-Accounts.");

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
    const [account, guilds, chars] = await Promise.all([
      getAccount(apiKey),
      getGuildInfo(apiKey),
      getCharacters(apiKey)
    ]);

    const mainGuild = pickMainGuild(guilds);

    const embed = new EmbedBuilder()
      .setTitle(`🧙 Profil von ${account.name}`)
      .setDescription(
        mainGuild
          ? `Hauptgilde: **${mainGuild.name} [${mainGuild.tag}]**`
          : "Keine Gilde gefunden."
      )
      .addFields(
        {
          name: "📅 Account erstellt",
          value: account.created || "Unbekannt",
          inline: true
        },
        {
          name: "🌍 Welt",
          value: String(account.world ?? "Unbekannt"),
          inline: true
        },
        {
          name: "🎚 Fraktalstufe",
          value: String(account.fractal_level ?? "?"),
          inline: true
        },
        {
          name: "⚔ WvW-Rang",
          value: String(account.wvw_rank ?? "?"),
          inline: true
        },
        {
          name: "👥 Charaktere",
          value: String(chars.length),
          inline: true
        },
        {
          name: "🏰 Gilden",
          value:
            guilds.length > 0
              ? guilds.map(g => `${g.name} [${g.tag}]`).join("\n")
              : "Keine Gilden",
          inline: false
        }
      )
      .setColor(0x00aeff)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Fehler beim Abrufen deines Profils. Bitte prüfe deinen API-Key.");
  }
}
