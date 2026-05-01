require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Octokit } = require('@octokit/rest');
const Anthropic = require('@anthropic-ai/sdk');

const REPO_OWNER = 'sdtalley';
const REPO_NAME  = 'familyhub-collaboration';

const discord  = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // requires privileged intent in Dev Portal
  ],
});
const octokit   = new Octokit({ auth: process.env.GITHUB_TOKEN });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── GitHub helpers ────────────────────────────────────────────────────────────

async function ghGet(path) {
  const { data } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path });
  return {
    json: JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')),
    sha:  data.sha,
  };
}

async function ghCommit(path, json, message, sha) {
  await octokit.repos.createOrUpdateFileContents({
    owner:   REPO_OWNER,
    repo:    REPO_NAME,
    path,
    message,
    content: Buffer.from(JSON.stringify(json, null, 2) + '\n').toString('base64'),
    sha,
  });
}

// ── Discord message fetch ─────────────────────────────────────────────────────

// Convert a JS timestamp (ms) to a Discord snowflake so we can use the
// `after` fetch option instead of filtering client-side.
const DISCORD_EPOCH = 1420070400000n;
function msToSnowflake(ms) {
  return String((BigInt(Math.floor(ms)) - DISCORD_EPOCH) << 22n);
}

async function fetchMessagesSince(channel, sinceMs) {
  const options = { limit: 100 };
  if (sinceMs) options.after = msToSnowflake(sinceMs);

  const collection = await channel.messages.fetch(options);
  const messages = [];
  for (const msg of collection.values()) {
    if (!msg.author.bot && msg.content.trim()) messages.push(msg);
  }
  // sort oldest → newest for readable transcript
  messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  return messages;
}

// ── /log handler ──────────────────────────────────────────────────────────────

async function handleLog(interaction) {
  await interaction.deferReply();

  const channel     = interaction.channel;
  const channelId   = interaction.channelId;
  const channelName = channel.name;

  // 1. Load bot state
  const { json: botState, sha: botStateSha } = await ghGet('data/bot-state.json');
  const lastMs = botState.channels[channelId]
    ? new Date(botState.channels[channelId]).getTime()
    : null;

  // 2. Fetch messages
  const messages = await fetchMessagesSince(channel, lastMs);
  if (!messages.length) {
    await interaction.editReply('No new messages since the last `/log`. Nothing to commit.');
    return;
  }

  // 3. Build transcript
  const transcript   = messages.map(m => `[${m.createdAt.toISOString()}] ${m.author.username}: ${m.content}`).join('\n');
  const participants = [...new Set(messages.map(m => m.author.username))];

  // 4. Summarize with Claude
  let topic, summary, tags;
  try {
    const res = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role:    'user',
        content: `You are logging a Discord discussion for a shared dev project. Two developers (sdtalley and kjwheeler) are independently building a Skylight-style family calendar display and use this Discord to compare decisions.

Summarize this #${channelName} discussion in 2-4 sentences. Focus on decisions made, approaches compared, or open questions raised. Then provide a short topic title (4-6 words) and 2-4 lowercase single-word tags.

Respond with valid JSON only — no markdown fences, no commentary:
{"topic":"...","summary":"...","tags":["...","..."]}

Discussion:
${transcript}`,
      }],
    });

    const parsed = JSON.parse(res.content[0].text.trim());
    topic   = parsed.topic;
    summary = parsed.summary;
    tags    = Array.isArray(parsed.tags) ? parsed.tags : [];
  } catch {
    // Fallback if Claude call or parse fails
    topic   = `${channelName} discussion`;
    summary = `${messages.length} messages exchanged in #${channelName}.`;
    tags    = [channelName];
  }

  // 5. Load and update discussions.json
  const { json: discussions, sha: discSha } = await ghGet('data/discussions.json');
  const newEntry = {
    id:           `disc-${String(discussions.length + 1).padStart(3, '0')}`,
    channel:      channelName,
    topic,
    date:         new Date().toISOString().split('T')[0],
    summary,
    participants,
    tags,
  };
  discussions.unshift(newEntry);
  await ghCommit('data/discussions.json', discussions, `log: #${channelName} — ${topic}`, discSha);

  // 6. Update bot-state.json (re-fetch sha in case of concurrent writes)
  const { json: freshState, sha: freshStateSha } = await ghGet('data/bot-state.json');
  freshState.channels[channelId] = new Date().toISOString();
  await ghCommit('data/bot-state.json', freshState, 'chore: update bot-state', freshStateSha);

  // 7. Reply
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle(`Logged: ${topic}`)
        .addFields(
          { name: 'Channel',      value: `#${channelName}`,              inline: true },
          { name: 'Messages',     value: String(messages.length),        inline: true },
          { name: 'Participants', value: participants.join(', '),         inline: true },
          { name: 'Summary',      value: summary },
          { name: 'Tags',         value: tags.map(t => `\`${t}\``).join(' ') || '—' },
        )
        .setFooter({ text: 'Committed to familyhub-collaboration/data/discussions.json' }),
    ],
  });
}

// ── Event handlers ────────────────────────────────────────────────────────────

discord.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'log') return;
  try {
    await handleLog(interaction);
  } catch (err) {
    console.error('Error in /log:', err);
    const msg = `Something went wrong: ${err.message}`;
    if (interaction.deferred) await interaction.editReply(msg).catch(() => {});
    else await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
  }
});

discord.once('ready', () => console.log(`Bot ready: ${discord.user.tag}`));

discord.login(process.env.DISCORD_TOKEN);