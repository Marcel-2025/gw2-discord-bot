import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import config from "./configLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents:[GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const files = fs.readdirSync(commandsPath).filter(f=>f.endsWith(".js"));

for (const file of files) {
  const cmd = await import(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
  commands.push(cmd.data.toJSON());
}

const rest = new REST({version:"10"}).setToken(config.discordToken);
await rest.put(
  config.guildId && config.guildId !== "OPTIONAL_TEST_GUILD_ID"
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId),
  { body: commands }
);

client.on("interactionCreate", async i=>{
  if (!i.isChatInputCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (cmd) await cmd.execute(i);
});

client.once("ready", ()=>console.log("Bot ready:", client.user.tag));
client.login(config.discordToken);
