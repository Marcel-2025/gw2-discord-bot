import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getAccount, getGuildInfo, getCharacters } from "../gw2Api.js";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Zeigt ein kompaktes Profil deines GW2-Accounts.");

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
    const [account, guilds, chars] = await Promise.all([
      getAccount(apiKey),
      getGuildInfo(apiKey),
      getCharacters(apiKey)
    ]);

    // „Main-Gilde“ aktuell einfach: letzte Gilde im Array
    const mainGuild = guilds && guilds.length ? guilds[guilds.length - 1] : null;

    const embed = new EmbedBuilder()
      .setTitle(`🧙 Profil von ${account.name}`)
      .setColor(0x00aeff)
      .setTimestamp();

    if (mainGuild) {
      embed.setDescription(
        `Hauptgilde (vermutet): **${mainGuild.name} [${mainGuild.tag}]**`
      );
    } else {
      embed.setDescription("Keine Gilde gefunden.");
    }

    embed.addFields(
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
        value: String(chars.length ?? 0),
        inline: true
      },
      {
        name: "🏰 Gilden",
        value:
          guilds && guilds.length
            ? guilds.map((g) => `${g.name} [${g.tag}]`).join("\n")
            : "Keine Gilden",
        inline: false
      }
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply(
      "❌ Fehler beim Abrufen deines Profils. Bitte prüfe deinen API-Key."
    );
  }
}
