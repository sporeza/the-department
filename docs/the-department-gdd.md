# The Department
### Game Design Document v0.5

---

## Vision Statement

**The Department** is a bureaucratic incremental game where you grow a single-clerk office into an immortal, self-sustaining administrative organism. The central joke — that bureaucracy is alive, hungry, and impossible to stop — is also the central mechanic. The tone is warm, darkly funny, and visually organic: think mould spreading across a floor plan, or mycelium networking through a filing cabinet.

> *"No one created The Department. It simply became necessary."*

---

## Core Fantasy

The player is not a hero, villain, or god. They are **a process**. They don't control The Department — they *are* it. Every click, every hire, every restructuring is the system optimising itself. The game rewards the player for letting go and watching the organism breathe.

---

## Resource System

### Primary Resource: **Forms** (✦)
The core currency. Forms are filed, processed, generated, and consumed. The number always goes up. There is no storage cap, no overflow penalty. Forms begat Forms.

### Secondary Resource: **Directives** (◈)
A mid-game upgrade currency, **unlocked once the player purchases their first Sub-Committee** and has accumulated a minimum Forms threshold. Directives are not generated passively — they are converted manually from Forms via a dedicated "Convert to Directives" button that appears in the UI once the unlock condition is met. This keeps the early game uncluttered and makes the Directives unlock feel like a meaningful gear-shift.

The conversion rate is fixed and always visible (e.g. 500 Forms → 1 Directive). There is no cap on accumulation. The act of manually converting is itself a small active-play moment — a decision about whether to spend Forms on departments or compress them into upgrade currency. Directives represent institutional will — the system deciding what it wants to become next.

### Tertiary Resource (mid-game): **Precedents** (⌖)
Earned through specific milestones. Precedents are the meta-currency of the prestige system. They persist through Restructurings and provide permanent multipliers. Think of them as case law — once established, they cannot be undone.

---

## The Click Action

**"APPROVE"** — the player clicks a large rubber stamp into a form box displayed in the left panel. The stamp must land within the box boundaries to register as approved and generate Forms.

### Mechanics
- The click target is a clearly defined form box — large enough to be satisfying to click, but with defined edges.
- A **clean stamp** (click lands within the box) triggers the approval animation: ink hits paper, a satisfying thud, Forms credited.
- A **mis-stamp** (click lands partially or fully outside the box) triggers a brief **shake/rejection animation** — the form rattles, a small "VOID" or red flash appears, no Forms generated. This is a nod to the bureaucratic absurdity: even the system that generates the forms has rules about how forms must be generated.
- The mis-stamp mechanic is **forgiving early on** — the box is large and central. As click upgrades are purchased, the visual becomes more elaborate but the hit area never shrinks. The mis-stamp is a surprise, not a punishment.

### Visual Detail
The stamp object sits above the form box, slightly cocked at an angle. On click it drives down with a slight squash-and-stretch. The ink impression reads **"APPROVED"** in bold capitals with a faint ring border — classic rubber stamp aesthetic. A small ink-splatter particle effect radiates from the impact point on a clean stamp.

### Click Upgrades (early game pacing)
| Upgrade | Effect | Flavour Text |
|---|---|---|
| Ballpoint Pen | +1 Form/click | *"A standard-issue blue biro. It works."* |
| Fresh Ink Pad | +3 Forms/click | *"APPROVED. APPROVED. APPROVED."* |
| Carbon Copy | ×2 click output | *"Every form now generates its own shadow."* |
| The In-Tray | +10 Forms/click | *"It appeared on your desk one morning. No one knows who put it there."* |
| Institutional Memory | click output ×(1 + 0.01 per dept owned) | *"The building itself remembers how to file."* |

---

## Departments (Buildings)

Eight department tiers, each more absurd and more powerful than the last. Costs scale on a ~1.15× exponential curve per purchase (Cookie Clicker baseline).

Each department has a **flavour description**, a **passive income rate**, and a **visual presence** on the office floor plan.

---

### Tier 1 — **The Intern**
*Forms/sec: 0.1*
*Base cost: 15 Forms*

