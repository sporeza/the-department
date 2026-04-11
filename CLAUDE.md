# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Department** is a bureaucratic incremental/idle game (similar to Cookie Clicker) where the player grows a single-clerk office into a self-sustaining administrative organism. The tone is warm, darkly funny, and deadpan — bureaucracy as a living thing. The player is not a character; they *are* The Department.

The full game design document lives at `docs/the-department-gdd.md` (v0.5).

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
- Full department multiplier tree (Directives currency) — one ×2 upgrade at each of 1/10/25/50/100 owned for all 9 tiers (8 base + The Jurisdiction), 45 upgrades total. Cost scales geometrically per milestone (own-1 → own-10 ×5, ×25, ×125, ×625 cost). Jurisdiction milestones only appear after Precedent of Scale unhides the tier.
- 10 standard synergy upgrades (Directives, `category: 'synergy'`) — Misfiling Protocol, Evidence-Based Review, Review of the Review, Standing Orders, Operational Continuity, Jurisdictional Overlap, Extended Jurisdiction, Territorial Instrument, Career Trajectory, Permanent Record. Unlocked by owning combinations of two tiers. All flavour text lifted from GDD v0.5.
- 2 deep synergy upgrades — Terms of Reference (passive 0.05 ◈/s trickle via `Upgrades.tickDirectivesTrickle` with fractional accumulator) and Regulatory Capture (pre-computed ×2.15 Oversight / ×1.378 Annex from the GDD's swap-and-multiply spec); each gated by the matching standard synergy already purchased.
- 2 Precedent Synergies in the prestige layer — Doctrine of Precedent (15⌖, synergy bonuses start runs at 50% and ramp to 100% over 30 min via `Game.getDoctrineScale()`) and Interlocking Directorates (30⌖, ×1.25 global mult when ≥3 synergies are owned, applied as `interlockingMult` in `Departments.recalcIncome()`).
- 5 passive/flavour upgrades (Directives): Redundancy Planning (+5% global), Motivational Poster (×1.001), The Memo (×1.10), Auto-Filing (offline income +25%), Precedent-Setting (future Restructurings yield +10% Precedents, applied in `Restructuring.calculateGain()`).
- "The Reorganisation" upgrade (150 Directives, unlocks at Oversight Body ≥1) — gates the Restructuring prestige mechanic
- Upgrades tab in right panel with available/purchased sections, auto-refreshing. Available list is partitioned by category (Click / Departments / Synergies / Passive / Flavour / Prestige) under subtle group headers; synergy cards carry a green left-border accent, deep synergies a heavier ink border.
- Generic synergy effect engine — every synergy definition has `effect.type: 'synergy'` and an `effect.bonuses[]` array of rules. Supported bonus kinds: `mult-per-owned`, `mult-per-grouped` (capped stacks, e.g. Operational Continuity's "+20% per 5 Procedures, max 10 stacks"), `mult-flat`, `mult-flat-per-owned` (tier-aware, converts flat Forms/sec per source-owned into a multiplier using target `baseRate`), `global-mult`, `milestone-stacking` (reads `Game.permanentRecordStacks`), and `directives-trickle`. `Upgrades.getDeptMultiplier(tierId)` resolves them per tier and wraps every contribution in `_scaleSynergyFactor()` so Doctrine of Precedent's 30-minute ramp applies uniformly.
- Permanent Record stacking — `Game.permanentRecordStacks` increments in `Milestones.trigger()` whenever Permanent Record is owned; cleared on Restructuring; applied as a global `milestone-stacking` synergy bonus (+0.5% per stack).
- Milestone system — 93 milestones across ~15 themed sections (Forms earned, first dept purchases, dept quantities, Forms/sec, clicks, total depts, Directives, synergies, prestige/Restructuring count, random events, stamp rejections, time-played, peak/stacks, completion tracks, hidden/absurd). Supports optional `hidden: true` flag — hidden milestones are completely absent from the Honours Board grid and denominator until fired. `Milestones.trigger()` also bumps `Game.permanentRecordStacks` when the Permanent Record synergy is owned. `Game.firstRestructureMs` is captured set-once in `Restructuring.perform()` before the run-time reset, feeding the hidden "Hasty Legacy" speedrun milestone. Toast notifications, ticker integration, persisted in save.
- Department renaming — double-click "The Department" title (left panel) or any tier name (right panel) for inline rename, persisted in save
- Random events system — two-tier spawn timers (Tier 1: 2–5 min, Tier 2: 15–30 min), unlocks at first Filing Cabinet, one active event at a time, clickable in centre panel, toast + ticker on catch/miss
- Six random events across two tiers:
  - **Tier 1** — The Lost Form (drifting paper, 9s, ~30s income reward), The Urgent Memo (red-stamped slide-in, 20s, +50% Forms/sec for 30s buff), The Escaped Intern (wandering sprite, 12s, ~60s of Intern's effective rate as Forms)
  - **Tier 2** — The Visiting Inspector (patrolling icon, 17s, ×3 all output for 60s), The Policy Window (formal notice → choice modal, 25s, player picks one of a randomised pair: Streamline Processing ×1.75 income 90s / Discretionary Budget ~120s Forms, OR Mandatory Overtime ×2 click 120s / Staff Wellbeing ×1.25 income 60s), The Mysterious Package (📦 in reception, 18s, weighted outcome: biscuits buff / unclear Forms / Form 7B triplicate / Unsigned Directive — Directive outcome only eligible after directives are unlocked)
- Buff system — multiplicatively-stacking temporary buffs with `scope: 'income' | 'click'` on every buff object. Income-scoped buffs go through `RandomEvents.getGlobalBuffMultiplier()` into `Departments.recalcIncome()`; click-scoped buffs go through `RandomEvents.getClickBuffMultiplier()` into the tail of `Upgrades.applyEffects()` so the left-panel Forms/click display stays in sync with what `Game.clickApprove()` grants. Ticking countdown, buff UI shows a "CLICK" tag on click-scoped buffs, persisted in save v11 with offline decay. Legacy v10 buffs default to `scope: 'income'` on load.
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
- Balance pass on synergy and dept-mult costs (current values are placeholders); also ties into the "infinity" overflow issue after many Restructurings

### Open bugs/known issues

- With Reduced Motion option enabled: Clicking on the stamp/form doesn't clear the floating text.
- The UI numbers volumes on the left for rates (forms/click and forms/sec) are not shortened, even with the option for abbreviated number formatting enabled. Same for the on-hover department tooltips in the floor plan.
- The on-hover floor plan department tooltips are aligned with the tilt of the floorplan itself - not nice UI feeling. Need to change to no tilt.
- After enough restructurings and multipliers, the incrementer increases to "infinity" and breaks the game. Might be addressed in balance pass.

## Tech Stack & File Structure

- `index.html` — single-page entry point, loads all CSS and JS
- `css/main.css` — layout, panels, stamp animations, form box, stats, shop, ticker
- `css/floorplan.css` — floor plan rooms, corridors, liminal spaces, ambient glow
- `js/game.js` — Game object (state + settings + tick), requestAnimationFrame loop, DOMContentLoaded init orchestration
- `js/departments.js` — Departments object with 9 tier definitions (8 base + hidden Jurisdiction), cost scaling, buy logic, income recalculation
- `js/upgrades.js` — Upgrades object: ~70 upgrade definitions across categories `click`, `dept-mult` (5 milestones × 9 tiers), `synergy` (10 standard + 2 deep, plus the `tier: 'deep'` marker), `passive`, `flavour`, `prestige`. Directives unlock/conversion, purchase logic, effect calculation. Key functions: `applyEffects()` (click power + delegates income to Departments), `getDeptMultiplier(tierId)` (resolves dept-mult + global + synergy bonuses through `_scaleSynergyFactor()`), `getSynergyCount()` (Interlocking Directorates), `tickDirectivesTrickle(dt)` (Terms of Reference accumulator flushed to `Game.directives`), `_scaleSynergyFactor(factor)` (Doctrine ramp).
- `js/ticker.js` — Ticker object: capped deduplicated queue (`MAX_ITEMS: 28`), `push(text, { source, dedupeKey, pinned })` entry point, dt-driven dynamic line generator (`tick(dt)` → `fireDynamicLine()` on 35–75s jittered cadence), 100 dynamic line definitions across 8 progression tiers gated by `_currentTier()`, token resolver (`resolveTokens()` + `_resolveStat()` whitelist), `rebuildDOM()` that preserves `animationDuration` on `#ticker-track`, `seedInitialQueue()` with the 6 canonical seed lines, save/restore
- `js/milestones.js` — Milestones object: 93 milestone definitions, condition checking, toast notifications, pushes to Ticker (`source: 'milestone'`), save/restore. Optional `hidden: true` field on definitions; `UI.renderHonours()` filters hidden+unfired entries out of the grid and the denominator count.
- `js/ui.js` — UI object: click handling (hit/miss detection), stamp/imprint/float animations, department list rendering, stat updates, right-panel tab switching, department renaming. Also hosts `CentreTabs` controller (centre panel tab bar + Registry/Honours/Restructuring/Operations view rendering, Save/Data actions, Options bindings). Global helpers: `formatNumber()` (with `NUMBER_SUFFIXES` table), `formatDuration()`, `applyTickerSpeed()`, `applyReducedMotion()`, reduced-motion ticker cycling functions. Exposes `UI.resetTickerCycleIndex()` so `Ticker.rebuildDOM` can reset the cycle after a DOM rewrite.
- `js/floorplan.js` — FloorPlan object: dynamic room/corridor/liminal-space rendering, organic growth, snapshot-diffing to skip unchanged frames
- `js/events.js` — RandomEvents object: two-tier spawn timers, six event definitions (Lost Form, Urgent Memo, Escaped Intern, Visiting Inspector, Policy Window, Mysterious Package). Each event's `spawn()` is responsible for wiring its own click handler (multi-choice events like Policy Window open a modal and call `catchEvent(choiceKey)` from its buttons). Buff system supports `scope: 'income' | 'click'` — click buffs route through `Upgrades.applyEffects()` so Forms/click stays in sync. Policy Window uses `_openPolicyModal(pair)` / `_cleanupPolicyModal()` helpers and ticks a draining `.event-policy-timer-bar` each frame. Mysterious Package rolls a weighted outcome at catch time (Directive outcome is filtered out when `Upgrades.directivesUnlocked` is false). Catch/miss pushes dedupe by event id so repeat catches can't flood the ticker.
- `js/restructuring.js` — Restructuring object: prestige system, 7 Precedent upgrade definitions (5 classic + Doctrine of Precedent + Interlocking Directorates), phase screen overlay, ceremonial overlay, perform/endPhase/enterPhaseFromLoad lifecycle, buy/afford helpers. `calculateGain()` applies Precedent-Setting's +10% bonus; `perform()` resets `Game.permanentRecordStacks` and `Upgrades.directivesTrickleAccumulator` alongside the usual run state.
- `js/save.js` — Save object: serialise/deserialise (save v11), localStorage persistence, auto-save interval, offline income calculation. v11 persists buff `scope` alongside each buff (missing `scope` defaults to `'income'` on restore for v10 saves). v10 persists `Game.permanentRecordStacks` and `Upgrades.directivesTrickleAccumulator` with `|| 0` defaults so v9 saves load cleanly. Auto-Filing upgrade adds +25% to offline income in the load path. `wipeAll()` sets a `_wiped` flag that makes subsequent `save()` calls no-op and removes the `beforeunload` listener so Dissolve can't be undone by the pre-reload auto-save.

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
- **Upgrades**: Department multipliers at ownership milestones 1/10/25/50/100 (all 9 tiers), 10 standard synergies + 2 deep synergies unlocked by tier-combination thresholds, passive behaviour changes, flavour/comedy upgrades. Purchased with Directives. "The Reorganisation" (150◈) gates the prestige system.
- **Prestige ("Restructuring")**: Full ascension-phase system. Resets Forms/Directives/departments/non-prestige upgrades + run-local state (`permanentRecordStacks`, `directivesTrickleAccumulator`); awards Precedents based on `floor(sqrt(runFormsEarned / 1,000,000))` with an optional +10% from Precedent-Setting. Enters a full-screen phase overlay where the player spends Precedents on 7 permanent upgrades (5 classic + 2 Precedent Synergies) before starting the next cycle. Each Precedent also gives permanent +1% compounding multiplier.

## Visual Design

Three-panel layout: left (click zone + stats), centre (organic office floor plan), right (purchase list + upgrade shop). Warm amber/cream/green palette with paper-grain texture. Floor plan grows organically like mould/mycelium — rooms are visual only, not clickable for purchasing.

## PoC Scope (from GDD)

Must-haves for a playable proof of concept: click mechanic with 5 upgrades, 5 department tiers, ~15 upgrades, milestone system (20+), news ticker (30+ lines), simplified living floor plan, localStorage save/load, offline income calculation.

## Post-PoC Extension Ideas (out of scope for now)

Brainstorm bucket for things that would make The Department a *game* rather than a proof of concept. Not prioritised, not committed to — just a catch-all so ideas aren't lost between sessions. Feel free to add, remove, promote into proper work.

### Content expansion
- **More department tiers beyond The Jurisdiction** — e.g. The Precedent, The Crown Appointment, The Founding Charter. Each would need a role in the synergy graph, not just bigger numbers.
- **More random events** — a third tier that only unlocks post-Restructuring. Candidates: The Audit (drains a % of Forms unless clicked away), The Whistleblower (offers a one-time Directive windfall but reduces passive income for 5 min), The Filing Strike (pauses a random tier for 30s), The Intern Uprising (click minigame).
- **Named staff / personalities** — occasionally a specific named Intern, Deputy, or Commissioner shows up as a one-shot event with dialogue. Deepens the "living organism" feel without needing a proper narrative.
- **Daily flavour** — one-line office gossip or memo that rotates each real-world day, seeded from the date. Tiny cost, big cosiness.
- **Unlockable office skins / palettes** — milestones or Restructuring counts unlock alternate colour schemes (Night Shift / Soviet Brutalist / 1970s Carpet). Cosmetic only.

### New systems
- **Active abilities** — cooldown-gated player actions. "Call an All-Staff Meeting" (×3 click power 30s), "Emergency Requisition" (instant 60s of passive income), "Shred a Cabinet" (dissolve a Filing Cabinet for an emergency Forms burst). Adds a layer of *play* between idle sessions.
- **Meta-prestige ("The Audit")** — second prestige layer above Restructuring. Reset all Precedents for "Commissions" that unlock structural changes (new tiers, new upgrade slots, new event types). Gives long-term goals to players who've maxed the current loop.
- **Negative / crisis events** — debuffs, forced choices, timed cleanups. Currently every random event is neutral-to-positive; adding stakes would make the buff system feel earned.
- **Department specialisation paths** — a mid-game choice to pivot The Department toward one of three archetypes (Bureaucratic / Legalistic / Technocratic), each modifying synergy behaviour. Lightweight build variety.
- **Milestone-driven rewards** — right now milestones are pure flavour + Permanent Record fuel. Some could grant a small Directive trickle, a one-time Precedent, or unlock a cosmetic, turning the Honours Board into a real progression vector.
- **A second click target** — e.g. a "triage" tray that appears intermittently and rewards dual-clicking both stamps in rhythm. Active-play richness without making idle worse.

### Depth / simulation
- **Multi-floor building** — the floor plan grows vertically once horizontal space is full. Aesthetic payoff for late-game sprawl.
- **Inter-tier paperwork flows** — visible paper moving along corridors between departments based on their effective rates. Mostly cosmetic but sells the "living organism" metaphor.
- **Weather in the archive** — pure joke: the existing "The Archive Breathes" milestone already implies seasonal weather between shelving units. Make it literal with subtle CSS gradients shifting through the day.

### Balance & economy
- **Proper balance pass** — resolves the "infinity overflow" bug after many Restructurings. Likely needs BigNumber or capped exponent notation plus retuned synergy/dept-mult costs.
- **Rebalance Permanent Record** — now that the milestone count jumped from 33 to 93, its per-stack value (+0.5% global) should probably halve or be curve-capped.
- **Event frequency tuning** — once crisis events exist, the 2–5 min / 15–30 min spawn windows will need rethinking.

### Polish & UX
- **Proper onboarding / tutorial** — a first-time player currently has no hand-holding. A few ghost hints ("try stamping the form", "your first Intern costs 15 Forms") would carry new players through the first five minutes.
- **Accessibility** — screen-reader labels, keyboard navigation for the centre tabs, high-contrast palette toggle, focusable buttons with visible focus rings.
- **Sound design** — stamp thud, paper rustle, distant humming filing cabinets, ticker teletype. The deadpan tone would benefit from audio *a lot*.
- **Statistics charts** — Registry tab shows numbers; an optional graphs tab could show Forms/sec over time, tier contribution pie chart, Precedents earned per Restructuring. Pure player candy.
- **Multiple save slots / cloud save** — currently one localStorage slot. Multiple slots unlock experimentation; cloud sync enables cross-device play.
- **Mobile / touch layout** — the three-panel layout doesn't collapse well on narrow viewports. A dedicated stacked layout would open the audience considerably.
- **Keyboard shortcuts** — space to stamp, B to buy max, Tab to switch centre tabs. For the power players.
- **Modding / content JSON** — lift departments, upgrades, milestones, events into a JSON file so the community can fork their own Departments (The University, The Hospital Trust, The HOA…).

### Narrative / tone
- **A buried story thread** — rare milestones hint at something older beneath the Department. What was here before the first Intern? Who wrote the original charter? Never answered directly; just enough to make players feel watched.
- **End-of-run epitaphs** — the Ceremonial Overlay currently shows a generic deadpan quote. Swap in randomised per-run epitaphs that reference the departing Department's actual stats ("The Department processed 4.2 million Forms and hired 73 Interns. It will not be missed. It will not be remembered. It will be filed.").
- **Achievements that lie** — a handful of milestones whose text is contradicted by reality. ("The Department has always had exactly 42 Sub-Committees. It has never had any other number.") Leans into the tone.
