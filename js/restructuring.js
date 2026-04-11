/**
 * restructuring.js — Prestige system ("The Restructuring").
 *
 * When the player has purchased "The Reorganisation" upgrade, they may
 * dissolve their current Department state in exchange for Precedents (⌖),
 * a meta-currency that grants a permanent +1% (compounding) multiplier
 * to all Form generation.
 *
 * The Restructuring is a distinct phase (like Cookie Clicker's ascension):
 * after initiating, the player enters a full-screen phase screen where they
 * can spend Precedents on permanent upgrades before starting the next run.
 *
 * Formula: floor(sqrt(runFormsEarned / 1,000,000))
 */

const Restructuring = {
  PRECEDENT_DIVISOR: 1000000,

  // --- Precedent Upgrade Definitions ---
  precedentUpgrades: [
    {
      id: 'institutional-memory-p',
      name: 'Institutional Memory',
      desc: 'Start each Restructuring with 1 Intern already hired.',
      cost: 1,
      effect: 'start-with-intern'
    },
    {
      id: 'continuity-of-operations',
      name: 'Continuity of Operations',
      desc: 'Retain 5% of Forms on Restructuring.',
      cost: 5,
      effect: 'retain-forms-5pct'
    },
    {
      id: 'established-procedure',
      name: 'Established Procedure',
      desc: 'Click output starts at \u00d73 on new runs.',
      cost: 10,
      effect: 'click-x3-start'
    },
    {
      id: 'precedent-of-scale',
      name: 'Precedent of Scale',
      desc: 'Unlock the 9th department tier: The Jurisdiction.',
      cost: 25,
      effect: 'unlock-jurisdiction'
    },
    {
      id: 'the-eternal-mandate',
      name: 'The Eternal Mandate',
      desc: 'All departments produce \u00d72 permanently. "It was always thus."',
      cost: 100,
      effect: 'global-x2-permanent'
    }
  ],

  /** Has the player purchased the unlock upgrade? */
  isUnlocked() {
    return typeof Upgrades !== 'undefined' && Upgrades.has('the-reorganisation');
  },

  /** Has a specific Precedent upgrade been purchased? */
  hasPrecUpgrade(id) {
    return !!Game.precedentUpgrades[id];
  },

  /** Can the player afford a Precedent upgrade? */
  canAffordPrecUpgrade(id) {
    const def = this.precedentUpgrades.find(u => u.id === id);
    return def && !this.hasPrecUpgrade(id) && Game.precedents >= def.cost;
  },

  /** Buy a Precedent upgrade. Returns true on success. */
  buyPrecUpgrade(id) {
    const def = this.precedentUpgrades.find(u => u.id === id);
    if (!def) return false;
    if (this.hasPrecUpgrade(id)) return false;
    if (Game.precedents < def.cost) return false;

    Game.precedents -= def.cost;
    Game.precedentUpgrades[id] = true;
    if (typeof Save !== 'undefined') Save.save();
    this.refreshPhaseScreen();
    return true;
  },

  /** Precedents that would be earned by restructuring right now */
  calculateGain() {
    const f = Game.runFormsEarned || 0;
    if (f <= 0) return 0;
    return Math.floor(Math.sqrt(f / this.PRECEDENT_DIVISOR));
  },

  /** Can the player actually restructure? (unlocked AND would gain ≥1) */
  canRestructure() {
    return this.isUnlocked() && this.calculateGain() >= 1;
  },

  /** Forms required for next Precedent (helpful display value) */
  formsForNextPrecedent() {
    const next = this.calculateGain() + 1;
    return next * next * this.PRECEDENT_DIVISOR;
  },

  /** Called from the game loop — keeps the centre tab in sync if state changes externally */
  checkUnlock() {
    if (this.isUnlocked() && typeof CentreTabs !== 'undefined') {
      CentreTabs.unlockRestructuring();
    }
  },

  // ===================================================================
  //  PERFORM — initiates restructuring, enters the phase screen
  // ===================================================================
  perform() {
    if (!this.canRestructure()) return false;

    const gain = this.calculateGain();
    const quote = this.pickQuote();

    // Stash pre-reset Forms for Continuity of Operations
    Game.preResetForms = Game.forms;

    // Award Precedents and increment lifetime restructuring count
    Game.precedents += gain;
    Game.totalPrecedentsEarned += gain;
    Game.restructurings += 1;

    // --- Reset current-run state ---
    Game.forms = 0;
    Game.directives = 0;
    Game.runFormsEarned = 0;
    Game.formsPerClick = 1;
    Game.formsPerSec = 0;
    Game.runStartTime = Date.now();

    // Reset all department ownership
    for (const tier of Departments.tiers) {
      tier.owned = 0;
    }

    // Reset purchased upgrades EXCEPT the unlock itself
    const keepIds = { 'the-reorganisation': true };
    const newPurchased = {};
    for (const id of Object.keys(Upgrades.purchased)) {
      if (keepIds[id]) newPurchased[id] = true;
    }
    Upgrades.purchased = newPurchased;
    Upgrades.directivesUnlocked = false;

    // Clear any active random event + buffs
    if (typeof RandomEvents !== 'undefined') {
      if (RandomEvents.activeEvent && RandomEvents.activeEvent.el && RandomEvents.activeEvent.el.parentNode) {
        RandomEvents.activeEvent.el.remove();
      }
      RandomEvents.activeEvent = null;
      RandomEvents.buffs = [];
      if (RandomEvents.updateBuffUI) RandomEvents.updateBuffUI();
    }

    // Recalculate effects
    Upgrades.applyEffects();

    // Enter the restructuring phase
    Game.phase = 'restructuring';

    // Persist immediately
    if (typeof Save !== 'undefined') Save.save();

    // Show ceremonial overlay (transitions into phase screen on dismiss)
    Ticker.push(quote, { source: 'restructuring', dedupeKey: 'restr:' + Game.restructurings });
    this.showOverlay(quote, gain);

    return true;
  },

  // ===================================================================
  //  END PHASE — leave the restructuring screen, start new run
  // ===================================================================
  endPhase() {
    // Apply start-of-run Precedent upgrade effects
    Game.applyRunStartEffects();

    // Switch back to running
    Game.phase = 'running';

    // Remove the phase screen overlay
    const phaseEl = document.querySelector('.restructure-phase');
    if (phaseEl) phaseEl.remove();

    // Recalculate everything with new run state
    Upgrades.applyEffects();

    // Force full UI refresh
    if (typeof UI !== 'undefined') {
      UI._lastAvailableUpgrades = null;
      UI.rebuildDepartments(); // may include newly-visible Jurisdiction
      UI.updateStats();
      UI.updateDepartments();
    }
    if (typeof CentreTabs !== 'undefined') {
      CentreTabs.renderRestructuring();
      CentreTabs.renderRegistry();
    }

    // Persist
    if (typeof Save !== 'undefined') Save.save();
  },

  // ===================================================================
  //  PHASE SCREEN — persistent full-screen overlay for spending Precedents
  // ===================================================================
  showPhaseScreen() {
    // Remove any stale phase screen
    const existing = document.querySelector('.restructure-phase');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'restructure-phase';
    el.innerHTML = this._buildPhaseHTML();
    document.body.appendChild(el);

    // Animate in
    void el.offsetWidth;
    el.classList.add('visible');

    this._bindPhaseActions(el);
  },

  /** Reconstruct the phase screen on reload (no ceremonial overlay) */
  enterPhaseFromLoad() {
    this.showPhaseScreen();
  },

  /** Cheap refresh of phase screen after buying an upgrade */
  refreshPhaseScreen() {
    const el = document.querySelector('.restructure-phase');
    if (!el) return;
    const inner = el.querySelector('.restructure-phase-inner');
    if (inner) inner.innerHTML = this._buildPhaseInnerHTML();
    this._bindPhaseActions(el);
  },

  _buildPhaseHTML() {
    return '<div class="restructure-phase-inner">' + this._buildPhaseInnerHTML() + '</div>';
  },

  _buildPhaseInnerHTML() {
    const held = Game.precedents || 0;
    const survived = Game.restructurings || 0;
    const currentMult = Game.getPrecedentMultiplier();

    // Build upgrade cards
    const cards = this.precedentUpgrades.map(upg => {
      const owned = this.hasPrecUpgrade(upg.id);
      const canAfford = !owned && Game.precedents >= upg.cost;
      let cls = 'precedent-upgrade-card';
      if (owned) cls += ' owned';
      else if (!canAfford) cls += ' unaffordable';

      return '<div class="' + cls + '" data-prec-id="' + upg.id + '">' +
        '<div class="precedent-card-header">' +
          '<span class="precedent-card-name">' + upg.name + '</span>' +
          '<span class="precedent-card-cost">\u2316 ' + upg.cost + '</span>' +
        '</div>' +
        '<p class="precedent-card-desc">' + upg.desc + '</p>' +
        (owned
          ? '<div class="precedent-card-status">Filed &#10003;</div>'
          : '<button class="btn-prec-buy"' + (canAfford ? '' : ' disabled') + '>Requisition</button>') +
      '</div>';
    }).join('');

    return (
      '<div class="restructure-phase-header">RESTRUCTURING IN PROGRESS</div>' +
      '<p class="restructure-phase-flavour">Standard Procedure 7(b) \u2014 The Department is between states. All prior departments, forms, and directives have been dissolved. The following permanent authorities are available for filing.</p>' +

      '<div class="precedent-balance">' +
        '<div class="precedent-balance-label">Precedents Available</div>' +
        '<div class="precedent-balance-value">\u2316 ' + held + '</div>' +
        '<div class="precedent-balance-sub">' +
          'Permanent multiplier: \u00d7' + currentMult.toFixed(3) +
          ' &middot; Restructurings survived: ' + survived +
        '</div>' +
      '</div>' +

      '<div class="precedent-upgrade-grid">' + cards + '</div>' +

      '<div class="restructure-phase-action">' +
        '<button class="btn-begin-cycle">Begin Next Cycle</button>' +
        '<div class="restructure-phase-action-note">The Department will continue.</div>' +
      '</div>'
    );
  },

  _bindPhaseActions(el) {
    // Buy buttons
    el.querySelectorAll('.btn-prec-buy').forEach(btn => {
      const card = btn.closest('.precedent-upgrade-card');
      const id = card && card.dataset.precId;
      btn.addEventListener('click', () => {
        if (id) this.buyPrecUpgrade(id);
      });
    });

    // Begin Next Cycle
    const beginBtn = el.querySelector('.btn-begin-cycle');
    if (beginBtn) {
      beginBtn.addEventListener('click', () => this.endPhase());
    }
  },

  // ===================================================================
  //  CEREMONIAL OVERLAY — brief quote card before phase screen
  // ===================================================================
  quotes: [
    'The Department has been restructured. The Department is unchanged.',
    'A new chapter has been opened. It is identical to the old chapter, which has also been left open.',
    'All previous departments have been dissolved in accordance with Standard Procedure 7(b). They will be reconstituted shortly. They have always been reconstituted shortly.',
    'The reorganisation has concluded. The Department continues. The Department continues.',
    'Effective immediately, all prior arrangements are void. The new arrangements are identical, but filed under different reference numbers.'
  ],

  pickQuote() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },

  /** Display a full-screen ceremonial overlay, then transition to phase screen */
  showOverlay(quote, gain) {
    const existing = document.querySelector('.restructure-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'restructure-overlay';
    overlay.innerHTML =
      '<div class="restructure-overlay-card">' +
        '<div class="restructure-overlay-header">NOTICE OF RESTRUCTURING</div>' +
        '<div class="restructure-overlay-rule"></div>' +
        '<div class="restructure-overlay-quote">&ldquo;' + quote + '&rdquo;</div>' +
        '<div class="restructure-overlay-rule"></div>' +
        '<div class="restructure-overlay-gain">Precedents filed: <strong>\u2316 ' + gain + '</strong></div>' +
        '<div class="restructure-overlay-foot">The Department will continue.</div>' +
      '</div>';
    document.body.appendChild(overlay);

    void overlay.offsetWidth;
    overlay.classList.add('visible');

    // After the ceremonial moment, reveal the phase screen underneath
    setTimeout(() => {
      // Build the phase screen BEHIND the overlay first
      this.showPhaseScreen();

      // Then fade out the overlay to reveal it
      overlay.classList.remove('visible');
      overlay.classList.add('exiting');
      setTimeout(() => overlay.remove(), 700);
    }, 3500);
  }
};
