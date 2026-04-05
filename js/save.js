/**
 * save.js — Save/load system using localStorage.
 * Handles serialisation, deserialisation,
 * auto-save intervals, and offline income calculation.
 */

const Save = {
  KEY: 'the-department-save',
  AUTO_SAVE_MS: 30000, // auto-save every 30 seconds
  _intervalId: null,

  /** Serialise current game state into a JSON string */
  serialise() {
    return JSON.stringify({
      version: 1,
      timestamp: Date.now(),
      game: {
        forms: Game.forms,
        formsPerClick: Game.formsPerClick,
        totalFormsEarned: Game.totalFormsEarned
      },
      departments: Departments.tiers.map(t => ({ id: t.id, owned: t.owned }))
    });
  },

  /** Save to localStorage */
  save() {
    try {
      localStorage.setItem(this.KEY, this.serialise());
    } catch (e) {
      // Storage full or unavailable — fail silently
    }
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
    Game.formsPerClick = data.game.formsPerClick || 1;
    Game.totalFormsEarned = data.game.totalFormsEarned || 0;

    // Restore department ownership
    if (data.departments) {
      const owned = {};
      data.departments.forEach(d => { owned[d.id] = d.owned; });
      Departments.tiers.forEach(tier => {
        tier.owned = owned[tier.id] || 0;
      });
    }

    // Recalculate passive income from restored departments
    Departments.recalcIncome();

    // Offline income — award passive income for time away
    if (data.timestamp && Game.formsPerSec > 0) {
      const elapsed = (Date.now() - data.timestamp) / 1000; // seconds
      if (elapsed > 1) {
        const offline = Game.formsPerSec * elapsed;
        Game.forms += offline;
        Game.totalFormsEarned += offline;
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
    window.addEventListener('beforeunload', () => this.save());
  },

  /** Stop auto-save interval */
  stopAutoSave() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
};
