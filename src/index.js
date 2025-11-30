import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import config from "./configLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents:[GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of files) {
  const filePath = path.join(commandsPath, file);
  // Windows-tauglicher dynamischer Import:
  const cmdModule = await import(pathToFileURL(filePath).href);

  if ("data" in cmdModule && "execute" in cmdModule) {
    client.commands.set(cmdModule.data.name, cmdModule);
    commands.push(cmdModule.data.toJSON());
  } else {
    console.warn(`Command-Datei ${file} exportiert keine data/execute.`);
  }
}

const rest = new REST({version:"10"}).setToken(config.discordToken);
await rest.put(
  config.guildId && config.guildId !== "OPTIONAL_TEST_GUILD_ID"
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId),
  { body: commands }
);

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten.",
        ephemeral: true
      });
    }
  }
});

client.once("ready", ()=>console.log("Bot ready:", client.user.tag));
client.login(config.discordToken);
