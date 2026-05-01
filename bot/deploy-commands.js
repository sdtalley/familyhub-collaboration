// One-time script: registers /log slash command with Discord.
// Run once after deploying the Worker: node deploy-commands.js
require('dotenv').config();

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

fetch(
  `https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`,
  {
    method:  'PUT',
    headers: {
      Authorization:  `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      name:        'log',
      description: "Summarize and commit this channel's discussion since the last /log",
    }]),
  },
)
  .then(r => r.json())
  .then(data => {
    if (Array.isArray(data)) console.log(`Registered ${data.length} command(s). Done.`);
    else console.error('Error:', JSON.stringify(data, null, 2));
  })
  .catch(console.error);