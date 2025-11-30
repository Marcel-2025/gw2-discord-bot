import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("lfgmessage")
  .setDescription("Erstellt eine LFG-Nachricht zum Copy & Paste.")
  .addStringOption(o =>
    o
      .setName("typ")
      .setDescription("Content-Typ")
      .setRequired(true)
      .addChoices(
        { name: "Fraktale", value: "fractals" },
        { name: "Raids", value: "raids" },
        { name: "Strikes", value: "strikes" },
        { name: "Open World", value: "ow" }
      )
  )
  .addStringOption(o =>
    o
      .setName("beschreibung")
      .setDescription("Kurze Beschreibung (z.B. T4+CM, Trainingsrun, kp etc.)")
      .setRequired(true)
  );

export async function execute(interaction) {
  const typ = interaction.options.getString("typ", true);
  const beschreibung = interaction.options.getString("beschreibung", true);

  let prefix = "";
  if (typ === "fractals") prefix = "[Fraktale]";
  if (typ === "raids") prefix = "[Raid]";
  if (typ === "strikes") prefix = "[Strike]";
  if (typ === "ow") prefix = "[Open World]";

  const msg =
    `${prefix} ${beschreibung}\n` +
    `📣 /w für Invite\n` +
    `🔢 Ping Rolle / LI / KP falls benötigt\n` +
    `✅ Voice optional (je nach Gruppe)\n`;

  await interaction.reply({
    content:
      "Hier ist deine LFG-Vorlage – einfach kopieren und in LFG / Map-Chat posten:\n```" +
      msg +
      "```",
    ephemeral: true
  });
}
