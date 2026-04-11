# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Department** is a bureaucratic incremental/idle game (similar to Cookie Clicker) where the player grows a single-clerk office into a self-sustaining administrative organism. The tone is warm, darkly funny, and deadpan — bureaucracy as a living thing. The player is not a character; they *are* The Department.

The full game design document lives at `docs/the-department-gdd.md` (v0.2).

## Project Status

Core gameplay loop is functional. The player can click to earn Forms, buy departments for passive income, and watch the floor plan grow organically. Save/load with offline income is working. Tech stack: vanilla HTML/CSS/JS (no build tools, no frameworks).

### What's done
- Click mechanic — APPROVE stamp with hit/miss detection (stamp-size-aware), animations (press, shake, imprint, floating text)
- 9 department tiers (8 base + The Jurisdiction hidden until Precedent of Scale upgrade) with ~1.15× cost scaling and passive Forms/sec
- Department shop dynamically rendered from data, buy buttons auto-enable/disable each frame
- Organic floor plan — rooms inflate on first purchase, grow with ownership, mycelium corridors connect them, liminal spaces appear at thresholds
- localStorage save/load with auto-save (30s + beforeunload), offline income on return
- Game loop via requestAnimationFrame with delta-time ticking
- News ticker — central `Ticker` module with capped (28-item) deduplicated queue, dt-driven dynamic line generator (35–75s cadence), and 100 brainstormed flavour lines across 8 progression tiers (Tier 0 just-started → Tier 7 deep prestige); all pushes (seed/milestone/event/restructuring/dynamic) route through `Ticker.push(text, { source, dedupeKey })`; token interpolation supports `{stat:<name>}`, `{owned:<tierId>}`, `{deptName:<tierId>}`, `{deptNameLower:<tierId>}`, `{gameName}` (honours custom renames); queue persisted in save v9; dedupeKeys fix the event-catch/miss duplication bug
- Upgrades system — Directives (◈) resource with manual conversion (500 Forms → 1 Directive), unlocks at first Sub-Committee + 500 total Forms
- 5 click upgrades (Forms currency): Ballpoint Pen, Fresh Ink Pad, Carbon Copy, The In-Tray, Institutional Memory
- 8 department multiplier upgrades (Directives currency): one per tier at own-1 milestone, each ×2 output
- 3 passive/flavour upgrades (Directives): Redundancy Planning (+5% global), Motivational Poster (×1.001), The Memo (×1.10)
- "The Reorganisation" upgrade (150 Directives, unlocks at Oversight Body ≥1) — gates the Restructuring prestige mechanic
- Upgrades tab in right panel with available/purchased sections, auto-refreshing
- Milestone system — 33 milestones across 6 categories (Forms earned, first dept purchases, dept quantities, Forms/sec, clicks, total depts, Directives), toast notifications, ticker integration, persisted in save
- Department renaming — double-click "The Department" title (left panel) or any tier name (right panel) for inline rename, persisted in save
- Random events system — two-tier spawn timers (Tier 1: 2–5 min, Tier 2: 15–30 min), unlocks at first Filing Cabinet, one active event at a time, clickable in centre panel, toast + ticker on catch/miss
- The Lost Form (Tier 1) — drifting paper across centre panel, 9s duration, rewards ~30s of current income
- The Visiting Inspector (Tier 2) — inspector icon patrols floor plan, 17s duration, rewards ×3 all dept output for 60s (temporary buff)
- Buff system — temporary multiplier buffs from events, ticking countdown, buff UI indicator below stats, integrated into Departments.recalcIncome(), persisted in save with offline decay
- Centre panel tab system — five tabs (Floor Plan, Registry, Honours Board, Restructuring, Operations); selecting a non-default tab swaps the floor plan for an admin view, tab bar always visible
- Registry tab — two-column ledger of lifetime + current run stats, refreshes live while visible
- Honours Board tab — milestones rendered as commendation cards; locked ones shown as redacted certificates
- Restructuring tab — locked until "The Reorganisation" purchased; shows live Precedent projections, dissolved/retained summary, Initiate button
- Prestige / Restructuring mechanic — Cookie Clicker-style ascension phase: initiating a Restructuring resets Forms/Directives/departments/upgrades, awards Precedents (⌖) based on `floor(sqrt(runFormsEarned / 1M))`, enters a full-screen phase overlay where the player can spend Precedents on permanent upgrades before clicking "Begin Next Cycle"
- 5 Precedent upgrades (persist forever): Institutional Memory (1⌖, start with 1 Intern), Continuity of Operations (5⌖, retain 5% Forms), Established Procedure (10⌖, click ×3), Precedent of Scale (25⌖, unlock 9th tier The Jurisdiction), The Eternal Mandate (100⌖, all depts ×2)
- Precedent multiplier — each Precedent gives permanent +1% compounding to all Form generation (click + passive)
- Ceremonial overlay — 3.5s deadpan quote card on Restructuring, then fades to reveal the phase screen
- Game loop gated by `Game.phase` ('running' | 'restructuring') — all ticking stops during the phase
- Precedents ⌖ stat row in left panel (visible after first Restructuring)
- Operations tab — manual save (File Current State), export save string (Submit to Archive), import save string (Retrieve from Archive), wipe save with CONFIRMED prompt (Initiate Total Dissolution)
- Operations → Options — four fully wired settings persisted in save: offline income toggle (gates offline earnings on load), news ticker speed (Slow 70s / Normal 45s / Fast 25s via inline animationDuration), reduced motion (targeted `animation: none` on decorative elements, preserves functional event travel; ticker switches to 4s static cycling via `.ticker-active` class), number formatting (Full locale / Abbreviated with 16 suffixes K→QiDc + scientific fallback above 1e48 / Scientific notation)
- `Game.settings` object holds runtime options, serialised inside `game` block in save data, restored via `Object.assign` on load
- Registry tab — full two-column ledger (Lifetime vs Current Run) with 10 lifetime stats (Forms filed, Directives converted, clicks, Restructurings, Precedents earned, peak Forms/sec, events caught/missed, milestones, time existed) and 12 current-run stats (run Forms, on-hand Forms, Forms/sec, Forms/click, Directives, departments, tiers, upgrades, Precedents held/projected, run time, buffs), plus per-tier breakdown showing count, effective rate/s, and lifetime Forms generated
- Per-tier production tracking — `effectiveRate` and `totalFormsGenerated` stored on each `Departments.tiers[]` entry, computed in `recalcIncome()` and attributed in `tickTierAttribution(dt)` each tick; ready for floor plan hover tooltips
- Random events tracking — `RandomEvents.caughtCount` and `missedCount` lifetime counters, incremented in `catchEvent()`/`missEvent()`, serialised/restored, survive Restructuring
- New Game stats: `totalDirectivesConverted`, `totalPrecedentsEarned`, `peakFormsPerSec`, `gameStartTime`, `runStartTime` — all persisted in save (v8)
- `formatDuration(ms)` utility in `ui.js` for human-readable time display (Xd Xh Xm Xs)
- Floor plan hover tooltips — hovering a department room shows a tooltip with display name, owned count, effective Forms/sec, and lifetime total filed; tooltip flips below for top-edge rooms; only the hovered room's tooltip is updated each frame for performance; respects reduced-motion setting
- Bulk buy controls — global `.qty-toggle` segmented controls (x1 / x10 / x50 / x100 / MAX) above the department shop and next to the Directives convert button; persisted in `Game.settings.buyQuantity` / `convertQuantity`; `Departments.getBulkCost`/`getMaxAffordable`/`buyBulk` do term-by-term summation to match single-unit floor rounding; `Upgrades.convertToDirectives(n)` handles linear bulk conversion; MAX is the only partial-purchase mode, fixed quantities stay disabled until fully affordable