A single person, slightly confused, filing things into the wrong cabinet but with tremendous enthusiasm.

> *"They went to university for this. Probably."*

---

### Tier 2 — **The Filing Cabinet**
*Forms/sec: 0.5*
*Base cost: 100 Forms*

A beige four-drawer cabinet. It hums. Nobody installed a humming mechanism. Nobody investigates.

> *"Contains: Form 7B (triplicate), Form 7B (quadruplicate), and something sealed with wax that predates the building."*

---

### Tier 3 — **The Sub-Committee**
*Forms/sec: 4*
*Base cost: 1,100 Forms*

A group convened to discuss whether a group should be convened. Surprisingly productive.

> *"Meets on Tuesdays. Has been meeting since before Tuesdays were named."*

---

### Tier 4 — **The Procedure**
*Forms/sec: 20*
*Base cost: 12,000 Forms*

Not a person or a room. A process. It exists in the space between departments, consuming inputs and emitting outputs with clockwork indifference.

> *"There is a correct way to do this. The Procedure knows it. You will learn it."*

---

### Tier 5 — **The Division**
*Forms/sec: 110*
*Base cost: 130,000 Forms*

An entire wing of the building, now semi-autonomous. It requisitions its own supplies. It has its own break room. It has opinions.

> *"The Division filed a complaint about the Sub-Committee last Tuesday. The Sub-Committee is still discussing whether to convene about it."*

---

### Tier 6 — **The Oversight Body**
*Forms/sec: 600*
*Base cost: 1,400,000 Forms*

An entity created to monitor The Department that has since become larger than The Department. It monitors itself now. Efficiently.

> *"By charter, the Oversight Body cannot be overseen. This was considered a design flaw. It was later reclassified as a feature."*

---

### Tier 7 — **The Annex**
*Forms/sec: 3,200*
*Base cost: 20,000,000 Forms*

A building adjacent to the building, connected by a covered walkway nobody approved but everyone uses. The Annex has its own postcode. Its own water supply. It has begun issuing internal passports.

> *"Nobody is quite sure where the Annex ends and The Department begins. The Annex seems comfortable with this ambiguity."*

---

### Tier 8 — **The Mandate**
*Forms/sec: 18,000*
*Base cost: 330,000,000 Forms*

Not a place. A legal instrument that has achieved sentience through sheer administrative density. It governs. It is not clear what.

> *"The Mandate has existed in some form for longer than the government that created it. Several governments, actually. It outlasted them all. It will outlast you."*

---

## Upgrade System

Upgrades are purchased with **Directives** and fall into four categories:

### 1. Department Multipliers
Classic Cookie Clicker style — each department has a tier of upgrades that double its output when you own N of them (e.g., own 10 Interns → unlock "Intern Orientation Programme" → all Interns ×2).

Each department gets ~4 upgrades at ownership milestones: 1, 10, 25, 50, 100.

### 2. Synergy Upgrades
Unlocked based on owning combinations of department types. Reward players who diversify rather than stacking one department.

Synergies are housed in the **Directives shop** — not behind the Restructuring. They are among the game's richest writing, and burying them in a prestige layer means most players encounter them too late. The shop version keeps them readable on a first run. A small separate category of **Precedent Synergies** lives in the prestige layer for players on their second run or beyond (see *Prestige System: The Restructuring*).

#### Synergy Tier Structure

| Tier | Purchase Cost | Unlock Condition | Purpose |
|---|---|---|---|
| **Standard Synergies** | Directives | Own X of each department | Mutual output bonus to both departments |
| **Deep Synergies** | Directives (expensive) | Own higher counts + the relevant standard synergy already purchased | Stronger bonus; occasionally introduces a new rule |
| **Precedent Synergies** | Precedents | 2nd+ Restructuring | Permanent, run-persistent cross-department bonuses |

#### Standard Synergies

---

**Intern + Filing Cabinet**
> *"Misfiling Protocol"*
*Unlock: 10 Interns, 5 Filing Cabinets*
Effect: Interns gain +15% output per Filing Cabinet owned. Filing Cabinets gain +10% per Intern owned.
> *"It turns out the wrong cabinet was the right cabinet all along. No one questions this."*

