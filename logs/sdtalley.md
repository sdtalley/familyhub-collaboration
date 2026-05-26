# Steven's Dev Log

Append-only. Newest entries at top. Do not edit existing entries.

---

### 2026-05-25 — Balanced Hearth Phase 3: Pastel swatches + avatar fill/ink
**Area:** UI Layout  
**What happened:** Shipped commit fdd07a5. Fixed Settings color picker and member avatars. `PRESET_COLORS` refactored from `string[]` to `ColorPreset[] { bar, fill, label }` — each swatch now displays the pastel `fill` (CSS var for Talley members, color-mix for shared categories) while storing the saturated `bar` as `member.color`. `MemberAvatarDisplay` changed from `p.bar + white` to `p.fill + p.ink`, matching the filter chip pastel aesthetic in CalendarTab. Build clean, tsc clean.  
**Open question:** None.

---

### 2026-05-25 — Balanced Hearth Phase 2: SVG icons + pill color fix
**Area:** UI Layout  
**What happened:** Shipped theme polish (commit ece7daa). Tab icons in NavSidebar replaced with stroke SVG set (calendar/checklist/star/utensils/list/moon/settings-gear, 20px 1.8px weight). WeatherWidget emoji replaced with per-condition SVG icons (8 weather states). Added `getEventPillColors()` utility that resolves fill/ink/bar via CSS design-token vars (`var(--mom-fill)` etc.) for Talley family members. Fixed critical bug in all 5 calendar views: `hexToRgba(ev.color, 0.x)` and `${ev.color}22` patterns both silently fail when ev.color is an oklch string — pills were rendering transparent in light mode. Build clean, tsc clean.  
**Open question:** None.

---

### 2026-05-25 — Balanced Hearth Light Theme
**Area:** UI Layout  
**What happened:** Shipped light-mode redesign from Claude Design handoff (Balanced Hearth). next-themes installed with `data-theme` attribute switching. `:root` now defaults to warm cream palette (oklch); `[data-theme="dark"]` preserves original dark values. 7-member Talley family palette (Mom/Dad/Ivy/Gwen/Jonah/Eliza/Redd) with fill/ink/bar CSS vars for both themes. Inter added as display font, radius bumped to 14px/10px. FamilyMember type extended with colorFill/colorInk/colorBar. sampleData updated to real family. Settings → Appearance toggle. Build clean. Commit 9f09219.  
**Open question:** None — event pill fill/ink/bar rendering deferred to next session (Phase 2 of theme work).

---

### 2026-04-30 — Project Setup
**Area:** Meta  
**What happened:** Initialized collaboration repo. Defined shared JSON structure, dashboard approach, and Discord bot plan.  
**Open question:** What hardware am I using for compute and display?

---