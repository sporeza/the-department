# The Department
### Game Design Document v0.2

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

*Example:* Own 15 Sub-Committees + 10 Oversight Bodies → unlock **"Jurisdictional Overlap"** → Sub-Committees and Oversight Bodies each gain +50% output per tier of the other owned.

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

---

## Visual Design Direction

### Layout
Three-panel layout, similar to Cookie Clicker:
- **Left panel**: The "click zone" — a large APPROVE rubber stamp above a form box, centred and prominent. Below it: stats display (Forms total, Forms/sec, and once unlocked, Directives balance + conversion button). The Department's name displayed here, double-clickable to rename.
- **Centre panel**: The **Office Floor Plan** — a living, organic map of the Department that grows as departments are purchased. Warm sepia/amber tones, slightly textured paper aesthetic. Department count badges on each room. Future: hover for per-department stats.
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

## Scope Definition for PoC

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
| **Click object** | APPROVE rubber stamp into a form box. Clean stamp = Forms generated + ink splatter. Mis-stamp = shake/red flash, no Forms. Hit area stays generous throughout. |
| **Floor plan role** | Supplements the right-panel purchase list. Visual + count badges only. Not clickable for purchasing. Future: hover/tap for per-department stats. |
| **Named protagonist** | None. The player is The Department. Default name "The Department", double-click anywhere on the name to rename. |
| **Restructuring tone** | Sombre, corporate, deadpan. No fourth-wall breaks. Language of internal memos throughout. |
| **Directives pacing** | Single-currency (Forms only) for early game. Directives unlocked at first Sub-Committee purchase + Forms threshold. Converted manually via a dedicated button at a fixed, visible exchange rate. |

---

*Document version 0.2 — design questions resolved.*
*The Department reserves the right to amend this document without notice.*
*Any amendments will be filed. Filing constitutes approval.*
