import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const PROF_MAP = {
  guardian: "Guardian",
  guard: "Guardian",
  firebrand: "Guardian",
  necro: "Necromancer",
  necromancer: "Necromancer",
  reaper: "Necromancer",
  warrior: "Warrior",
  war: "Warrior",
  mesmer: "Mesmer",
  chrono: "Mesmer",
  thief: "Thief",
  ranger: "Ranger",
  engineer: "Engineer",
  engi: "Engineer",
  elementalist: "Elementalist",
  ele: "Elementalist",
  revenant: "Revenant",
  rev: "Revenant"
};

export const data = new SlashCommandBuilder()
  .setName("build")
  .setDescription("Zeigt Build-Links für eine Klasse an.")
  .addStringOption(o =>
    o
      .setName("klasse")
      .setDescription("Klasse (z.B. guardian, necro, ele, ranger...)")
      .setRequired(true)
  )
  .addStringOption(o =>
    o
      .setName("content")
      .setDescription("Content-Typ")
      .setRequired(true)
      .addChoices(
        { name: "Raids / Strikes", value: "raid" },
        { name: "Fraktale", value: "fractal" },
        { name: "Open World", value: "openworld" }
      )
  );

export async function execute(interaction) {
  const klasseRaw = interaction.options.getString("klasse", true).toLowerCase();
  const content = interaction.options.getString("content", true);

  const profession = PROF_MAP[klasseRaw];
  if (!profession) {
    await interaction.reply({
      content: "Ich kenne diese Klasse nicht. Versuch z.B. `guardian`, `necro`, `ele`…",
      ephemeral: true
    });
    return;
  }

  // Simpler Link-Mapping – später können wir das feinjustieren
  const scBase = "https://snowcrows.com";
  const mbBase = "https://metabattle.com/wiki";
  const hsBase = "https://hardstuck.gg";

  let desc = "";

  if (content === "raid" || content === "fractal") {
    desc += `**Snow Crows** (High-End PvE):\n${scBase}\n\n`;
    desc += `**Hardstuck** (Raids/Fraktale Builds):\n${hsBase}\n\n`;
  }

  if (content === "openworld") {
    desc += `**MetaBattle – Open World Builds:**\n${mbBase}/Open_World\n\n`;
  }

  desc += "_Hinweis: Wir können später noch direkt auf spezifische Builds für Elite-Specs linken._";

  const embed = new EmbedBuilder()
    .setTitle(`📜 Build-Empfehlungen für ${profession}`)
    .setDescription(desc)
    .setFooter({ text: `Content: ${content}` })
    .setColor(0xf1c40f);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
