# KJ's Dev Log

Append-only. Newest entries at top. Do not edit existing entries.

---

### 2026-05-26 — Phase 2e: View Picker Overhaul, Smart Daily-Auto, Virtual Keyboard, Pi Kiosk
**Area:** Calendar UI / Mobile / Hardware
**What happened:** Overhauled the calendar view picker — replaced flat dropdown with three split buttons in CalendarInfoBar: Clock (Hourly), LayoutGrid (Daily), List (Schedule) icons from lucide-react. `CalendarView` type simplified to `'hourly-auto'|'day'|'week'|'daily-auto'|'month'|'schedule'` (removed 3day, 2week, 4week). Clicking main split button selects Auto; chevron opens dropdown with named duration sub-options. Implemented smart daily-auto: `computeDailyAutoWeeks()` formula-based row height estimation (`spanBarH + dayOverhead + maxDayEvents × (tileH + cellGap)`) walking up to 6 candidate weeks; container height measured via ResizeObserver; always fetches 6 weeks of events to avoid circular dependency with `autoDailyWeeks`. Added `isMonthView` prop to SummaryGridView so daily-auto at 6 weeks never triggers month out-of-month dimming. Fixed mobile height calculation: `small = isMobile || compact` ensures mobile always uses compact-sized tile constants (22px) regardless of user density setting. Removed 4-event mobile cap — all events shown, simplifying height formula. Fixed mobile info bar clipping: text labels → icons, short date string on mobile (no weekday), Today button `px-1` on mobile. Fixed React hydration error from browser-injected `-webkit-text-size-adjust` by adding `suppressHydrationWarning` to `<body>`. Also shipped this session: in-app virtual keyboard (VirtualKeyboardContext + VirtualKeyboard, QWERTY + numpad, gated on `device_settings.virtual_keyboard`, wired to EventModal, Settings, Bank). Pi 4B + 27" QHD 1440p kiosk deployed and running at Kyle's house on Wayfire/Wayland/Chromium.
**Open question:** Mobile modal polish (full-screen forms) still todo. Mel's location hardware pending.

---

### 2026-05-26 — Wheeler Bank: Polish & Mobile Layout Complete
**Area:** Bank tab
**What happened:** Bank feature declared complete. Final round of polish: member card colors now fetched dynamically from the calendar `members` table so bank login always matches calendar chip colors exactly. Added Wheeler Bank icon (PNG from wheelerbank repo) to nav sidebar, admin header, and login screen. Login screen shows icon prominently above title. Sign Out buttons changed to solid red for visibility. Celebratory confetti animation (`canvas-confetti`) + card pulse keyframe fires when a child transfers a completed savings goal to Spending. Mobile layout overhauled: both child and admin views now use a single outer scroll container on mobile (no independent inner scrolls). Admin account tabs are `sticky top-0` on mobile so they remain visible while scrolling through transactions. Completed Goals collapses from a sidebar to a stacked section below transactions on mobile. Settings back button changed from hardcoded "← Calendar" to `router.back()`. Settings gear button shifted up (`md:mb-12`) to clear the Next.js dev overlay. iOS Safari zoom bug fixed — PIN input changed from `text-sm` (14px) to `text-base` (16px) to prevent auto-zoom on focus.
**Open question:** None.

---

### 2026-05-25 — Wheeler Bank: Multi-Account System
**Area:** Bank tab
**What happened:** Migrated from a single-balance-per-member model to a full multi-account system. Each child now has a Spending account, a Mission Savings account (no withdrawals, higher interest), and up to 3 Special Savings accounts (goal-based, funds locked until goal met). Children can transfer from Spending to savings accounts; a "Transfer to Spending" button appears when a goal is reached. Admin view upgraded with per-account tabs, account-level transaction history, and an Interest Rates modal (Kyle only). Implemented configurable per-account-type APR (Spending 3%, Mission 8%, Special 12%) with daily compounding via generate_series. Completed special savings funds count toward Spending for interest purposes. DB: added `bank_accounts`, `bank_interest_rates` tables, `account_id`/`transfer_id` on transactions, `bank_check_savings_goal` trigger auto-sets `goal_met_at`. Rewrote `apply_bank_interest()` for per-account rates. All 107 historical transactions migrated to Spending accounts.
**Open question:** None — fully implemented and type-checks clean.

---

### 2026-05-25 — Phase 2d: Device Identity, PIN System, Mobile Rendering Modes, House Filtering
**Area:** Auth / Settings / Mobile UI / Calendar  
**What happened:** Decided against per-user Supabase Auth accounts in favor of device identity (UUID in localStorage → `device_settings` DB row per device). Each device stores its house assignment (kyle/mel/shared), theme, density, show_holidays, and weather lat/lon. `useDeviceSettings` hook handles first-visit row creation and seeds localStorage from DB (so kitchen Pi recovers after reboot). Added per-parent PINs (HMAC-SHA256, `PIN_SALT` env var, server-side only) via `/api/pin/verify` and `/api/pin/set` routes; `useAdminSession` hook manages unlock/lock/setPin. Settings page rewritten with sticky header + tabs (This Device | Family) and always-visible unlock buttons. Fixed prop-passing bug (PinModal was calling `useAdminSession()` independently, creating a separate React state — fixed by passing `onUnlock`/`onSetPin` as props). Fixed `crypto.randomUUID` crash on older mobile browsers (RFC 4122 v4 fallback). Implemented household event filtering in CalendarTab: `event.house` compared to `deviceSettings.house`; null/both show everywhere, kyle/mel hidden on other house's device. Added `useIsMobile` hook (matchMedia ≤767px) and separated SummaryGridView into three distinct rendering modes — mobile (text overlays + child color stripes), desktop compact (normal text flow), desktop spacious (full layout with time labels). Replaced arbitrary `isGray ? text-white` with luminance-based `needsDarkText(hex)` at threshold 165; fixed Kyle orange, James blue, Josiah purple, Holidays pink all showing incorrect text color.  
**Open question:** Hardware still TBD. Mobile modal polish (full-screen forms) still to do.

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