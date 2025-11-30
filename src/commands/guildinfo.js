import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getGuildInfo } from "../gw2Api.js";

export const data = new SlashCommandBuilder().setName("guildinfo").setDescription("Gilden anzeigen");

export async function execute(interaction) {
  const key = getUserKey(interaction.user.id);
  if (!key) return interaction.reply({ content:"Bitte /linkaccount.", ephemeral:true});
  await interaction.deferReply();

  const guilds = await getGuildInfo(key);
  const embed = new EmbedBuilder().setTitle("Gilden");
  guilds.forEach(g=>embed.addFields({ name:`${g.name} [${g.tag}]`, value:`Level ${g.level}` }));
  await interaction.editReply({ embeds:[embed] });
}