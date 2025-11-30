import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getUserKey } from "../storage.js";
import { getWallet } from "../gw2Api.js";

export const data = new SlashCommandBuilder().setName("wallet").setDescription("Währungen anzeigen");

const CUR = {1:"Karma",2:"Laurels",3:"Badges",4:"Spirit Shards",6:"Gems"};

export async function execute(interaction) {
  const key = getUserKey(interaction.user.id);
  if (!key) return interaction.reply({ content:"Bitte /linkaccount.", ephemeral:true});
  await interaction.deferReply();

  const wallet = await getWallet(key);
  const lines = wallet.filter(c=>CUR[c.id]).map(c=>`• **${CUR[c.id]}**: ${c.value}`);
  const embed = new EmbedBuilder().setTitle("Wallet").setDescription(lines.join("\n"));
  await interaction.editReply({ embeds:[embed] });
}