// Cloudflare Worker — familyhub Discord /log bot
// No persistent process needed — Discord POSTs here when /log is used.

const REPO_OWNER  = 'sdtalley';
const REPO_NAME   = 'familyhub-collaboration';
const DISCORD_API = 'https://discord.com/api/v10';

// ── Signature verification ────────────────────────────────────────────────────

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function verifySignature(publicKey, signature, timestamp, rawBody) {
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(publicKey),
    { name: 'Ed25519', namedCurve: 'Ed25519' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    { name: 'Ed25519' },
    key,
    hexToBytes(signature),
    new TextEncoder().encode(timestamp + rawBody),
  );
}

// ── Discord helpers ───────────────────────────────────────────────────────────

async function discordGet(path, botToken) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) throw new Error(`Discord API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sendFollowup(appId, interactionToken, body) {
  await fetch(`${DISCORD_API}/webhooks/${appId}/${interactionToken}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}

// ── GitHub helpers ────────────────────────────────────────────────────────────

async function ghGet(path, token) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}: ${await res.text()}`);
  const data = await res.json();
  return {
    json: JSON.parse(atob(data.content.replace(/\n/g, ''))),
    sha:  data.sha,
  };
}

async function ghCommit(path, json, message, sha, token) {
  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method:  'PUT',
      headers: {
        Authorization:  `Bearer ${token}`,
        Accept:         'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(JSON.stringify(json, null, 2) + '\n'),
        sha,
      }),
    },
  );
}

// ── Snowflake helper ──────────────────────────────────────────────────────────

const DISCORD_EPOCH = 1420070400000n;
function msToSnowflake(ms) {
  return String((BigInt(Math.floor(ms)) - DISCORD_EPOCH) << 22n);
}

// ── Gemini summarization ──────────────────────────────────────────────────────

async function summarize(channelName, transcript, geminiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are logging a Discord discussion for a shared dev project. Two developers (sdtalley and kjwheeler) are independently building a Skylight-style family calendar display and use this Discord to compare decisions.

Summarize this #${channelName} discussion in 2-4 sentences. Focus on decisions made, approaches compared, or open questions raised. Then provide a short topic title (4-6 words) and 2-4 lowercase single-word tags.

Respond with valid JSON only — no markdown fences, no commentary:
{"topic":"...","summary":"...","tags":["...","..."]}

Discussion:
${transcript}`,
          }],
        }],
      }),
    },
  );
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text.trim());
}

// ── /log handler ──────────────────────────────────────────────────────────────

async function handleLog(interaction, env) {
  const { channel_id: channelId, channel, application_id: appId, token } = interaction;
  const channelName = channel?.name ?? channelId;

  try {
    // 1. Load bot state
    const { json: botState } = await ghGet('data/bot-state.json', env.GITHUB_TOKEN);
    const lastMs = botState.channels[channelId]
      ? new Date(botState.channels[channelId]).getTime()
      : null;

    // 2. Fetch messages from Discord REST API
    const params = new URLSearchParams({ limit: '100' });
    if (lastMs) params.set('after', msToSnowflake(lastMs));
    const raw = await discordGet(`/channels/${channelId}/messages?${params}`, env.DISCORD_TOKEN);

    const messages = (Array.isArray(raw) ? raw : [])
      .filter(m => !m.author.bot && m.content?.trim())
      .sort((a, b) => a.id.localeCompare(b.id)); // oldest → newest

    if (!messages.length) {
      await sendFollowup(appId, token, { content: 'No new messages since the last `/log`. Nothing to commit.' });
      return;
    }

    // 3. Build transcript
    const transcript   = messages.map(m => `[${new Date(m.timestamp).toISOString()}] ${m.author.username}: ${m.content}`).join('\n');
    const participants = [...new Set(messages.map(m => m.author.username))];

    // 4. Summarize with Gemini
    let topic, summary, tags;
    try {
      ({ topic, summary, tags } = await summarize(channelName, transcript, env.GEMINI_API_KEY));
      if (!Array.isArray(tags)) tags = [];
    } catch {
      topic   = `${channelName} discussion`;
      summary = `${messages.length} messages exchanged in #${channelName}.`;
      tags    = [channelName];
    }

    // 5. Update discussions.json
    const { json: discussions, sha: discSha } = await ghGet('data/discussions.json', env.GITHUB_TOKEN);
    discussions.unshift({
      id:           `disc-${String(discussions.length + 1).padStart(3, '0')}`,
      channel:      channelName,
      topic,
      date:         new Date().toISOString().split('T')[0],
      summary,
      participants,
      tags,
    });
    await ghCommit('data/discussions.json', discussions, `log: #${channelName} — ${topic}`, discSha, env.GITHUB_TOKEN);

    // 6. Update bot-state.json (re-fetch sha to avoid conflict)
    const { json: freshState, sha: freshStateSha } = await ghGet('data/bot-state.json', env.GITHUB_TOKEN);
    freshState.channels[channelId] = new Date().toISOString();
    await ghCommit('data/bot-state.json', freshState, 'chore: update bot-state', freshStateSha, env.GITHUB_TOKEN);

    // 7. Send follow-up embed
    await sendFollowup(appId, token, {
      embeds: [{
        color:  0x22c55e,
        title:  `Logged: ${topic}`,
        fields: [
          { name: 'Channel',      value: `#${channelName}`,       inline: true },
          { name: 'Messages',     value: String(messages.length), inline: true },
          { name: 'Participants', value: participants.join(', '),  inline: true },
          { name: 'Summary',      value: summary },
          { name: 'Tags',         value: tags.map(t => `\`${t}\``).join(' ') || '—' },
        ],
        footer: { text: 'Committed to familyhub-collaboration/data/discussions.json' },
      }],
    });

  } catch (err) {
    await sendFollowup(appId, token, { content: `Error: ${err.message}` }).catch(() => {});
  }
}

// ── Worker entry point ────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const rawBody   = await request.text();
    const sig       = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');

    if (!sig || !timestamp) return new Response('Unauthorized', { status: 401 });

    const valid = await verifySignature(env.DISCORD_PUBLIC_KEY, sig, timestamp, rawBody);
    if (!valid) return new Response('Unauthorized', { status: 401 });

    const interaction = JSON.parse(rawBody);

    // Discord verification ping
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // /log slash command
    if (interaction.type === 2 && interaction.data?.name === 'log') {
      ctx.waitUntil(handleLog(interaction, env));
      return Response.json({ type: 5 }); // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    }

    return new Response('Unknown interaction type', { status: 400 });
  },
};