### What's not done yet (PoC scope)
- Synergy upgrades
- Additional department multiplier tiers (10/25/50/100 ownership milestones)
- Additional random events.

### Open bugs/known issues

- With Reduced Motion option enabled: Clicking on the stamp/form doesn't clear the floating text.
- The UI numbers volumes on the left for rates (forms/click and forms/sec) are not shortened, even with the option for abbreviated number formatting enabled.
- The on-hover floor plan department tooltips are aligned with the tilt of the floorplan itself - not nice UI feeling. Need to change to no tilt.


## Tech Stack & File Structure

- `index.html` — single-page entry point, loads all CSS and JS
- `css/main.css` — layout, panels, stamp animations, form box, stats, shop, ticker
- `css/floorplan.css` — floor plan rooms, corridors, liminal spaces, ambient glow
- `js/game.js` — Game object (state + settings + tick), requestAnimationFrame loop, DOMContentLoaded init orchestration
- `js/departments.js` — Departments object with 9 tier definitions (8 base + hidden Jurisdiction), cost scaling, buy logic, income recalculation
- `js/upgrades.js` — Upgrades object: 17 upgrade definitions (click/dept-mult/passive/flavour/prestige-unlock), Directives unlock/conversion, purchase logic, effect calculation
- `js/ticker.js` — Ticker object: capped deduplicated queue (`MAX_ITEMS: 28`), `push(text, { source, dedupeKey, pinned })` entry point, dt-driven dynamic line generator (`tick(dt)` → `fireDynamicLine()` on 35–75s jittered cadence), 100 dynamic line definitions across 8 progression tiers gated by `_currentTier()`, token resolver (`resolveTokens()` + `_resolveStat()` whitelist), `rebuildDOM()` that preserves `animationDuration` on `#ticker-track`, `seedInitialQueue()` with the 6 canonical seed lines, save/restore
- `js/milestones.js` — Milestones object: 33 milestone definitions, condition checking, toast notifications, pushes to Ticker (`source: 'milestone'`), save/restore
- `js/ui.js` — UI object: click handling (hit/miss detection), stamp/imprint/float animations, department list rendering, stat updates, right-panel tab switching, department renaming. Also hosts `CentreTabs` controller (centre panel tab bar + Registry/Honours/Restructuring/Operations view rendering, Save/Data actions, Options bindings). Global helpers: `formatNumber()` (with `NUMBER_SUFFIXES` table), `formatDuration()`, `applyTickerSpeed()`, `applyReducedMotion()`, reduced-motion ticker cycling functions. Exposes `UI.resetTickerCycleIndex()` so `Ticker.rebuildDOM` can reset the cycle after a DOM rewrite.
- `js/floorplan.js` — FloorPlan object: dynamic room/corridor/liminal-space rendering, organic growth, snapshot-diffing to skip unchanged frames
- `js/events.js` — RandomEvents object: two-tier spawn timers, event definitions (Lost Form, Visiting Inspector), spawn/catch/miss logic, buff system, buff UI, save/restore; catch/miss pushes dedupe by event id so repeat catches can't flood the ticker
- `js/restructuring.js` — Restructuring object: prestige system, Precedent upgrade definitions (5), phase screen overlay, ceremonial overlay, perform/endPhase/enterPhaseFromLoad lifecycle, buy/afford helpers
- `js/save.js` — Save object: serialise/deserialise (save v9), localStorage persistence, auto-save interval, offline income calculation. `wipeAll()` sets a `_wiped` flag that makes subsequent `save()` calls no-op and removes the `beforeunload` listener so Dissolve can't be undone by the pre-reload auto-save.

