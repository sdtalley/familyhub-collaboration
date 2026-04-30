# Family Hub Collaboration — AI Assistant Context

This repository is the collaboration layer for two independent "Skylight
calendar dupe" builds. Read this file before starting any work session.

## What This Repo Contains

- `data/sdtalley.json` — Steven's hardware choices, feature status, blockers
- `data/kjwheeler.json` — KJ's hardware choices, feature status, blockers
- `data/discussions.json` — Logged Discord discussions (auto-populated by bot)
- `logs/sdtalley.md` — Steven's dev log
- `logs/kjwheeler.md` — KJ's dev log
- `dashboard/index.html` — Kanban board rendering all of the above

## How to Use This Context

At the start of a work session on either calendar project, read:
1. Your own JSON file and log to recall current status
2. The other person's JSON file and log to understand their approach
3. Recent entries in `discussions.json` for any decisions made on Discord

This helps you understand: where the builds differ, what's been decided,
and what open questions exist.

## Update Rules

**sdtalley's AI assistant** should update after meaningful work:
1. `data/sdtalley.json` — update feature status or add/resolve a blocker
2. `logs/sdtalley.md` — prepend a new entry (newest at top) in this format:

```
### [YYYY-MM-DD] — [Short Title]
**Area:** (e.g. Calendar API, Display Driver, Housing, Auth)
**What happened:** 1-3 sentences.
**Open question / blocker:** (optional)

---
```

**kjwheeler's AI assistant** does the same for `data/kjwheeler.json` and
`logs/kjwheeler.md`.

## Rules for Both

- Never modify the other person's files
- Never rewrite or delete existing log entries — append only
- Never modify `discussions.json` or `bot-state.json` — these are
  managed by the Discord bot
- Keep JSON valid at all times — validate before committing
- Update `lastUpdated` in your JSON file when you make changes