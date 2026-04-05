# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Department** is a bureaucratic incremental/idle game (similar to Cookie Clicker) where the player grows a single-clerk office into a self-sustaining administrative organism. The tone is warm, darkly funny, and deadpan — bureaucracy as a living thing. The player is not a character; they *are* The Department.

The full game design document lives at `docs/the-department-gdd.md` (v0.2).

## Project Status

Visual skeleton complete. Tech stack: vanilla HTML/CSS/JS (no build tools, no frameworks). The three-panel layout, APPROVE stamp, form box, floor plan placeholder, department shop, news ticker, and full visual styling are in place. No game logic wired yet.

## Tech Stack & File Structure

- `index.html` — single-page entry point, loads all CSS and JS
- `css/main.css` — layout, panels, stamp, form box, stats, shop, ticker
- `css/floorplan.css` — centre-panel floor plan rooms, corridors, ambient glow
- `js/game.js` — (stub) core game state, main loop, tick calculations
- `js/departments.js` — (stub) department data, cost scaling, purchasing
- `js/upgrades.js` — (stub) upgrade definitions, unlock conditions
- `js/ui.js` — (stub) DOM updates, tab switching, name renaming, ticker
- `js/floorplan.js` — (stub) floor plan rendering, room placement, growth
- `js/save.js` — (stub) localStorage save/load, offline income

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