## Architecture Notes

- All game objects (`Game`, `Departments`, `Upgrades`, `Milestones`, `UI`, `FloorPlan`, `RandomEvents`, `Restructuring`, `Save`, `CentreTabs`) are plain object literals on `window` — no modules, no classes, no build step.
- Script load order matters: `game.js` → `ticker.js` → `departments.js` → `upgrades.js` → `milestones.js` → `ui.js` → `floorplan.js` → `events.js` → `restructuring.js` → `save.js`. Init sequence in DOMContentLoaded: `Save.load()` → seed ticker if queue empty → `UI.init()` → `FloorPlan.init()` → `CentreTabs.init()` → `RandomEvents.init()` → `Save.startAutoSave()` → phase-screen check → game loop.
- `Game.phase` ('running' | 'restructuring') gates the main game loop. During `'restructuring'`, the full-screen phase overlay is active and all game ticking is paused.
- Department list in the right panel is rendered dynamically from `Departments.tiers` — no hardcoded HTML for shop items.
- Floor plan rooms are positioned with hand-tuned percentage coordinates. Corridors are calculated as pixel lines between room centres each update.
- Hit detection for stamp clicks shrinks the valid target by half the stamp's dimensions on each side, so the stamp visual must be mostly inside the form box to count as a hit.
- `FloorPlan.update()` uses a stringified snapshot of department ownership to skip DOM work when nothing changed.

## Core Mechanics Summary

- **Click action**: "APPROVE" rubber stamp onto a form box. Clean stamps generate Forms; mis-stamps (outside box) trigger rejection animation, no reward. Hit area stays generous.
- **Resources**: Forms (✦, primary), Directives (◈, mid-game manual conversion from Forms), Precedents (⌖, prestige meta-currency).
- **Departments**: 9 tiers (Intern → The Mandate + hidden The Jurisdiction), each with exponential cost scaling (~1.15×) and passive Forms/sec generation. The Jurisdiction unlocked by Precedent of Scale.
- **Upgrades**: Department multipliers (at ownership milestones 1/10/25/50/100), synergy upgrades, passive behaviour changes, flavour/comedy upgrades. Purchased with Directives. "The Reorganisation" (150◈) gates the prestige system.
- **Prestige ("Restructuring")**: Full ascension-phase system. Resets Forms/Directives/departments/upgrades; awards Precedents based on `floor(sqrt(runFormsEarned / 1,000,000))`. Enters a full-screen phase overlay where the player spends Precedents on 5 permanent upgrades before starting the next cycle. Each Precedent also gives permanent +1% compounding multiplier.

## Visual Design

Three-panel layout: left (click zone + stats), centre (organic office floor plan), right (purchase list + upgrade shop). Warm amber/cream/green palette with paper-grain texture. Floor plan grows organically like mould/mycelium — rooms are visual only, not clickable for purchasing.

## PoC Scope (from GDD)

Must-haves for a playable proof of concept: click mechanic with 5 upgrades, 5 department tiers, ~15 upgrades, milestone system (20+), news ticker (30+ lines), simplified living floor plan, localStorage save/load, offline income calculation.
