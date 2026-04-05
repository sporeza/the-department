/**
 * departments.js — Department definitions, cost scaling,
 * purchasing logic, and passive income calculations.
 */

const Departments = {
  // ~1.15× exponential cost scaling per purchase
  COST_SCALE: 1.15,

  tiers: [
    {
      id: 'intern',
      name: 'The Intern',
      desc: 'A single person, slightly confused, filing things into the wrong cabinet but with tremendous enthusiasm.',
      baseCost: 15,
      baseRate: 0.1,
      owned: 0
    },
    {
      id: 'filing-cabinet',
      name: 'The Filing Cabinet',
      desc: 'A beige four-drawer cabinet. It hums. Nobody installed a humming mechanism.',
      baseCost: 100,
      baseRate: 0.5,
      owned: 0
    },
    {
      id: 'sub-committee',
      name: 'The Sub-Committee',
      desc: 'A group convened to discuss whether a group should be convened. Surprisingly productive.',
      baseCost: 1100,
      baseRate: 4,
      owned: 0
    },
    {
      id: 'procedure',
      name: 'The Procedure',
      desc: 'Not a person or a room. A process. It exists in the space between departments, consuming inputs and emitting outputs with clockwork indifference.',
      baseCost: 12000,
      baseRate: 20,
      owned: 0
    },
    {
      id: 'division',
      name: 'The Division',
      desc: 'An entire wing of the building, now semi-autonomous. It requisitions its own supplies. It has its own break room. It has opinions.',
      baseCost: 130000,
      baseRate: 110,
      owned: 0
    },
    {
      id: 'oversight-body',
      name: 'The Oversight Body',
      desc: 'An entity created to monitor The Department that has since become larger than The Department. It monitors itself now. Efficiently.',
      baseCost: 1400000,
      baseRate: 600,
      owned: 0
    },
    {
      id: 'annex',
      name: 'The Annex',
      desc: 'A building adjacent to the building, connected by a covered walkway nobody approved but everyone uses.',
      baseCost: 20000000,
      baseRate: 3200,
      owned: 0
    },
    {
      id: 'mandate',
      name: 'The Mandate',
      desc: 'Not a place. A legal instrument that has achieved sentience through sheer administrative density. It governs. It is not clear what.',
      baseCost: 330000000,
      baseRate: 18000,
      owned: 0
    }
  ],

  /** Current cost for the next unit of a tier */
  getCost(tier) {
    return Math.floor(tier.baseCost * Math.pow(this.COST_SCALE, tier.owned));
  },

  /** Try to buy one unit of a tier. Returns true on success. */
  buy(tier) {
    const cost = this.getCost(tier);
    if (Game.forms < cost) return false;
    Game.forms -= cost;
    tier.owned++;
    this.recalcIncome();
    return true;
  },

  /** Recalculate total passive Forms/sec from all departments */
  recalcIncome() {
    let total = 0;
    for (const tier of this.tiers) {
      total += tier.baseRate * tier.owned;
    }
    Game.formsPerSec = total;
  }
};
