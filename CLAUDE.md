# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Department** is a bureaucratic incremental/idle game (similar to Cookie Clicker) where the player grows a single-clerk office into a self-sustaining administrative organism. The tone is warm, darkly funny, and deadpan — bureaucracy as a living thing. The player is not a character; they *are* The Department.

The full game design document lives at `docs/the-department-gdd.md` (v0.2).

## Project Status

Core gameplay loop is functional. The player can click to earn Forms, buy departments for passive income, and watch the floor plan grow organically. Save/load with offline income is working. Tech stack: vanilla HTML/CSS/JS (no build tools, no frameworks).

### What's done
- Click mechanic — APPROVE stamp with hit/miss detection (stamp-size-aware), animations (press, shake, imprint, floating text)
- All 8 department tiers with ~1.15× cost scaling and passive Forms/sec
- Department shop dynamically rendered from data, buy buttons auto-enable/disable each frame
- Organic floor plan — rooms inflate on first purchase, grow with ownership, mycelium corridors connect them, liminal spaces appear at thresholds
- localStorage save/load with auto-save (30s + beforeunload), offline income on return
- Game loop via requestAnimationFrame with delta-time ticking
- News ticker (static content, 6 items)
- Upgrades system — Directives (◈) resource with manual conversion (500 Forms → 1 Directive), unlocks at first Sub-Committee + 500 total Forms
- 5 click upgrades (Forms currency): Ballpoint Pen, Fresh Ink Pad, Carbon Copy, The In-Tray, Institutional Memory
- 8 department multiplier upgrades (Directives currency): one per tier at own-1 milestone, each ×2 output
- 3 passive/flavour upgrades (Directives): Redundancy Planning (+5% global), Motivational Poster (×1.001), The Memo (×1.10)
- Upgrades tab in right panel with available/purchased sections, auto-refreshing

### What's not done yet (PoC scope)
- Milestone system with flavour text (20+ milestones)
- Department name renaming (double-click)
- Prestige / Restructuring mechanic
- News ticker dynamic content (milestone-reactive, 30+ lines)
- Floor plan hover for per-department stats
- Synergy upgrades
- Additional department multiplier tiers (10/25/50/100 ownership milestones)

## Tech Stack & File Structure

- `index.html` — single-page entry point, loads all CSS and JS
- `css/main.css` — layout, panels, stamp animations, form box, stats, shop, ticker
- `css/floorplan.css` — floor plan rooms, corridors, liminal spaces, ambient glow
- `js/game.js` — Game object (state + tick), requestAnimationFrame loop, DOMContentLoaded init orchestration
- `js/departments.js` — Departments object with 8 tier definitions, cost scaling, buy logic, income recalculation
- `js/upgrades.js` — Upgrades object: 16 upgrade definitions (click/dept-mult/passive/flavour), Directives unlock/conversion, purchase logic, effect calculation
- `js/ui.js` — UI object: click handling (hit/miss detection), stamp/imprint/float animations, department list rendering, stat updates, tab switching
- `js/floorplan.js` — FloorPlan object: dynamic room/corridor/liminal-space rendering, organic growth, snapshot-diffing to skip unchanged frames
- `js/save.js` — Save object: serialise/deserialise, localStorage persistence, auto-save interval, offline income calculation

## Architecture Notes

- All game objects (`Game`, `Departments`, `Upgrades`, `UI`, `FloorPlan`, `Save`) are plain object literals on `window` — no modules, no classes, no build step.
- Script load order matters: `game.js` → `departments.js` → `upgrades.js` → `ui.js` → `floorplan.js` → `save.js`. Init sequence in DOMContentLoaded: `Save.load()` → `UI.init()` → `FloorPlan.init()` → `Save.startAutoSave()` → game loop.
- Department list in the right panel is rendered dynamically from `Departments.tiers` — no hardcoded HTML for shop items.
- Floor plan rooms are positioned with hand-tuned percentage coordinates. Corridors are calculated as pixel lines between room centres each update.
- Hit detection for stamp clicks shrinks the valid target by half the stamp's dimensions on each side, so the stamp visual must be mostly inside the form box to count as a hit.
- `FloorPlan.update()` uses a stringified snapshot of department ownership to skip DOM work when nothing changed.

## Core Mechanics Summary

- **Click action**: "APPROVE" rubber stamp onto a form box. Clean stamps generate Forms; mis-stamps (outside box) trigger rejection animation, no reward. Hit area stays generous.
- **Resources**: Forms (✦, primary), Directives (◈, mid-game manual conversion from Forms), Precedents (⌖, prestige meta-currency).
- **Departments**: 8 tiers (Intern → The Mandate), each with exponential cost scaling (~1.15×) and passive Forms/sec generation.
- **Upgrades**: Department multipliers (at ownership milestones 1/10/25/50/100), synergy upgrades, passive behaviour changes, flavour/comedy upgrades. Purchased with Directives.
- **Prestige ("Restructuring")**: Resets Forms/Directives/departments; retains Precedents. Each Precedent gives permanent +1% multiplier. Formula: `floor(sqrt(Forms / 1,000,000))`.

## Visual Design

Three-panel layout: left (click zone + stats), centre (organic office floor plan), right (purchase list + upgrade shop). Warm amber/cream/green palette with paper-grain texture. Floor plan grows organically like mould/mycelium — rooms are visual only, not clickable for purchasing.

## PoC Scope (from GDD)

Must-haves for a playable proof of concept: click mechanic with 5 upgrades, 5 department tiers, ~15 upgrades, milestone system (20+), news ticker (30+ lines), simplified living floor plan, localStorage save/load, offline income calculation.