---

**Filing Cabinet + Sub-Committee**
> *"Evidence-Based Review"*
*Unlock: 10 Filing Cabinets, 5 Sub-Committees*
Effect: Sub-Committees gain +1% output for every Filing Cabinet owned.
> *"The Sub-Committee required documentation. The Filing Cabinet provided it. The Sub-Committee is now reviewing whether the documentation requires its own documentation."*

---

**Sub-Committee + Oversight Body**
> *"Review of the Review"*
*Unlock: 20 Sub-Committees, 10 Oversight Bodies*
Effect: Each Oversight Body owned adds +3% to all Sub-Committee output. Each Sub-Committee owned adds +1% to all Oversight Body output. The asymmetry is intentional — the Oversight Body benefits less from being watched.
> *"The Oversight Body was asked to review the Sub-Committee's findings. The Sub-Committee was asked to prepare a summary of the review. The summary has been sent to the Oversight Body for review."*

---

**Sub-Committee + Procedure**
> *"Standing Orders"*
*Unlock: 15 Sub-Committees, 10 Procedures*
Effect: Each Procedure owned increases Sub-Committee output by +8%. Each Sub-Committee owned increases Procedure output by +5%.
> *"The Sub-Committee formalised The Procedure. The Procedure then formalised the Sub-Committee. Neither party can now be dissolved without the other's approval."*

---

**Procedure + Division**
> *"Operational Continuity"*
*Unlock: 10 Procedures, 5 Divisions*
Effect: Divisions gain +20% output per 5 Procedures owned, capped at 10 stacks.
> *"The Division runs The Procedure. The Procedure runs The Division. The distinction has been filed as non-essential."*

---

**Division + Oversight Body**
> *"Jurisdictional Overlap"*
*Unlock: 15 Divisions, 10 Oversight Bodies*
Effect: Divisions and Oversight Bodies each gain +50% output per tier of the other owned.
> *"The Division filed a formal query about where its jurisdiction ends. The Oversight Body is investigating whether it has jurisdiction over that query."*

---

**Oversight Body + Annex**
> *"Extended Jurisdiction"*
*Unlock: 5 Oversight Bodies, 5 Annexes*
Effect: Annexes gain +25% output. Oversight Bodies gain +10% output per Annex owned.
> *"The Oversight Body's remit now technically includes the Annex. The Annex has filed a query about whether the Oversight Body falls within the Annex's remit. The matter is under review."*

---

**Annex + Mandate**
> *"Territorial Instrument"*
*Unlock: 8 Annexes, 3 Mandates*
Effect: Each Mandate owned multiplies Annex output by ×1.5. Each Annex owned adds a flat +500 Forms/sec to each Mandate.
> *"The Mandate now governs the Annex. The Annex has issued internal passports in the Mandate's name. The Mandate has not been consulted. The Mandate does not require consultation."*

---

**Intern + Mandate** *(the full-arc pairing)*
> *"Career Trajectory"*
*Unlock: 50 Interns, 1 Mandate*
Effect: +5% to all department output.
The mechanical impact is modest. The joke is the point.
> *"The Intern has been here long enough to remember when the Mandate was just a thought. The Intern does not speak of this. The Mandate does not remember Interns."*

---

**Filing Cabinet + Mandate**
> *"Permanent Record"*
*Unlock: 25 Filing Cabinets, 2 Mandates*
Effect: All milestones and achievements now grant +0.5% permanent Forms/sec (stacks, resets on Restructuring).
> *"The Mandate requires a record of all things. The Filing Cabinet provides it. The record now includes a record of the record. The Forms/sec figures are technically correct."*

---

#### Deep Synergies

Purchased after the relevant standard synergy. Higher Directives cost, higher ownership threshold, larger reward. One deep synergy per pairing at most — not every standard synergy graduates to a deep version.

---

