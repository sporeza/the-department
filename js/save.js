/**
 * save.js — Save/load system using localStorage.
 * Handles serialisation, deserialisation,
 * auto-save intervals, and offline income calculation.
 */

const Save = {
  KEY: 'the-department-save',
  AUTO_SAVE_MS: 30000, // auto-save every 30 seconds
  _intervalId: null,
  _beforeUnloadHandler: null,
  _wiped: false,           // set by wipeAll() — blocks any further save() writes
  lastSavedAt: null, // timestamp of most recent successful save

  /** Serialise current game state into a JSON string */
  serialise() {
    return JSON.stringify({
      version: 11,
      timestamp: Date.now(),
      game: {
        forms: Game.forms,
        formsPerClick: Game.formsPerClick,
        totalFormsEarned: Game.totalFormsEarned,
        runFormsEarned: Game.runFormsEarned,
        totalClicks: Game.totalClicks,
        directives: Game.directives,
        precedents: Game.precedents,
        restructurings: Game.restructurings,
        precedentUpgrades: Game.precedentUpgrades,
        preResetForms: Game.preResetForms,
        phase: Game.phase,
        deptName: Game.deptName,
        totalRejections: Game.totalRejections,
        totalDirectivesConverted: Game.totalDirectivesConverted,
        totalPrecedentsEarned: Game.totalPrecedentsEarned,
        peakFormsPerSec: Game.peakFormsPerSec,
        gameStartTime: Game.gameStartTime,
        runStartTime: Game.runStartTime,
        permanentRecordStacks: Game.permanentRecordStacks || 0,
        firstRestructureMs: Game.firstRestructureMs || 0,
        settings: Game.settings
      },
      departments: Departments.tiers.map(t => ({ id: t.id, owned: t.owned, totalFormsGenerated: t.totalFormsGenerated || 0 })),
      deptNames: Object.keys(Departments.customNames).length > 0 ? Departments.customNames : undefined,
      upgrades: {
        purchased: Object.keys(Upgrades.purchased),
        directivesUnlocked: Upgrades.directivesUnlocked,
        directivesTrickleAccumulator: Upgrades.directivesTrickleAccumulator || 0
      },
      milestones: Milestones.getTriggered(),
      events: (typeof RandomEvents !== 'undefined') ? RandomEvents.serialise() : undefined,
      ticker: (typeof Ticker !== 'undefined') ? Ticker.serialise() : undefined
    });
  },

  /** Save to localStorage. Returns true on success. */
  save() {
    // After a wipe, refuse to write — prevents the beforeunload handler from
    // resurrecting in-memory state into localStorage before location.reload().
    if (this._wiped) return false;
    try {
      localStorage.setItem(this.KEY, this.serialise());
      this.lastSavedAt = Date.now();
      return true;
    } catch (e) {
      // Storage full or unavailable — fail silently
      return false;
    }
  },

  /** Return the current save state as a JSON string (for export). */
  exportString() {
    return this.serialise();
  },

  /** Validate and write an imported save string. Returns true on success. */
  importString(str) {
    if (typeof str !== 'string' || !str.trim()) return false;
    try {
      const parsed = JSON.parse(str);
      if (!parsed || typeof parsed !== 'object' || !parsed.game) return false;
      localStorage.setItem(this.KEY, str);
      return true;
    } catch (e) {
      return false;
    }
  },

  /** Wipe all save data from localStorage and block further saves until reload. */
  wipeAll() {
    this._wiped = true;
    this.stopAutoSave();
    this.reset();
  },

  /** Load from localStorage. Returns true if a save was restored. */
  load() {
    let raw;
    try {
      raw = localStorage.getItem(this.KEY);
    } catch (e) {
      return false;
    }
    if (!raw) return false;

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return false;
    }

    // Restore game state
    Game.forms = data.game.forms || 0;
    Game.totalFormsEarned = data.game.totalFormsEarned || 0;
    Game.runFormsEarned = (data.game && typeof data.game.runFormsEarned === 'number') ? data.game.runFormsEarned : Game.totalFormsEarned;
    Game.totalClicks = data.game.totalClicks || 0;
    Game.directives = (data.game && data.game.directives) || 0;
    Game.precedents = (data.game && data.game.precedents) || 0;
    Game.restructurings = (data.game && data.game.restructurings) || 0;
    Game.precedentUpgrades = (data.game && data.game.precedentUpgrades) || {};
    Game.preResetForms = (data.game && data.game.preResetForms) || 0;
    Game.phase = (data.game && data.game.phase) || 'running';
    Game.deptName = (data.game && data.game.deptName) || undefined;
    Game.totalRejections = (data.game && data.game.totalRejections) || 0;
    Game.totalDirectivesConverted = (data.game && data.game.totalDirectivesConverted) || 0;
    Game.totalPrecedentsEarned = (data.game && data.game.totalPrecedentsEarned) || 0;
    Game.peakFormsPerSec = (data.game && data.game.peakFormsPerSec) || 0;
    Game.gameStartTime = (data.game && data.game.gameStartTime) || data.timestamp || Date.now();
    Game.runStartTime = (data.game && data.game.runStartTime) || data.timestamp || Date.now();
    Game.permanentRecordStacks = (data.game && data.game.permanentRecordStacks) || 0;
    Game.firstRestructureMs = (data.game && data.game.firstRestructureMs) || 0;

    // Restore settings
    if (data.game && data.game.settings) {
      Object.assign(Game.settings, data.game.settings);
    }

    // Restore department ownership and per-tier stats
    if (data.departments) {
      const savedMap = {};
      data.departments.forEach(d => { savedMap[d.id] = d; });
      Departments.tiers.forEach(tier => {
        const saved = savedMap[tier.id];
        tier.owned = (saved && saved.owned) || 0;
        tier.totalFormsGenerated = (saved && saved.totalFormsGenerated) || 0;
      });
    }

    // Unhide Jurisdiction if Precedent of Scale was purchased
    if (Game.precedentUpgrades['precedent-of-scale']) {
      const juris = Departments.tiers.find(t => t.id === 'jurisdiction');
      if (juris) juris.hidden = false;
    }

    // Restore custom department names
    Departments.customNames = data.deptNames || {};

    // Restore upgrades
    if (data.upgrades) {
      Upgrades.directivesUnlocked = !!data.upgrades.directivesUnlocked;
      Upgrades.directivesTrickleAccumulator = data.upgrades.directivesTrickleAccumulator || 0;
      Upgrades.purchased = {};
      if (data.upgrades.purchased) {
        data.upgrades.purchased.forEach(id => { Upgrades.purchased[id] = true; });
      }
    }

    // Restore milestones
    if (data.milestones) {
      Milestones.restore(data.milestones);
    }

    // Restore random events
    if (data.events && typeof RandomEvents !== 'undefined') {
      // Decay buff timers by offline elapsed time
      if (data.timestamp && data.events.buffs) {
        const offlineSec = (Date.now() - data.timestamp) / 1000;
        data.events.buffs.forEach(b => { b.remaining -= offlineSec; });
      }
      RandomEvents.restore(data.events);
    }

    // Restore ticker queue (falsy input seeds fresh). Handles v8 saves too.
    if (typeof Ticker !== 'undefined') {
      Ticker.restore(data.ticker);
    }

    // Recalculate effects from restored upgrades (sets formsPerClick + dept multipliers)
    Upgrades.applyEffects();

    // Offline income — award passive income for time away (skip if mid-restructuring or disabled)
    if (Game.settings.offlineIncome && Game.phase === 'running' && data.timestamp && Game.formsPerSec > 0) {
      const elapsed = (Date.now() - data.timestamp) / 1000; // seconds
      if (elapsed > 1) {
        // Auto-Filing: +25% to offline income
        const autoFilingBonus = Upgrades.has('auto-filing') ? 1.25 : 1;
        const offline = Game.formsPerSec * elapsed * autoFilingBonus;
        Game.forms += offline;
        Game.totalFormsEarned += offline;
        Game.runFormsEarned += offline;
      }
    }

    return true;
  },

  /** Wipe save data */
  reset() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {
      // ignore
    }
  },

  /** Start auto-save interval */
  startAutoSave() {
    this._intervalId = setInterval(() => this.save(), this.AUTO_SAVE_MS);
    // Also save when the player leaves the page
    this._beforeUnloadHandler = () => this.save();
    window.addEventListener('beforeunload', this._beforeUnloadHandler);
  },

  /** Stop auto-save interval and remove the beforeunload handler */
  stopAutoSave() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    if (this._beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
      this._beforeUnloadHandler = null;
    }
  }
};
