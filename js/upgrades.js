/**
 * upgrades.js — Upgrade definitions (click upgrades, department multipliers,
 * synergy upgrades, deep synergies, passive behaviours), unlock conditions,
 * and purchase handling.
 *
 * Click upgrades are bought with Forms (early game).
 * All other upgrades are bought with Directives (mid-game).
 *
 * Synergy upgrades use category 'synergy' and may carry an effect.bonuses[]
 * array of per-tier rules. Their contributions are wrapped in the Doctrine
 * of Precedent scale when that Precedent Synergy is owned.
 */

const Upgrades = {
  // Directives unlock: first Sub-Committee purchased + 500 total Forms earned
  DIRECTIVES_FORMS_THRESHOLD: 500,
  CONVERSION_RATE: 500,          // 500 Forms → 1 Directive
  directivesUnlocked: false,

  purchased: {},   // { upgradeId: true }

  // Fractional Directives accumulated by Terms of Reference (whole units flushed to Game.directives each tick)
  directivesTrickleAccumulator: 0,

  definitions: [
    // ── Click Upgrades (bought with Forms) ──────────────────────
    {
      id: 'ballpoint-pen',
      name: 'Ballpoint Pen',
      desc: 'A standard-issue blue biro. It works.',
      category: 'click',
      currency: 'forms',
      cost: 100,
      effect: { type: 'click-add', value: 1 },
      unlock: () => true
    },
    {
      id: 'fresh-ink-pad',
      name: 'Fresh Ink Pad',
      desc: 'APPROVED. APPROVED. APPROVED.',
      category: 'click',
      currency: 'forms',
      cost: 500,
      effect: { type: 'click-add', value: 3 },
      unlock: () => Upgrades.has('ballpoint-pen')
    },
    {
      id: 'carbon-copy',
      name: 'Carbon Copy',
      desc: 'Every form now generates its own shadow.',
      category: 'click',
      currency: 'forms',
      cost: 5000,
      effect: { type: 'click-mult', value: 2 },
      unlock: () => Upgrades.has('fresh-ink-pad')
    },
    {
      id: 'the-in-tray',
      name: 'The In-Tray',
      desc: 'It appeared on your desk one morning. No one knows who put it there.',
      category: 'click',
      currency: 'forms',
      cost: 50000,
      effect: { type: 'click-add', value: 10 },
      unlock: () => Upgrades.has('carbon-copy')
    },
    {
      id: 'institutional-memory',
      name: 'Institutional Memory',
      desc: 'The building itself remembers how to file.',
      category: 'click',
      currency: 'forms',
      cost: 500000,
      effect: { type: 'click-dept-bonus' },   // ×(1 + 0.01 per dept owned)
      unlock: () => Upgrades.has('the-in-tray')
    },

    // ── Department Multipliers — Own 1 (×2) ─────────────────────
    {
      id: 'intern-orientation',
      name: 'Intern Orientation Programme',
      desc: 'A three-hour seminar on the location of the photocopier. Productivity doubles.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 1,
      effect: { type: 'dept-mult', target: 'intern', value: 2 },
      unlock: () => Departments.getOwned('intern') >= 1
    },
    {
      id: 'filing-alphabetisation',
      name: 'Filing System Alphabetisation',
      desc: 'Someone has finally alphabetised the cabinets. A golden age begins.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 5,
      effect: { type: 'dept-mult', target: 'filing-cabinet', value: 2 },
      unlock: () => Departments.getOwned('filing-cabinet') >= 1
    },
    {
      id: 'sub-committee-charter',
      name: 'Sub-Committee Charter',
      desc: 'The Sub-Committee now has a charter. The charter has a sub-charter. Progress.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 10,
      effect: { type: 'dept-mult', target: 'sub-committee', value: 2 },
      unlock: () => Departments.getOwned('sub-committee') >= 1
    },
    {
      id: 'standard-operating-procedure',
      name: 'Standard Operating Procedure',
      desc: 'The Procedure now has a procedure for its own procedure. Efficiency is inevitable.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 25,
      effect: { type: 'dept-mult', target: 'procedure', value: 2 },
      unlock: () => Departments.getOwned('procedure') >= 1
    },
    {
      id: 'divisional-autonomy',
      name: 'Divisional Autonomy',
      desc: 'The Division has been granted autonomy. It immediately uses it to request more autonomy.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 50,
      effect: { type: 'dept-mult', target: 'division', value: 2 },
      unlock: () => Departments.getOwned('division') >= 1
    },
    {
      id: 'oversight-expansion',
      name: 'Expanded Oversight',
      desc: 'The Oversight Body now oversees its own oversight. Watchers watching watchers.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 100,
      effect: { type: 'dept-mult', target: 'oversight-body', value: 2 },
      unlock: () => Departments.getOwned('oversight-body') >= 1
    },
    {
      id: 'annex-integration',
      name: 'Annex Integration Protocol',
      desc: 'The Annex has been formally integrated. The paperwork acknowledging its existence took longer than building it.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 250,
      effect: { type: 'dept-mult', target: 'annex', value: 2 },
      unlock: () => Departments.getOwned('annex') >= 1
    },
    {
      id: 'mandate-amendment',
      name: 'The First Amendment',
      desc: 'The Mandate has been amended. Legal scholars describe the amendment as "also yes".',
      category: 'dept-mult',
      currency: 'directives',
      cost: 500,
      effect: { type: 'dept-mult', target: 'mandate', value: 2 },
      unlock: () => Departments.getOwned('mandate') >= 1
    },
    {
      id: 'jurisdiction-doctrine',
      name: 'Jurisdictional Doctrine',
      desc: 'The Jurisdiction has codified the law of itself. It now governs its own governance.',
      category: 'dept-mult',
      currency: 'directives',
      cost: 1000,
      effect: { type: 'dept-mult', target: 'jurisdiction', value: 2 },
      unlock: () => Departments.getOwned('jurisdiction') >= 1
    },

    // ── Department Multipliers — Own 10 (×2, cost ×5) ───────────
    {
      id: 'intern-mult-10',
      name: 'Intern Cohort Drill',
      desc: 'Ten Interns moving as one. They have begun finishing each other\u2019s sentences. The sentences are usually misfiled.',
      category: 'dept-mult', currency: 'directives', cost: 5,
      effect: { type: 'dept-mult', target: 'intern', value: 2 },
      unlock: () => Departments.getOwned('intern') >= 10
    },
    {
      id: 'filing-mult-10',
      name: 'Cross-Reference Index',
      desc: 'Ten cabinets, fully indexed. Everything can be found. Most things should not be.',
      category: 'dept-mult', currency: 'directives', cost: 25,
      effect: { type: 'dept-mult', target: 'filing-cabinet', value: 2 },
      unlock: () => Departments.getOwned('filing-cabinet') >= 10
    },
    {
      id: 'sub-committee-mult-10',
      name: 'Standing Sub-Committee',
      desc: 'Ten Sub-Committees, all standing. None of them sit. Nobody is sure why.',
      category: 'dept-mult', currency: 'directives', cost: 50,
      effect: { type: 'dept-mult', target: 'sub-committee', value: 2 },
      unlock: () => Departments.getOwned('sub-committee') >= 10
    },
    {
      id: 'procedure-mult-10',
      name: 'Procedural Manual',
      desc: 'Ten Procedures, one manual. The manual has chapters about itself. The chapters reference each other.',
      category: 'dept-mult', currency: 'directives', cost: 125,
      effect: { type: 'dept-mult', target: 'procedure', value: 2 },
      unlock: () => Departments.getOwned('procedure') >= 10
    },
    {
      id: 'division-mult-10',
      name: 'Divisional Synergies',
      desc: 'Ten Divisions, formally aligned. The alignment document is itself divided.',
      category: 'dept-mult', currency: 'directives', cost: 250,
      effect: { type: 'dept-mult', target: 'division', value: 2 },
      unlock: () => Departments.getOwned('division') >= 10
    },
    {
      id: 'oversight-mult-10',
      name: 'Oversight Council',
      desc: 'Ten Oversight Bodies have formed a Council. The Council oversees the Bodies. The Bodies oversee the Council.',
      category: 'dept-mult', currency: 'directives', cost: 500,
      effect: { type: 'dept-mult', target: 'oversight-body', value: 2 },
      unlock: () => Departments.getOwned('oversight-body') >= 10
    },
    {
      id: 'annex-mult-10',
      name: 'Annex Network',
      desc: 'Ten Annexes, all interconnected by walkways nobody approved. The walkways have walkways now.',
      category: 'dept-mult', currency: 'directives', cost: 1250,
      effect: { type: 'dept-mult', target: 'annex', value: 2 },
      unlock: () => Departments.getOwned('annex') >= 10
    },
    {
      id: 'mandate-mult-10',
      name: 'Compound Mandate',
      desc: 'Ten Mandates, each governing the others. None has been amended. None requires amending.',
      category: 'dept-mult', currency: 'directives', cost: 2500,
      effect: { type: 'dept-mult', target: 'mandate', value: 2 },
      unlock: () => Departments.getOwned('mandate') >= 10
    },
    {
      id: 'jurisdiction-mult-10',
      name: 'Layered Jurisdictions',
      desc: 'Ten Jurisdictions, stacked vertically in conceptual space. The lower courts cannot see the upper ones. The upper ones do not look down.',
      category: 'dept-mult', currency: 'directives', cost: 5000,
      effect: { type: 'dept-mult', target: 'jurisdiction', value: 2 },
      unlock: () => Departments.getOwned('jurisdiction') >= 10
    },

    // ── Department Multipliers — Own 25 (×2, cost ×25) ──────────
    {
      id: 'intern-mult-25',
      name: 'The Intern Programme',
      desc: '25 Interns. A formal programme has emerged. It has a logo. The logo has a deeper meaning that nobody has been told.',
      category: 'dept-mult', currency: 'directives', cost: 25,
      effect: { type: 'dept-mult', target: 'intern', value: 2 },
      unlock: () => Departments.getOwned('intern') >= 25
    },
    {
      id: 'filing-mult-25',
      name: 'The Master Catalogue',
      desc: '25 cabinets, one catalogue. The catalogue is itself catalogued. The cataloguer is missing.',
      category: 'dept-mult', currency: 'directives', cost: 125,
      effect: { type: 'dept-mult', target: 'filing-cabinet', value: 2 },
      unlock: () => Departments.getOwned('filing-cabinet') >= 25
    },
    {
      id: 'sub-committee-mult-25',
      name: 'Subcommittee of Subcommittees',
      desc: '25 Sub-Committees have formed a meta-Sub-Committee. It convenes to discuss the convening of others.',
      category: 'dept-mult', currency: 'directives', cost: 250,
      effect: { type: 'dept-mult', target: 'sub-committee', value: 2 },
      unlock: () => Departments.getOwned('sub-committee') >= 25
    },
    {
      id: 'procedure-mult-25',
      name: 'Procedural Codex',
      desc: '25 Procedures, formalised in a Codex. The Codex has gravity. Light bends slightly around it.',
      category: 'dept-mult', currency: 'directives', cost: 625,
      effect: { type: 'dept-mult', target: 'procedure', value: 2 },
      unlock: () => Departments.getOwned('procedure') >= 25
    },
    {
      id: 'division-mult-25',
      name: 'Inter-Divisional Liaison',
      desc: '25 Divisions, communicating exclusively via memoranda. The memoranda have begun replying to each other.',
      category: 'dept-mult', currency: 'directives', cost: 1250,
      effect: { type: 'dept-mult', target: 'division', value: 2 },
      unlock: () => Departments.getOwned('division') >= 25
    },
    {
      id: 'oversight-mult-25',
      name: 'Oversight Tribunal',
      desc: '25 Oversight Bodies sit in tribunal. The tribunal oversees itself. Its findings are sealed.',
      category: 'dept-mult', currency: 'directives', cost: 2500,
      effect: { type: 'dept-mult', target: 'oversight-body', value: 2 },
      unlock: () => Departments.getOwned('oversight-body') >= 25
    },
    {
      id: 'annex-mult-25',
      name: 'Annex Confederation',
      desc: '25 Annexes have formed a confederation. They have their own flag. Nobody has seen it.',
      category: 'dept-mult', currency: 'directives', cost: 6250,
      effect: { type: 'dept-mult', target: 'annex', value: 2 },
      unlock: () => Departments.getOwned('annex') >= 25
    },
    {
      id: 'mandate-mult-25',
      name: 'Mandate Compendium',
      desc: '25 Mandates, bound together. The binding is older than the Mandates. The binding may be the point.',
      category: 'dept-mult', currency: 'directives', cost: 12500,
      effect: { type: 'dept-mult', target: 'mandate', value: 2 },
      unlock: () => Departments.getOwned('mandate') >= 25
    },
    {
      id: 'jurisdiction-mult-25',
      name: 'Concurrent Jurisdictions',
      desc: '25 Jurisdictions, none aware of the others. Each believes itself supreme. Each is correct, in its own context.',
      category: 'dept-mult', currency: 'directives', cost: 25000,
      effect: { type: 'dept-mult', target: 'jurisdiction', value: 2 },
      unlock: () => Departments.getOwned('jurisdiction') >= 25
    },

    // ── Department Multipliers — Own 50 (×2, cost ×125) ─────────
    {
      id: 'intern-mult-50',
      name: 'Career Pathway',
      desc: '50 Interns, on a formal career pathway. The pathway loops back on itself after seven years.',
      category: 'dept-mult', currency: 'directives', cost: 125,
      effect: { type: 'dept-mult', target: 'intern', value: 2 },
      unlock: () => Departments.getOwned('intern') >= 50
    },
    {
      id: 'filing-mult-50',
      name: 'Climate-Controlled Storage',
      desc: '50 cabinets, environmentally maintained. Nothing yellows. Nothing decays. Nothing leaves.',
      category: 'dept-mult', currency: 'directives', cost: 625,
      effect: { type: 'dept-mult', target: 'filing-cabinet', value: 2 },
      unlock: () => Departments.getOwned('filing-cabinet') >= 50
    },
    {
      id: 'sub-committee-mult-50',
      name: 'Permanent Convening',
      desc: '50 Sub-Committees in permanent session. None has ever been adjourned. None has ever finished a sentence.',
      category: 'dept-mult', currency: 'directives', cost: 1250,
      effect: { type: 'dept-mult', target: 'sub-committee', value: 2 },
      unlock: () => Departments.getOwned('sub-committee') >= 50
    },
    {
      id: 'procedure-mult-50',
      name: 'Procedural Singularity',
      desc: '50 Procedures, all running simultaneously. Their outputs feed each other\u2019s inputs. Nothing escapes.',
      category: 'dept-mult', currency: 'directives', cost: 3125,
      effect: { type: 'dept-mult', target: 'procedure', value: 2 },
      unlock: () => Departments.getOwned('procedure') >= 50
    },
    {
      id: 'division-mult-50',
      name: 'Divisional Sovereignty',
      desc: '50 Divisions, each declaring sovereignty. The declarations have all been filed. The filing has been declared.',
      category: 'dept-mult', currency: 'directives', cost: 6250,
      effect: { type: 'dept-mult', target: 'division', value: 2 },
      unlock: () => Departments.getOwned('division') >= 50
    },
    {
      id: 'oversight-mult-50',
      name: 'Recursive Oversight',
      desc: '50 Oversight Bodies. Each oversees the next. The chain is circular. The chain is also a square. The chain is unclear.',
      category: 'dept-mult', currency: 'directives', cost: 12500,
      effect: { type: 'dept-mult', target: 'oversight-body', value: 2 },
      unlock: () => Departments.getOwned('oversight-body') >= 50
    },
    {
      id: 'annex-mult-50',
      name: 'Annex Hegemony',
      desc: '50 Annexes. They no longer consider themselves adjacent to anything. They are the centre. Everything else is the annex of them.',
      category: 'dept-mult', currency: 'directives', cost: 31250,
      effect: { type: 'dept-mult', target: 'annex', value: 2 },
      unlock: () => Departments.getOwned('annex') >= 50
    },
    {
      id: 'mandate-mult-50',
      name: 'Constitutional Mandate',
      desc: '50 Mandates have ratified themselves. They are now constitutional. The constitution refers to them as \u201cthe usual\u201d.',
      category: 'dept-mult', currency: 'directives', cost: 62500,
      effect: { type: 'dept-mult', target: 'mandate', value: 2 },
      unlock: () => Departments.getOwned('mandate') >= 50
    },
    {
      id: 'jurisdiction-mult-50',
      name: 'Universal Jurisdiction',
      desc: '50 Jurisdictions claim universal authority. They are not in conflict. They have agreed to disagree on the meaning of \u201cuniversal\u201d.',
      category: 'dept-mult', currency: 'directives', cost: 125000,
      effect: { type: 'dept-mult', target: 'jurisdiction', value: 2 },
      unlock: () => Departments.getOwned('jurisdiction') >= 50
    },

    // ── Department Multipliers — Own 100 (×2, cost ×625) ────────
    {
      id: 'intern-mult-100',
      name: 'Generational Intake',
      desc: '100 Interns. Some have been here long enough to forget what they were originally hired for. They have been promoted in place.',
      category: 'dept-mult', currency: 'directives', cost: 625,
      effect: { type: 'dept-mult', target: 'intern', value: 2 },
      unlock: () => Departments.getOwned('intern') >= 100
    },
    {
      id: 'filing-mult-100',
      name: 'The Archive Eternal',
      desc: '100 cabinets. The archive has begun to dream. The dreams are also being filed.',
      category: 'dept-mult', currency: 'directives', cost: 3125,
      effect: { type: 'dept-mult', target: 'filing-cabinet', value: 2 },
      unlock: () => Departments.getOwned('filing-cabinet') >= 100
    },
    {
      id: 'sub-committee-mult-100',
      name: 'The Quorum Eternal',
      desc: '100 Sub-Committees. A permanent quorum has been achieved. The quorum cannot be dissolved. The quorum cannot agree on anything.',
      category: 'dept-mult', currency: 'directives', cost: 6250,
      effect: { type: 'dept-mult', target: 'sub-committee', value: 2 },
      unlock: () => Departments.getOwned('sub-committee') >= 100
    },
    {
      id: 'procedure-mult-100',
      name: 'The Procedure Itself',
      desc: '100 Procedures, indistinguishable from one another. They are now considered one Procedure with 100 instances. The instance count is itself a Procedure.',
      category: 'dept-mult', currency: 'directives', cost: 15625,
      effect: { type: 'dept-mult', target: 'procedure', value: 2 },
      unlock: () => Departments.getOwned('procedure') >= 100
    },
    {
      id: 'division-mult-100',
      name: 'Divisional Continuum',
      desc: '100 Divisions. The boundaries between them have blurred into a continuous administrative gradient.',
      category: 'dept-mult', currency: 'directives', cost: 31250,
      effect: { type: 'dept-mult', target: 'division', value: 2 },
      unlock: () => Departments.getOwned('division') >= 100
    },
    {
      id: 'oversight-mult-100',
      name: 'Total Oversight',
      desc: '100 Oversight Bodies. Nothing happens that is not observed. Nothing is observed that is not reviewed. Nothing is reviewed that is not filed.',
      category: 'dept-mult', currency: 'directives', cost: 62500,
      effect: { type: 'dept-mult', target: 'oversight-body', value: 2 },
      unlock: () => Departments.getOwned('oversight-body') >= 100
    },
    {
      id: 'annex-mult-100',
      name: 'Annex Empire',
      desc: '100 Annexes. They have collectively redrawn the boundaries of The Department. The new boundaries are circular. The centre is no longer present.',
      category: 'dept-mult', currency: 'directives', cost: 156250,
      effect: { type: 'dept-mult', target: 'annex', value: 2 },
      unlock: () => Departments.getOwned('annex') >= 100
    },
    {
      id: 'mandate-mult-100',
      name: 'The Hundredfold Mandate',
      desc: '100 Mandates. They speak with one voice. The voice is not pleasant. The voice is correct.',
      category: 'dept-mult', currency: 'directives', cost: 312500,
      effect: { type: 'dept-mult', target: 'mandate', value: 2 },
      unlock: () => Departments.getOwned('mandate') >= 100
    },
    {
      id: 'jurisdiction-mult-100',
      name: 'Total Jurisdiction',
      desc: '100 Jurisdictions. There is nothing left to govern. They govern that.',
      category: 'dept-mult', currency: 'directives', cost: 625000,
      effect: { type: 'dept-mult', target: 'jurisdiction', value: 2 },
      unlock: () => Departments.getOwned('jurisdiction') >= 100
    },

    // ── Standard Synergies ──────────────────────────────────────
    {
      id: 'misfiling-protocol',
      name: 'Misfiling Protocol',
      desc: 'It turns out the wrong cabinet was the right cabinet all along. No one questions this.',
      category: 'synergy',
      currency: 'directives',
      cost: 50,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'intern', source: 'filing-cabinet', percentPerOwned: 0.15 },
          { kind: 'mult-per-owned', target: 'filing-cabinet', source: 'intern', percentPerOwned: 0.10 }
        ]
      },
      unlock: () => Departments.getOwned('intern') >= 10 && Departments.getOwned('filing-cabinet') >= 5
    },
    {
      id: 'evidence-based-review',
      name: 'Evidence-Based Review',
      desc: 'The Sub-Committee required documentation. The Filing Cabinet provided it. The Sub-Committee is now reviewing whether the documentation requires its own documentation.',
      category: 'synergy',
      currency: 'directives',
      cost: 100,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'sub-committee', source: 'filing-cabinet', percentPerOwned: 0.01 }
        ]
      },
      unlock: () => Departments.getOwned('filing-cabinet') >= 10 && Departments.getOwned('sub-committee') >= 5
    },
    {
      id: 'standing-orders',
      name: 'Standing Orders',
      desc: 'The Sub-Committee formalised The Procedure. The Procedure then formalised the Sub-Committee. Neither party can now be dissolved without the other\u2019s approval.',
      category: 'synergy',
      currency: 'directives',
      cost: 250,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'sub-committee', source: 'procedure', percentPerOwned: 0.08 },
          { kind: 'mult-per-owned', target: 'procedure', source: 'sub-committee', percentPerOwned: 0.05 }
        ]
      },
      unlock: () => Departments.getOwned('sub-committee') >= 15 && Departments.getOwned('procedure') >= 10
    },
    {
      id: 'operational-continuity',
      name: 'Operational Continuity',
      desc: 'The Division runs The Procedure. The Procedure runs The Division. The distinction has been filed as non-essential.',
      category: 'synergy',
      currency: 'directives',
      cost: 250,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-grouped', target: 'division', source: 'procedure', percentPerGroup: 0.20, groupSize: 5, maxStacks: 10 }
        ]
      },
      unlock: () => Departments.getOwned('procedure') >= 10 && Departments.getOwned('division') >= 5
    },
    {
      id: 'review-of-the-review',
      name: 'Review of the Review',
      desc: 'The Oversight Body was asked to review the Sub-Committee\u2019s findings. The Sub-Committee was asked to prepare a summary of the review. The summary has been sent to the Oversight Body for review.',
      category: 'synergy',
      currency: 'directives',
      cost: 400,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'sub-committee', source: 'oversight-body', percentPerOwned: 0.03 },
          { kind: 'mult-per-owned', target: 'oversight-body', source: 'sub-committee', percentPerOwned: 0.01 }
        ]
      },
      unlock: () => Departments.getOwned('sub-committee') >= 20 && Departments.getOwned('oversight-body') >= 10
    },
    {
      id: 'jurisdictional-overlap',
      name: 'Jurisdictional Overlap',
      desc: 'The Division filed a formal query about where its jurisdiction ends. The Oversight Body is investigating whether it has jurisdiction over that query.',
      category: 'synergy',
      currency: 'directives',
      cost: 800,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'division', source: 'oversight-body', percentPerOwned: 0.05 },
          { kind: 'mult-per-owned', target: 'oversight-body', source: 'division', percentPerOwned: 0.05 }
        ]
      },
      unlock: () => Departments.getOwned('division') >= 15 && Departments.getOwned('oversight-body') >= 10
    },
    {
      id: 'extended-jurisdiction',
      name: 'Extended Jurisdiction',
      desc: 'The Oversight Body\u2019s remit now technically includes the Annex. The Annex has filed a query about whether the Oversight Body falls within the Annex\u2019s remit. The matter is under review.',
      category: 'synergy',
      currency: 'directives',
      cost: 1500,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-flat', target: 'annex', value: 1.25 },
          { kind: 'mult-per-owned', target: 'oversight-body', source: 'annex', percentPerOwned: 0.10 }
        ]
      },
      unlock: () => Departments.getOwned('oversight-body') >= 5 && Departments.getOwned('annex') >= 5
    },
    {
      id: 'territorial-instrument',
      name: 'Territorial Instrument',
      desc: 'The Mandate now governs the Annex. The Annex has issued internal passports in the Mandate\u2019s name. The Mandate has not been consulted. The Mandate does not require consultation.',
      category: 'synergy',
      currency: 'directives',
      cost: 3000,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'mult-per-owned', target: 'annex', source: 'mandate', percentPerOwned: 0.50 },
          { kind: 'mult-flat-per-owned', target: 'mandate', source: 'annex', flatPerOwned: 500 }
        ]
      },
      unlock: () => Departments.getOwned('annex') >= 8 && Departments.getOwned('mandate') >= 3
    },
    {
      id: 'career-trajectory',
      name: 'Career Trajectory',
      desc: 'The Intern has been here long enough to remember when the Mandate was just a thought. The Intern does not speak of this. The Mandate does not remember Interns.',
      category: 'synergy',
      currency: 'directives',
      cost: 1500,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'global-mult', value: 1.05 }
        ]
      },
      unlock: () => Departments.getOwned('intern') >= 50 && Departments.getOwned('mandate') >= 1
    },
    {
      id: 'permanent-record',
      name: 'Permanent Record',
      desc: 'The Mandate requires a record of all things. The Filing Cabinet provides it. The record now includes a record of the record. The Forms/sec figures are technically correct.',
      category: 'synergy',
      currency: 'directives',
      cost: 2500,
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'milestone-stacking', percentPerMilestone: 0.005 }
        ]
      },
      unlock: () => Departments.getOwned('filing-cabinet') >= 25 && Departments.getOwned('mandate') >= 2
    },

    // ── Deep Synergies ──────────────────────────────────────────
    {
      id: 'terms-of-reference',
      name: 'Terms of Reference',
      desc: 'Institutional will is now self-generating. This was not intended. It has been noted.',
      category: 'synergy',
      currency: 'directives',
      cost: 5000,
      tier: 'deep',
      effect: {
        type: 'synergy',
        bonuses: [
          { kind: 'directives-trickle', ratePerSec: 0.05 }
        ]
      },
      unlock: () => Upgrades.has('standing-orders')
        && Departments.getOwned('sub-committee') >= 30
        && Departments.getOwned('procedure') >= 20
    },
    {
      id: 'regulatory-capture',
      name: 'Regulatory Capture',
      desc: 'It is no longer clear which body oversees the other. Both have filed documentation asserting primacy. Both documents have been accepted. Both have been filed. In the same cabinet.',
      category: 'synergy',
      currency: 'directives',
      cost: 5000,
      tier: 'deep',
      effect: {
        type: 'synergy',
        bonuses: [
          // Pre-computed from the GDD's swap-and-multiply spec
          // OB base 600, Annex base 3200; (0.9*self + 0.1*other) * 1.5
          // OB: (540+320)*1.5 = 1290 → ×2.15 over 600
          // Annex: (2880+60)*1.5 = 2940 → ×0.91875 over 3200 — but the intent is "boost both", so cap floor at 1
          { kind: 'mult-flat', target: 'oversight-body', value: 2.15 },
          { kind: 'mult-flat', target: 'annex', value: 1.378 }
        ]
      },
      unlock: () => Upgrades.has('extended-jurisdiction')
        && Departments.getOwned('oversight-body') >= 15
        && Departments.getOwned('annex') >= 10
    },

    // ── Passive Behaviour Upgrades (bought with Directives) ─────
    {
      id: 'redundancy-planning',
      name: 'Redundancy Planning',
      desc: 'Owning two or more of anything is now considered a strategy, not an accident.',
      category: 'passive',
      currency: 'directives',
      cost: 15,
      effect: { type: 'global-mult-if-doubled' },  // +5% to all if any tier has 2+
      unlock: () => Upgrades.directivesUnlocked
    },
    {
      id: 'motivational-poster',
      name: 'Motivational Poster',
      desc: '+0.1% to all output. The poster depicts a cat hanging from a branch. The caption reads: PERSIST.',
      category: 'flavour',
      currency: 'directives',
      cost: 3,
      effect: { type: 'global-mult', value: 1.001 },
      unlock: () => Upgrades.directivesUnlocked
    },
    {
      id: 'auto-filing',
      name: 'Auto-Filing',
      desc: 'A standing instruction to keep filing while nobody is watching. Offline income +25% and is no longer subject to any future cap.',
      category: 'passive',
      currency: 'directives',
      cost: 75,
      effect: { type: 'auto-filing' },
      unlock: () => Upgrades.directivesUnlocked && Departments.getOwned('procedure') >= 1
    },
    {
      id: 'precedent-setting',
      name: 'Precedent-Setting',
      desc: 'Each milestone now establishes a small precedent. Future Restructurings yield +10% Precedents.',
      category: 'passive',
      currency: 'directives',
      cost: 50,
      effect: { type: 'precedent-bonus-flat', percent: 0.10 },
      unlock: () => Upgrades.has('the-reorganisation')
    },
    {
      id: 'the-reorganisation',
      name: 'The Reorganisation',
      desc: 'A standing authority to dissolve The Department and reconstitute it from first principles. Filed under Standard Procedure 7(b). Once filed, never rescinded.',
      category: 'prestige',
      currency: 'directives',
      cost: 150,
      effect: { type: 'unlock-restructuring' },
      unlock: () => Departments.getOwned('oversight-body') >= 1
    },
    {
      id: 'the-memo',
      name: 'The Memo',
      desc: 'A memo circulates. Nobody wrote it. Everyone has read it. All departments produce 10% more.',
      category: 'passive',
      currency: 'directives',
      cost: 30,
      effect: { type: 'global-mult', value: 1.10 },
      unlock: () => Upgrades.has('motivational-poster')
    }
  ],

  /** Check if an upgrade has been purchased */
  has(id) {
    return !!this.purchased[id];
  },

  /** Get a definition by id */
  get(id) {
    return this.definitions.find(u => u.id === id);
  },

  /** Check whether Directives should be unlocked */
  checkDirectivesUnlock() {
    if (this.directivesUnlocked) return;
    const hasSubCommittee = Departments.getOwned('sub-committee') >= 1;
    const hasEnoughForms = Game.totalFormsEarned >= this.DIRECTIVES_FORMS_THRESHOLD;
    if (hasSubCommittee && hasEnoughForms) {
      this.directivesUnlocked = true;
    }
  },

  /** Try to buy an upgrade. Returns true on success. */
  buy(upg) {
    if (this.purchased[upg.id]) return false;

    if (upg.currency === 'forms') {
      if (Game.forms < upg.cost) return false;
      Game.forms -= upg.cost;
    } else {
      if (Game.directives < upg.cost) return false;
      Game.directives -= upg.cost;
    }

    this.purchased[upg.id] = true;
    this.applyEffects();

    // Side-effect: unlock the Restructuring centre tab
    if (upg.id === 'the-reorganisation' && typeof CentreTabs !== 'undefined') {
      CentreTabs.unlockRestructuring();
    }
    return true;
  },

  /** Convert Forms to Directives in bulk (or 'max'). Returns the number of Directives produced. */
  convertToDirectives(n) {
    if (!this.directivesUnlocked) return 0;
    const actual = (n === 'max') ? Math.floor(Game.forms / this.CONVERSION_RATE) : n;
    if (actual <= 0) return 0;
    const cost = actual * this.CONVERSION_RATE;
    if (Game.forms < cost) return 0;
    Game.forms -= cost;
    Game.directives += actual;
    Game.totalDirectivesConverted += actual;
    return actual;
  },

  /** Single-unit shim kept for backwards compatibility */
  convertToDirective() {
    return this.convertToDirectives(1) > 0;
  },

  /** Recalculate all upgrade effects (click power + dept multipliers) */
  applyEffects() {
    // --- Click power ---
    let clickBase = 1;
    let clickMult = 1;
    let hasDeptBonus = false;

    for (const upg of this.definitions) {
      if (!this.purchased[upg.id]) continue;
      const eff = upg.effect;
      if (eff.type === 'click-add') clickBase += eff.value;
      if (eff.type === 'click-mult') clickMult *= eff.value;
      if (eff.type === 'click-dept-bonus') hasDeptBonus = true;
    }

    let totalDepts = 0;
    if (hasDeptBonus) {
      for (const tier of Departments.tiers) totalDepts += tier.owned;
    }

    const precMult = Game.getPrecedentMultiplier ? Game.getPrecedentMultiplier() : 1;
    const estProcMult = (Game.precedentUpgrades && Game.precedentUpgrades['established-procedure']) ? 3 : 1;
    const eternalMult = (Game.precedentUpgrades && Game.precedentUpgrades['the-eternal-mandate']) ? 2 : 1;
    const clickBuffMult = (typeof RandomEvents !== 'undefined' && RandomEvents.getClickBuffMultiplier)
      ? RandomEvents.getClickBuffMultiplier()
      : 1;
    Game.formsPerClick = clickBase * clickMult * (hasDeptBonus ? (1 + 0.01 * totalDepts) : 1) * precMult * estProcMult * eternalMult * clickBuffMult;

    // --- Department income recalc ---
    Departments.recalcIncome();
  },

  /** Apply Doctrine of Precedent scaling to a synergy bonus factor (>=1).
   * When Doctrine is owned, the additive part of the bonus ramps from 50% to 100%
   * over the first 30 minutes of the run via Game.getDoctrineScale(). */
  _scaleSynergyFactor(factor) {
    if (!Game.precedentUpgrades || !Game.precedentUpgrades['doctrine-of-precedent']) return factor;
    const scale = (typeof Game.getDoctrineScale === 'function') ? Game.getDoctrineScale() : 1;
    return 1 + (factor - 1) * scale;
  },

  /** Get the multiplier for a specific department tier (called by Departments.recalcIncome) */
  getDeptMultiplier(tierId) {
    let mult = 1;

    for (const upg of this.definitions) {
      if (!this.purchased[upg.id]) continue;
      const eff = upg.effect;

      // Classic single-target multipliers
      if (eff.type === 'dept-mult' && eff.target === tierId) {
        mult *= eff.value;
      }

      // Global multipliers (non-synergy)
      if (eff.type === 'global-mult') {
        mult *= eff.value;
      }

      // Synergy bonuses — wrapped in Doctrine scale when Doctrine is owned
      if (eff.type === 'synergy' && Array.isArray(eff.bonuses)) {
        for (const b of eff.bonuses) {
          let factor = 1;

          if (b.kind === 'mult-per-owned' && b.target === tierId) {
            const sourceOwned = Departments.getOwned(b.source);
            factor = 1 + b.percentPerOwned * sourceOwned;
          } else if (b.kind === 'mult-per-grouped' && b.target === tierId) {
            const sourceOwned = Departments.getOwned(b.source);
            const stacks = Math.min(b.maxStacks, Math.floor(sourceOwned / b.groupSize));
            factor = 1 + b.percentPerGroup * stacks;
          } else if (b.kind === 'mult-flat' && b.target === tierId) {
            factor = b.value;
          } else if (b.kind === 'mult-flat-per-owned' && b.target === tierId) {
            // Tier-aware: convert flat Forms/sec per source-owned into a multiplier
            const sourceOwned = Departments.getOwned(b.source);
            const tier = Departments.tiers.find(t => t.id === tierId);
            if (tier && tier.baseRate > 0) {
              factor = 1 + (b.flatPerOwned * sourceOwned) / tier.baseRate;
            }
          } else if (b.kind === 'global-mult') {
            factor = b.value;
          } else if (b.kind === 'milestone-stacking') {
            const stacks = Game.permanentRecordStacks || 0;
            factor = 1 + b.percentPerMilestone * stacks;
          }

          if (factor !== 1) {
            mult *= this._scaleSynergyFactor(factor);
          }
        }
      }
    }

    // Redundancy Planning: +5% to all if any tier has 2+ owned
    if (this.purchased['redundancy-planning']) {
      const anyDoubled = Departments.tiers.some(t => t.owned >= 2);
      if (anyDoubled) mult *= 1.05;
    }

    return mult;
  },

  /** Number of synergy-category upgrades currently purchased (used by Interlocking Directorates) */
  getSynergyCount() {
    let n = 0;
    for (const upg of this.definitions) {
      if (upg.category === 'synergy' && this.purchased[upg.id]) n++;
    }
    return n;
  },

  /** Tick the passive Directives trickle from Terms of Reference. Called from Game.tick. */
  tickDirectivesTrickle(dt) {
    // Sum up trickle rates from all purchased synergies
    let rate = 0;
    for (const upg of this.definitions) {
      if (!this.purchased[upg.id]) continue;
      const eff = upg.effect;
      if (eff.type === 'synergy' && Array.isArray(eff.bonuses)) {
        for (const b of eff.bonuses) {
          if (b.kind === 'directives-trickle') rate += b.ratePerSec;
        }
      }
    }
    if (rate <= 0) return;

    this.directivesTrickleAccumulator += rate * dt;
    if (this.directivesTrickleAccumulator >= 1) {
      const whole = Math.floor(this.directivesTrickleAccumulator);
      this.directivesTrickleAccumulator -= whole;
      Game.directives += whole;
      Game.totalDirectivesConverted += whole;
    }
  },

  /** Get list of upgrades visible (unlocked but not yet purchased) */
  getAvailable() {
    return this.definitions.filter(u => !this.purchased[u.id] && u.unlock());
  },

  /** Get list of purchased upgrades */
  getPurchased() {
    return this.definitions.filter(u => this.purchased[u.id]);
  }
};