**Sub-Committee + Procedure (Deep)**
> *"Terms of Reference"*
*Unlock: "Standing Orders" already purchased + 30 Sub-Committees + 20 Procedures*
Effect: Sub-Committees and Procedures each produce a small passive trickle of Directives without manual conversion — a rare and meaningful exception to the conversion rule.
> *"Institutional will is now self-generating. This was not intended. It has been noted."*

---

**Oversight Body + Annex (Deep)**
> *"Regulatory Capture"*
*Unlock: "Extended Jurisdiction" already purchased + 15 Oversight Bodies + 10 Annexes*
Effect: The Oversight Body and the Annex swap 10% of their base output rates with each other, then both receive a ×1.5 multiplier to that blended value. Net result: a significant boost to both, with a flavour of institutional merger.
> *"It is no longer clear which body oversees the other. Both have filed documentation asserting primacy. Both documents have been accepted. Both have been filed. In the same cabinet."*

### 3. Passive Behaviour Upgrades
Change the fundamental rules of the game, usually unlocked via milestones.

| Upgrade | Effect |
|---|---|
| **Auto-Filing** | Forms generated passively even when tab is not active |
| **The Memo** | Every 60 seconds, a random department produces a burst equal to 5 minutes of its income |
| **Precedent-Setting** | Milestones now award bonus Precedents (+10%) |
| **Redundancy Planning** | Owning 2+ of any department tier grants +5% to all departments |
| **The Reorganisation** | Unlocks the Restructuring (prestige) mechanic |

### 4. Flavour/Novelty Upgrades
Low mechanical impact, high comedy. Mostly milestone rewards. They exist to be read.

> *"Motivational Poster" — +0.1% to all output. The poster depicts a cat hanging from a branch. The caption reads: PERSIST.*

---

## Milestone & Achievement System

Milestones trigger at resource thresholds, ownership counts, and time-based events. They serve two functions: **reward dopamine** and **deliver the game's voice**.

