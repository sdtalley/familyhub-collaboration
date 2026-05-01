// Run once to register /log as a guild slash command:
//   node deploy-commands.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('log')
    .setDescription("Summarize and commit this channel's discussion since the last /log")
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering /log command...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('Done. /log is now available in your Discord server.');
  } catch (err) {
    console.error(err);
  }
})();