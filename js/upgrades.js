/**
 * upgrades.js — Upgrade definitions (click upgrades, department multipliers,
 * passive behaviours), unlock conditions, and purchase handling.
 *
 * Click upgrades are bought with Forms (early game).
 * All other upgrades are bought with Directives (mid-game).
 */

const Upgrades = {
  // Directives unlock: first Sub-Committee purchased + 500 total Forms earned
  DIRECTIVES_FORMS_THRESHOLD: 500,
  CONVERSION_RATE: 500,          // 500 Forms → 1 Directive
  directivesUnlocked: false,

  purchased: {},   // { upgradeId: true }

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

    // ── Department Multipliers (bought with Directives) ─────────
    // Milestone: own 1 → ×2 that department's output
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

  /** Convert Forms to Directives */
  convertToDirective() {
    if (!this.directivesUnlocked) return false;
    if (Game.forms < this.CONVERSION_RATE) return false;
    Game.forms -= this.CONVERSION_RATE;
    Game.directives++;
    Game.totalDirectivesConverted++;
    return true;
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
    Game.formsPerClick = clickBase * clickMult * (hasDeptBonus ? (1 + 0.01 * totalDepts) : 1) * precMult * estProcMult * eternalMult;

    // --- Department income recalc ---
    Departments.recalcIncome();
  },

  /** Get the multiplier for a specific department tier (called by Departments.recalcIncome) */
  getDeptMultiplier(tierId) {
    let mult = 1;
    for (const upg of this.definitions) {
      if (!this.purchased[upg.id]) continue;
      const eff = upg.effect;
      if (eff.type === 'dept-mult' && eff.target === tierId) {
        mult *= eff.value;
      }
      if (eff.type === 'global-mult') {
        mult *= eff.value;
      }
    }

    // Redundancy Planning: +5% to all if any tier has 2+ owned
    if (this.purchased['redundancy-planning']) {
      const anyDoubled = Departments.tiers.some(t => t.owned >= 2);
      if (anyDoubled) mult *= 1.05;
    }

    return mult;
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