The ticker (à la Cookie Clicker's news ticker) runs across the bottom of the screen and surfaces recent milestones, absurdist in-universe news, and passive observations about the player's Department.

### Example Milestone Flavour Text

- *"You have filed 1,000 Forms. A small sense of accomplishment washes over you. The Department notes this in your file."*
- *"You have hired your first Intern. They have already lost something important."*
- *"The Sub-Committee has convened 100 times. Progress is being made on the definition of 'progress'."*
- *"The Department now generates more Forms per second than the average mid-sized nation. The average mid-sized nation is concerned."*
- *"You have reached 1 Billion Forms. The Department does not celebrate milestones. It notes them. It files the note. It files a note about the note."*
- *"The Annex has requested independence. The request has been filed. It is now the 4,772nd item in the queue."*

---

## The News Ticker

Runs along the bottom at all times. Mix of:
- **Progress commentary** (reacts to recent milestones)
- **In-universe absurdist news** (unconnected to player action, world-building through headlines)
- **Passive observations** about the player's specific Department state

### Example Ticker Lines
- *"Local department surpasses GDP of several nations; declines to comment"*
- *"Sub-Committee formed to investigate previous Sub-Committee; new Sub-Committee to be investigated by further Sub-Committee"*
- *"Intern missing since Tuesday; colleagues assume they found the filing room on sublevel 4 and are unable to leave"*
- *"The Mandate has amended itself again; legal scholars describe the new version as 'yes'"*
- *"Scientists confirm: bureaucracy is the universe's most stable structure, expected to outlast stars"*
- *"Department of Redundancy Department now largest department in The Department"*

---

## Random Events (Active Play Rewards)

Equivalent to Cookie Clicker's Golden Cookie — time-limited events that appear on screen and reward players who are actively watching. Passive players won't be punished for missing them, but attentive players are meaningfully rewarded.

Events are **not available in the very early game** — they unlock once the player owns their first Filing Cabinet, ensuring the core click mechanic is established before adding another layer of interaction.

Two tiers of event, differentiated by frequency, reward scale, and visual prominence:

---

### Tier 1 — Common Events
*Spawn every 2–5 minutes. Simple one-click interaction. Modest reward.*

These are the background texture of active play — a small bonus for players who happen to be watching, never punishing if missed.

**The Lost Form**
A single form drifts slowly across the centre panel, as if caught in an air vent current. Click to intercept and file it. Miss it and it disappears into the system, unprocessed, forever.
*Reward: a one-time Forms bonus equal to ~30 seconds of current income.*
> *"Form 14(c) — origin unknown, destination unclear. It passed through. You caught it. This has been noted."*

**The Urgent Memo**
A folded memo slides in from off-panel, stamped "URGENT — ACTION REQUIRED" in red. Click before it gets buried (disappears after 20 seconds). 
*Reward: +50% Forms/sec for 30 seconds.*
> *"The memo was urgent. All memos are urgent. Urgency is The Department's resting state."*

**The Escaped Intern**
An intern sprite wanders across the floor plan looking lost. Click to redirect them back to their desk.
*Reward: a small burst of Forms equal to that Intern's total output for the last 60 seconds.*
> *"They were found. They were returned to their station. They do not speak of sublevel 4."*

---

### Tier 2 — Rare Events
*Spawn every 15–30 minutes. Slightly more interaction required. Larger reward. More visually distinct.*

These feel like genuine events — worth interrupting what you're doing for. The rare tier also introduces a small decision or sequence, rewarding attentive players more than a simple click.

**The Visiting Inspector**
An inspector icon appears in the floor plan, moving slowly between rooms. Click to "prepare a report" before they complete their tour and leave.
*Reward: ×3 all department output for 60 seconds.*
> *"The Inspector found everything satisfactory. The Inspector always finds everything satisfactory. The Inspector has never found anything unsatisfactory."*

**The Policy Window**
A "New Policy Enacted" notice appears presenting **two options** — the player must choose one before the window expires. Introduces a small active decision rather than a pure reflex click.

Example option pairs:
- *"Streamline Processing" (+Forms/sec for 90s)* vs *"Discretionary Budget" (large one-time Forms bonus)*
- *"Mandatory Overtime" (×2 click output for 120s)* vs *"Staff Wellbeing Initiative" (all departments +25% for 60s)*

> *"Policy has been enacted. Compliance is assumed. Non-compliance has not been defined and therefore cannot occur."*

**The Mysterious Package**
A brown-paper package appears in the floor plan's reception area. Click to "process through intake." The contents are unknown until opened — could be a Forms windfall, a free department purchase, a temporary multiplier, or an elaborate joke with a minor reward.

Possible contents (weighted, rarer outcomes less likely):
- *"Assorted biscuits. Morale improved briefly."* — +5% all output for 60s
- *"Form 7B (triplicate). You already have these."* — small Forms bonus, flavour reward
- *"An unsigned Directive."* — bonus Directives (mid-game only)
- *"It is unclear what this is. It has been filed."* — moderate Forms bonus

> *"The package arrived. No sender. No return address. Intake processed it. This is their job."*

---

### Visual & UX Guidelines for Events

- **Tier 1 events** are subtle — they appear within the existing panels, don't interrupt gameplay, and use the existing warm palette. The Lost Form in particular should feel like you just happened to notice it.
- **Tier 2 events** are more prominent — a soft pulse or gentle glow draws the eye without being aggressive. The Policy Window appears as a formal notice overlay, consistent with the document aesthetic.
- **No audio stings** for Tier 1. A soft paper-shuffle sound for Tier 2 (if sound is implemented).
- **Miss penalty**: none. The event simply disappears. The news ticker may acknowledge it with a dry line (*"A memo passed through unattended. It has been filed under 'lost causes'."*)
- **Event history**: missed and collected events are logged in a small "Recent Events" list beneath the stats panel, purely for flavour. No mechanical consequence to reviewing it.

---

## The Department Name

The player's Department is simply called **"The Department"** by default. The name is displayed prominently in the left panel and can be **renamed by double-clicking it** — a small personalisation that reinforces ownership without introducing a named protagonist. There is no named clerk. The player is the institution, not a person within it.

---

## Prestige System: The Restructuring

When a player has accumulated enough Forms (unlocked via the **"The Reorganisation"** upgrade, available mid-game), they may trigger a **Restructuring**.

### What Happens
- All Forms, Directives, departments, and non-Precedent upgrades are reset
- The player retains all **Precedents** (⌖) earned
- The office floor plan "sheds" visually — old organism contracts, then begins regrowth
- A full-screen restructuring card appears with a quote, held for a beat before the new run begins

### Tone
The Restructuring is played **straight — sombre, corporate, inevitable**. There is no fourth-wall break, no wink to the player. The language is the deadpan of an internal memo. The horror is that it sounds completely reasonable. The new run beginning immediately after, with the same clerk in the same empty room, is the punchline.

### Restructuring Quotes
> *"The Department has been restructured. The Department is unchanged."*
> *"New leadership has been announced. The Department continues."*
> *"Following a review, several positions have been eliminated. The work of those positions continues, distributed across surviving roles, unacknowledged."*
> *"Change has occurred. It has been filed."*
> *"Efficiency has been identified as a priority. Efficiency will be implemented. Implementation has been filed."*

### Precedents (Meta-currency)
Earned based on Forms accumulated before Restructuring. Formula (approximate):

`Precedents = floor(sqrt(Forms / 1,000,000))`

Each Precedent owned provides a permanent +1% multiplier to all Form generation, compounding. By the third or fourth Restructuring, the game accelerates dramatically — the early game becomes a formality, which is itself a joke about institutional memory.

### Precedent Upgrades
Purchased once with Precedents, persist forever. These are the late-game metagame.

| Upgrade | Cost (Precedents) | Effect |
|---|---|---|
| Institutional Memory | 1 | Start each Restructuring with 1 Intern already hired |
| Continuity of Operations | 5 | Retain 5% of Forms on Restructuring |
| Established Procedure | 10 | Click output starts ×3 on new runs |
| Precedent of Scale | 25 | Unlock a 9th department tier (The Jurisdiction) from the start |
| The Eternal Mandate | 100 | All departments produce ×2. *"It was always thus."* |

### Precedent Synergies
A small, separate synergy category purchased with Precedents. These persist across all future Restructurings. There are only two or three — they should feel rare and permanent, like constitutional amendments. Unlike standard synergies (which require specific department pairings to be active), Precedent Synergies apply globally once purchased.

| Upgrade | Cost (Precedents) | Effect |
|---|---|---|
| **Doctrine of Precedent** | 15 | Synergy upgrade bonuses start each new run at 50% of their full value, scaling to 100% after 30 minutes. *"The Department has done this before. It remembers. Not everything — but enough."* |
| **Interlocking Directorates** | 30 | Owning 3 or more distinct synergy upgrades grants all departments an additional ×1.25 multiplier. *"At sufficient scale, everything is connected to everything. This is called efficiency. It is also called something else, but that word has been redacted."* |

---

## Visual Design Direction

### Layout
Three-panel layout, similar to Cookie Clicker:
- **Left panel**: The "click zone" — a large APPROVE rubber stamp above a form box, centred and prominent. Below it: stats display (Forms total, Forms/sec, and once unlocked, Directives balance + conversion button). The Department's name displayed here, double-clickable to rename.
- **Centre panel**: Dual-purpose. **Default view: the Office Floor Plan** — a living, organic map of the Department. When a tab is selected from the tab bar at the top of the panel, the floor plan is replaced by the corresponding admin view (Registry, Honours Board, Restructuring, or Operations). Clicking back to the floor plan tab restores the visual. The tab bar is always visible at the top of the centre panel regardless of which view is active.
- **Right panel**: Department list (purchase), with a tab switch to the Upgrade shop once Directives are unlocked.

### Aesthetic
- **Palette**: Warm amber, aged cream, bureaucratic green, ink black, with occasional flashes of institutional red (for alerts/milestones).
- **Texture**: Subtle paper grain overlay on all panels. Forms and documents have visible line-rule texture.
- **Typography**: A characterful serif for headings (something like a government-document typeface), monospace for numbers (they feel more "processed"), and a slightly imperfect body font for flavour text.
- **Animation**: 
  - The APPROVE stamp drives down with squash-and-stretch on click; ink-splatter particles on clean stamp; form box shakes and flashes red on mis-stamp.
  - Forms "approved" on clean click drift upward as small ghosted form silhouettes and dissolve, like paper catching a breeze.
  - The floor plan grows organically — rooms inflate and connect like cells, not snap into place like buildings.
  - The Restructuring screen shows the floor plan contracting and going dark, then a single clerk appearing in an empty room, a lone unstamped form on the desk.

### The Floor Plan (Living Visual)
The floor plan is a **visual supplement** to the department list in the right panel — it does not replace it, and rooms are not clickable for purchasing. Its role is atmospheric and informational:

- Interconnected rooms labelled with department names and a **count badge** showing how many of that department are owned
- Mycelium-like connective tissue (filing corridors, walkways, tubes) growing between rooms as the Department expands
- Warm lighting that pulses gently with income generation
- Unlabelled liminal spaces appearing as the Department grows larger than anyone planned

**Future scope**: Rooms will eventually be hoverable/tappable to surface per-department statistics — total Forms generated by that department, upgrade status, and a short flavour note. This turns the floor plan into a living dashboard without adding purchasing complexity to it.

---

## Centre Panel Tabs

The centre panel hosts a persistent tab bar across the top. The **Floor Plan tab is the default** and the one players will spend most time on. The other four tabs replace the floor plan with a full-panel admin view when selected. All tabs are always visible in the bar; the Restructuring tab is greyed out and locked until "The Reorganisation" upgrade is purchased.

---

### Tab 1 — **The Floor Plan** *(default)*
The living office visual. See *The Floor Plan* section above. This is the ambient, atmospheric home screen of the game — the view you return to after checking stats or filing a save.

---

### Tab 2 — **The Registry** *(Stats)*

All measurable facts about The Department, formatted as an official internal ledger. Two columns: all-time lifetime stats and current-run stats (resets on Restructuring).

**Lifetime stats:**
- Total Forms filed
- Total Directives converted
- Total Restructurings survived
- Total Precedents earned (all-time)
- All-time peak Forms/sec
- Total random events caught / missed
- Total achievements earned
- Time The Department has existed

**Current run stats:**
- Forms filed this run
- Departments owned (total and by tier)
- Upgrades purchased
- Time since last Restructuring
- Precedents held (current)
- Projected Precedents on next Restructuring

Flavour header: *"The following records are accurate as of the time of filing. The time of filing is not disclosed."*

---

### Tab 3 — **The Honours Board** *(Achievements)*

Earned achievements displayed as framed certificates or stamped commendations — warm, slightly pompous, bureaucratically formal. Two states:

- **Earned**: Displayed in full with title, description, and date earned. Formatted like a certificate of commendation.
- **Locked**: Shown as a redacted document — title replaced with a black bar, description partially visible as a vague hint only. *"[REDACTED] — Awarded for conduct relating to [REDACTED]."*

This makes the achievements panel itself a discovery mechanic — players can see there are more certificates to earn without knowing exactly what they are.

Example achievements:
- *"Oriented" — Hired your first Intern. They will be fine.*
- *"The Procedure Is The Procedure" — Purchased The Procedure for the first time.*
- *"Efficiency, Noted" — Reached 100 Forms/sec.*
- *"Restructured, Unchanged" — Completed your first Restructuring.*
- *"Sublevel 4" — Missed 10 Escaped Intern events. They are still down there.*
- *"The Eternal Bureaucrat" — Survived 10 Restructurings.*

---

### Tab 4 — **Restructuring** *(Prestige — locked until mid-game)*

Locked and greyed out until the player purchases "The Reorganisation" upgrade. Once unlocked, displays:

- Current Precedents balance
- Precedents that would be earned by restructuring now (live calculation, updates as Forms accumulate)
- A summary of what will be lost (everything) and what will be retained (Precedents, Precedent upgrades)
- The **RESTRUCTURE** button — styled as a large, serious stamp marked "FOR OFFICIAL USE ONLY", requiring a confirmation click

The panel itself is formatted as an official restructuring notice, deadpan and corporate throughout. No warnings, no drama — just procedure.

> *"Initiating a Restructuring will dissolve all current departments, forms, and directives. This action is in accordance with Standard Procedure 7(b). The Department will continue."*

---

### Tab 5 — **Operations** *(Save / Options)*

Administrative functions, framed as operational procedures. Clean and functional — this is the settings panel, so clarity beats atmosphere here, though the language stays in-universe.

**Save & Data:**
- **File Current State** — manual save to localStorage (with timestamp of last save shown)
- **Submit to Archive** — export save as a text string (for backup or sharing)
- **Retrieve from Archive** — import save from a text string
- **Initiate Total Dissolution** — wipe save entirely. Requires typing "CONFIRMED" into a field. Flavour: *"This action will dissolve The Department completely. It will be as if it never existed. Proceed only if authorised."*

**Options:**
- Offline income: on / off
- News ticker speed: slow / normal / fast
- Reduced motion: on / off (disables non-essential animations)
- Number formatting: full numbers / abbreviated (1.2M) / scientific notation

---

### Centre Panel Tab — PoC Scope

For the PoC, implement all five tabs with the following priority:

| Tab | PoC Status |
|---|---|
| Floor Plan | Must Have |
| The Registry | Must Have — even stub stats establish the voice |
| Operations | Must Have — save/load is in the must-have list |
| Honours Board | Should Have |
| Restructuring | Should Have (gated behind upgrade anyway) |

To build a genuinely playable, portfolio-ready PoC, the minimum viable feature set is:

### Must Have
- [x] Core click mechanic with upgrade path (5 click upgrades)
- [x] 5 department tiers (Intern through Oversight Body)
- [x] ~15 upgrades (mix of department multipliers + passive behaviours)
- [x] Milestone system with flavour text (20+ milestones)
- [x] News ticker (30+ lines)
- [x] Living floor plan visual (simplified — rooms appear and grow)
- [x] Save/load (localStorage)
- [x] Offline income calculation

### Should Have
- [ ] All 8 department tiers
- [ ] Synergy upgrades
- [ ] Restructuring (prestige) mechanic with Precedents
- [ ] 3 Precedent upgrades
- [ ] Animated floor plan (organic growth)

### Nice to Have
- [ ] Mini-game (e.g., The Procedure mini-game — a rhythm/timing mechanic for burst income)
- [ ] Full Precedent upgrade tree
- [ ] Sound design (rubber stamp, paper shuffle, distant printer)
- [ ] Mobile-responsive layout

---

## Resolved Design Decisions

| Question | Decision |
|---|---|
| **Synergy upgrade placement** | Standard and Deep synergies live in the Directives shop — not behind the Restructuring. They carry the game's best writing and should be readable on a first run. A separate Precedent Synergies category (2–3 upgrades only) lives in the prestige layer for subsequent runs. |
| **Click object** | APPROVE rubber stamp into a form box. Clean stamp = Forms generated + ink splatter. Mis-stamp = shake/red flash, no Forms. Hit area stays generous throughout. |
| **Floor plan role** | Supplements the right-panel purchase list. Visual + count badges only. Not clickable for purchasing. Future: hover/tap for per-department stats. |
| **Named protagonist** | None. The player is The Department. Default name "The Department", double-click anywhere on the name to rename. |
| **Restructuring tone** | Sombre, corporate, deadpan. No fourth-wall breaks. Language of internal memos throughout. |
| **Centre panel admin** | Five tabs in the centre panel tab bar. Floor Plan is default. Other tabs (Registry, Honours Board, Restructuring, Operations) replace the floor plan when active. Restructuring tab locked until "The Reorganisation" upgrade purchased. |

---

*Document version 0.5 — synergy upgrade system fully specified; Precedent Synergies added to prestige layer.*
*The Department reserves the right to amend this document without notice.*
*Any amendments will be filed. Filing constitutes approval.*
