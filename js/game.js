/**
 * game.js — Core game state and main loop.
 * Manages resources (Forms, Directives, Precedents),
 * tick calculations, and the central game clock.
 */

const Game = {
  forms: 0,
  formsPerClick: 1,
  formsPerSec: 0,
  totalFormsEarned: 0,    // lifetime, persists through Restructurings
  runFormsEarned: 0,      // current-run only, resets on Restructuring (used for Precedent calc)
  totalClicks: 0,
  directives: 0,
  precedents: 0,          // prestige meta-currency, persists through Restructurings
  restructurings: 0,      // lifetime count of completed Restructurings
  precedentUpgrades: {},   // { upgradeId: true } — purchased Precedent upgrades, persist forever
  preResetForms: 0,        // stashed before reset for Continuity of Operations
  phase: 'running',        // 'running' | 'restructuring'
  deptName: undefined,     // custom department name (left panel title)
  totalRejections: 0,           // lifetime rejected (missed) stamp clicks
  totalDirectivesConverted: 0, // lifetime Directives converted from Forms
  totalPrecedentsEarned: 0,    // all-time Precedents earned (not just currently held)
  peakFormsPerSec: 0,          // all-time peak Forms/sec
  gameStartTime: Date.now(),   // timestamp of first game start (never reset)
  runStartTime: Date.now(),    // timestamp of current run start (reset on Restructuring)
  permanentRecordStacks: 0,    // milestone count since last run start, used by Permanent Record synergy
  settings: {
    offlineIncome: true,
    tickerSpeed: 'normal',       // 'slow' | 'normal' | 'fast'
    reducedMotion: false,
    numberFormat: 'abbreviated', // 'full' | 'abbreviated' | 'scientific'
    buyQuantity: 1,              // 1 | 10 | 50 | 100 | 'max'
    convertQuantity: 1           // 1 | 10 | 50 | 100 | 'max'
  },

  /** Called every tick (~100ms) to accumulate passive income */
  tick(dt) {
    const earned = this.formsPerSec * dt;
    this.forms += earned;
    this.totalFormsEarned += earned;
    this.runFormsEarned += earned;
    if (this.formsPerSec > this.peakFormsPerSec) {
      this.peakFormsPerSec = this.formsPerSec;
    }
    Departments.tickTierAttribution(dt);
    Upgrades.checkDirectivesUnlock();
    Upgrades.tickDirectivesTrickle(dt);
  },

  /** Called on a successful stamp click */
  clickApprove() {
    this.forms += this.formsPerClick;
    this.totalFormsEarned += this.formsPerClick;
    this.runFormsEarned += this.formsPerClick;
    this.totalClicks++;
  },

  /** Compounding multiplier from Precedents (+1% per Precedent) */
  getPrecedentMultiplier() {
    return Math.pow(1.01, this.precedents);
  },

  /** Doctrine of Precedent ramp: 0.5 → 1.0 over the first 30 minutes of a run.
   * Returns 1 when Doctrine is not owned (callers gate on the upgrade themselves). */
  getDoctrineScale() {
    const RAMP_MS = 30 * 60 * 1000;
    const elapsed = Date.now() - this.runStartTime;
    if (elapsed >= RAMP_MS) return 1;
    if (elapsed <= 0) return 0.5;
    return 0.5 + 0.5 * (elapsed / RAMP_MS);
  },

  /** Apply one-time start-of-run effects from Precedent upgrades (called when leaving restructuring phase) */
  applyRunStartEffects() {
    // Institutional Memory — start with 1 Intern
    if (this.precedentUpgrades['institutional-memory-p']) {
      const intern = Departments.tiers.find(t => t.id === 'intern');
      if (intern && intern.owned < 1) intern.owned = 1;
    }

    // Continuity of Operations — retain 5% of pre-reset Forms
    if (this.precedentUpgrades['continuity-of-operations']) {
      const retained = Math.floor(this.preResetForms * 0.05);
      this.forms += retained;
      this.totalFormsEarned += retained;
      this.runFormsEarned += retained;
    }

    // Established Procedure — click output starts ×3
    // (applied as a base multiplier in Upgrades.applyEffects)

    // Precedent of Scale — unhide The Jurisdiction
    if (this.precedentUpgrades['precedent-of-scale']) {
      const juris = Departments.tiers.find(t => t.id === 'jurisdiction');
      if (juris) juris.hidden = false;
    }

    // Recalculate everything after applying start effects
    Upgrades.applyEffects();
  }
};

// --- Main loop ---
let lastTick = performance.now();

function gameLoop(now) {
  const dt = (now - lastTick) / 1000; // seconds
  lastTick = now;

  if (Game.phase === 'running') {
    Game.tick(dt);
    Milestones.check();
    Milestones.processQueue();
    if (typeof Ticker !== 'undefined') Ticker.tick(dt);
    UI.updateStats();
    UI.updateDepartments();
    FloorPlan.update();
    if (typeof RandomEvents !== 'undefined') RandomEvents.tick(dt);
    if (typeof CentreTabs !== 'undefined') CentreTabs.tickActive();
    if (typeof Restructuring !== 'undefined') Restructuring.checkUnlock();
  }

  requestAnimationFrame(gameLoop);
}

// Start once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Save.load();          // restore state before UI renders departments
  // Seed the ticker queue if Save.load didn't (fresh boot with no saved state)
  if (typeof Ticker !== 'undefined' && Ticker._queue.length === 0) {
    Ticker.seedInitialQueue();
  }
  UI.init();
  FloorPlan.init();     // build floor plan after departments are loaded
  if (typeof CentreTabs !== 'undefined') CentreTabs.init();
  if (typeof RandomEvents !== 'undefined') RandomEvents.init();
  Save.startAutoSave(); // auto-save every 30s + on page unload

  // If we saved mid-restructuring, reconstruct the phase screen
  if (Game.phase === 'restructuring' && typeof Restructuring !== 'undefined') {
    Restructuring.enterPhaseFromLoad();
  }

  requestAnimationFrame(gameLoop);
});
