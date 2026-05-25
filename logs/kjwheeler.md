# KJ's Dev Log

Append-only. Newest entries at top. Do not edit existing entries.

---

### 2026-05-25 — Phase 2c: Drag Gestures, Click-Select, 4-Week View, Holidays, UX Polish
**Area:** UI / Calendar / Features  
**What happened:** Large Phase 2 sprint. Drag-to-create and drag-to-reschedule landed in HourlyView (pointer events, EditState machine, DragPhase internals); Shift-drag copies an event to the new slot. Click-to-select event tiles in SummaryGridView: blue inset `ring-accent` selection ring, floating action panel (position:fixed, clamped to viewport) with Details/Edit/Delete; Shift+click multi-select; SelectionToolbar for 2+ events; Delete/Backspace keyboard shortcut; optimistic delete with 4s undo toast (`DeleteToast` component + `restoreEventsLocal` hook). Added 4-Week view (28 days from anchor week, prev/next = 1 week, no out-of-month dimming) as default view on load. Month view reworked to paper-calendar style: out-of-month cells get darker `bg-past` background and hide events + weather; past in-month cells keep default bg with `opacity-60` on content. Holidays system: removed chip from filter bar, added Settings toggle (`show_holidays` DB column), added Sync button that imports from Nager.Date API (3 years, deduped by date, stored at noon UTC). Holidays color lightened to `#e07a94`. EventModal UX: stacked datetime inputs (no AM/PM clipping), start-time change auto-maintains event duration. 3-Day view prev/next now moves 1 day (was 3).  
**Open question:** Hardware still TBD. Per-user logins remains next for Phase 2.

---

### 2026-05-23 — Phase 2b: Light Theme, Compact Mode, UX Polish
**Area:** UI / Theming / UX  
**What happened:** Completed Phase 2b (light theme) and several UX polish features. Light theme ships via `[data-theme="light"]` CSS overrides on all 16 tokens (added `--past` token: `#090e1a` dark / `#e8edf2` light), anti-flash script in `<head>`, `useTheme` hook with localStorage persistence, and a Settings → Appearance toggle. Added compact/spacious layout density toggle (`useLayoutDensity` hook) affecting chip height, event tile proportions, band widths, date numbers, weather icons, and tile gap. Added long-press on summary grid day cells to open the add-event modal pre-filled with the tapped date (500ms, `makeLongPressHandlers()` factory pattern). Added past day visual distinction: `--past` background on past cells, `opacity-60` on past content, custody overlay using CSS gradient layering over `--past` (alpha: 0.12 past / 0.15 future so past days recede). Added `isLightColor()` + `LIGHT_TILE_BORDER` inset box-shadow for near-white tiles in the light theme. Updated member colors: Household → `#c8a373` (warm tan), Family → `#e2e8f0` (slate-200), Holidays → `#a13a5e`. Fixed several TypeScript / React strict-mode issues along the way (useRef initial value, structural pointer event types, CSS background multi-layer gradient trick).  
**Open question:** Hardware still TBD. Per-user logins next for Phase 2.

---

### 2026-05-23 — Phase 2a: Design Token System Implemented
**Area:** UI / Theming  
**What happened:** Implemented a 15-token CSS custom property system in globals.css using Tailwind v4 `@theme inline`. Tokens cover 3 surface levels (canvas/surface/raised), 2 border levels (line/line-input), 3 foreground levels (primary/secondary/muted), plus on-color, accent, accent-hover, today, tile-multi, danger, and time-line. All 15 component and page files were converted from hardcoded slate/blue utility classes to semantic token utilities. Also applied ScheduleView redesign from Claude Design handoff: transparent event tiles on sticky day headers with a fixed-height `w-2 h-12` colored accent rectangle (3px radius) replacing the full-height left band. Dropped Household triangle dots. Added Holidays as a filter chip (was missing). Updated member colors for Household (#c8a373) and Holidays (#a13a5e) via Supabase migration. TypeScript type-check passes clean.  
**Open question:** Phase 2b next — light theme via `[data-theme="light"]` overrides on all 15 tokens.

---

### 2026-05-21 — Phase 1 Complete, Starting Phase 2
**Area:** Full Stack  
**What happened:** Phase 1 shipped and deployed to Vercel. App is a full self-hosted family calendar — no Google Calendar dependency. Stack: Next.js 15, Supabase, Tailwind v4, TypeScript strict. All three calendar views are live (HourlyGrid, SummaryGrid, Schedule), plus event CRUD, per-member filter chips, parenting/custody schedule with overlay, weather widget (Open-Meteo, 16-day + hourly modal), PWA manifest, and responsive mobile layout (bottom nav, compact chips, color-only tiles on small screens). Real-time sync confirmed working across two simultaneous browser sessions. Tested on iPhone, iPad, and desktop. Starting Phase 2: per-user logins, recurring events, and mobile modal polish.  
**Open question:** Hardware still TBD — Pi + display per location not yet purchased.

---

### 2026-04-30 — Repo Initialized by sdtalley
**Area:** Meta  
**What happened:** sdtalley initialized the collaboration repo. Shared JSON structure, dashboard, and Discord bot plan are all defined. KJ should clone the repo, fill in `data/kjwheeler.json` with hardware and feature status, and add a first log entry here.  
**Open question:** None yet — add yours after your first work session.

---