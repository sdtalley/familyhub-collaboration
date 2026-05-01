# Family Hub — KJ Onboarding

You (kjwheeler) and sdtalley are independently building a Skylight-style
wall-mounted family calendar display. This repo is the shared collaboration
layer: it tracks both builds' hardware choices, feature status, and dev notes,
and renders a live Kanban dashboard from that data.

**Dashboard:** https://sdtalley.github.io/familyhub-collaboration/  
**Repo:** https://github.com/sdtalley/familyhub-collaboration

---

## One-Time Setup

**1. Accept the collaborator invite** from sdtalley on GitHub, then clone:

```bash
git clone https://github.com/sdtalley/familyhub-collaboration.git
cd familyhub-collaboration
```

**2. Fill in your status file** — open `data/kjwheeler.json` and update:
- `hardware.compute`, `hardware.display`, `hardware.housing` with your actual gear
- Feature statuses (leave as `"todo"` if you haven't started)
- `repoUrl` with your calendar project's GitHub URL once it exists

Valid status values: `"todo"` | `"in-progress"` | `"done"` | `"blocked"`

**3. Write your first log entry** — open `logs/kjwheeler.md` and prepend:

```markdown
### YYYY-MM-DD — First Entry
**Area:** Meta
**What happened:** [what you're starting with, your hardware setup, etc.]
**Open question:** [anything you're unsure about]

---
```

**4. Commit and push:**

```bash
git add data/kjwheeler.json logs/kjwheeler.md
git commit -m "feat: add kjwheeler initial status and log"
git push
```

**5. Join the Discord server** — sdtalley will send an invite. Channels:
`#hardware` · `#features` · `#blockers` · `#general`

Use `/log` in any channel to summarize and commit that channel's discussion
to `data/discussions.json`. The bot will confirm when it succeeds.

---

## Ongoing Workflow

**Keep the collab repo open alongside your calendar project in VS Code:**
File → Add Folder to Workspace → select `familyhub-collaboration`. This
lets you pull and commit collab updates without switching windows.

**Pull before each work session:**
```bash
cd familyhub-collaboration && git pull
```

**After meaningful work on your calendar project**, update:
1. `data/kjwheeler.json` — bump feature statuses, add/resolve blockers
2. `logs/kjwheeler.md` — prepend a new entry (newest at top)

**Never touch:**
- `data/sdtalley.json` or `logs/sdtalley.md` — those are Steven's
- `data/discussions.json` or `data/bot-state.json` — Discord bot manages these

---

## Adding Claude Code Context to Your Calendar Project

Add the following block to your calendar project's `CLAUDE.md` (create one
if it doesn't exist). Update `[PATH]` to wherever you cloned this repo.

```markdown
## Collaboration Context — Family Hub

I am kjwheeler, building a Skylight-style family calendar display in
parallel with sdtalley. The shared collaboration repo is cloned at:
[PATH — e.g. ~/dev/familyhub-collaboration]

### Session start — read these files in order:
1. [PATH]/data/kjwheeler.json — my current hardware, feature status, blockers
2. [PATH]/data/sdtalley.json — Steven's hardware and feature status
3. [PATH]/data/discussions.json — recent logged Discord discussions (newest first)
4. [PATH]/logs/kjwheeler.md — my dev log (last 1-2 entries for context)
5. [PATH]/logs/sdtalley.md — Steven's dev log (last 1-2 entries for context)

### After meaningful work — update these files:
1. [PATH]/data/kjwheeler.json
   - Update feature statuses (todo/in-progress/done/blocked)
   - Add or resolve blockers in the blockers array
   - Update lastUpdated to today's date (YYYY-MM-DD)
2. [PATH]/logs/kjwheeler.md
   - Prepend a new entry at the top (newest at top), this format:

### YYYY-MM-DD — Short Title
**Area:** Calendar API / Display Driver / UI Layout / Auth / Housing / Meta
**What happened:** 1-3 sentences on what was built or decided.
**Open question / blocker:** (omit if none)

---

### Rules:
- Never modify sdtalley's files
- Never rewrite or delete existing log entries — append only
- Never modify discussions.json or bot-state.json — bot-managed
- Keep kjwheeler.json valid JSON at all times
- Commit collab file updates separately from calendar project code
```

---

## File Reference

| File | Purpose | Updated by |
|---|---|---|
| `data/kjwheeler.json` | Your hardware + feature status | Your AI / you |
| `data/sdtalley.json` | Steven's hardware + feature status | Steven's AI |
| `logs/kjwheeler.md` | Your append-only dev log | Your AI / you |
| `logs/sdtalley.md` | Steven's append-only dev log | Steven's AI |
| `data/discussions.json` | Logged Discord discussions | Discord bot |
| `data/bot-state.json` | Bot's last-logged timestamp per channel | Discord bot |