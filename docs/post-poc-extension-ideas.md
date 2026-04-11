# Post-PoC Extension Ideas (out of scope for now)

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
