# Family Hub Collaboration — Setup Guide for KJ

Welcome! This repo is the shared collaboration layer for our parallel Skylight
calendar builds. It tracks hardware choices, feature status, dev logs, and
Discord discussions in one place, and renders everything as a live Kanban
dashboard.

---

## 1. Prerequisites

- Git installed
- VS Code installed
- Claude Code (or Codex) installed
- A GitHub account — sdtalley will add you as a collaborator

---

## 2. Get Access

Accept the GitHub collaborator invite from sdtalley, then clone:

```bash
git clone https://github.com/sdtalley/familyhub-collaboration.git
cd familyhub-collaboration
```

---

## 3. Open in VS Code

```bash
code .
```

Recommended extension: **GitLens** — gives you inline blame, history, and
easy commit visibility without leaving the editor.

---

## 4. Set Up Your Files

Open `data/kjwheeler.json` and fill in:
- Your hardware details (compute, display, housing)
- Initial feature statuses (`"todo"` is fine for everything to start)

Open `logs/kjwheeler.md` and add your first entry at the top (above the
existing seed entry), following the format already in the file.

Then commit and push:

```bash
git add data/kjwheeler.json logs/kjwheeler.md
git commit -m "feat: add kjwheeler initial status and log"
git push
```

---

## 5. Add Collaboration Context to Your AI Assistant

**For Claude Code:** Add or append to your calendar project's `CLAUDE.md`:

```markdown
## Collaboration Context

I am building a Skylight calendar dupe in parallel with sdtalley.
Read the following files from the familyhub-collaboration repo for
context before starting work. The repo is cloned at: [PATH — update this]

- data/sdtalley.json — Steven's build status
- data/kjwheeler.json — My build status
- discussions.json — Shared discussion log
- logs/sdtalley.md — Steven's dev log
- logs/kjwheeler.md — My dev log

After meaningful work, update data/kjwheeler.json and logs/kjwheeler.md
per the rules in familyhub-collaboration/CLAUDE.md.
```

Update `[PATH]` to wherever you cloned `familyhub-collaboration` on your
machine (e.g. `~/dev/familyhub-collaboration`).

---

## 6. Keeping the Collab Repo in Sync

This is a separate repo from your calendar project, so you need to keep it
up to date manually (or on a schedule).

**Option A — Pull before each work session:**

Open a terminal in the `familyhub-collaboration` folder and run:

```bash
git pull
```

**Option B (recommended) — Keep it open as a second VS Code workspace:**

In VS Code: **File → Add Folder to Workspace** → select
`familyhub-collaboration`. Save as a multi-root workspace.

You can now see both repos in the sidebar, pull from the Source Control
panel, and commit your JSON/log updates without switching windows.

---

## 7. Discord Setup

- Join the shared Discord server (sdtalley will send the invite)
- Channels:
  - `#hardware` — display, compute, housing discussions
  - `#features` — calendar API, UI, auth discussions
  - `#blockers` — things you're stuck on
  - `#general` — everything else
- Use `/log` in any channel to summarize and commit the discussion since
  the last `/log` command
- The bot will post a confirmation message when the commit succeeds

---

## 8. Future Alternative: GitHub Discussions

If the Discord bot ever becomes a maintenance burden or feels like the wrong
tool, there's a cleaner option: **GitHub Discussions + a GitHub Action**.

GitHub fires webhook events whenever a discussion is created or edited. A
workflow can trigger on those events, fetch all discussions via the GraphQL
API using the built-in `GITHUB_TOKEN`, transform them into the same
`discussions.json` format, and commit the file back automatically. No bot
to host, no external infrastructure.

The tradeoff: GitHub Discussions is a structured forum (markdown posts with
threading), not a chat app. It's better for logging decisions than for
quick back-and-forth. Discord stays better for real-time conversation.

If you want to migrate: create a `sync-discussions.yml` workflow triggered
on `discussion` events, call the GraphQL API to fetch discussion nodes
(title, body, author, category, created date), and write them to
`data/discussions.json` in the same schema. The dashboard requires no
changes.

---

## 9. View the Dashboard

The live dashboard is at:

```
https://sdtalley.github.io/familyhub-collaboration/
```

It fetches data directly from GitHub raw URLs and auto-refreshes every
5 minutes. No login required — just open it in any browser.

---

## Quick Reference

| File | Who updates it | How |
|---|---|---|
| `data/sdtalley.json` | sdtalley's AI | After each meaningful work session |
| `data/kjwheeler.json` | kjwheeler's AI | After each meaningful work session |
| `logs/sdtalley.md` | sdtalley's AI | Prepend new entry (newest at top) |
| `logs/kjwheeler.md` | kjwheeler's AI | Prepend new entry (newest at top) |
| `data/discussions.json` | Discord bot only | Via `/log` slash command |
| `data/bot-state.json` | Discord bot only | Automatic |