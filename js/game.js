/**
 * game.js — Core game state and main loop.
 * Manages resources (Forms, Directives, Precedents),
 * tick calculations, and the central game clock.
 */

const Game = {
  forms: 0,
  formsPerClick: 1,
  formsPerSec: 0,
  totalFormsEarned: 0,
  totalClicks: 0,
  directives: 0,
  deptName: undefined, // custom department name (left panel title)

  /** Called every tick (~100ms) to accumulate passive income */
  tick(dt) {
    const earned = this.formsPerSec * dt;
    this.forms += earned;
    this.totalFormsEarned += earned;
    Upgrades.checkDirectivesUnlock();
  },

  /** Called on a successful stamp click */
  clickApprove() {
    this.forms += this.formsPerClick;
    this.totalFormsEarned += this.formsPerClick;
    this.totalClicks++;
  }
};

// --- Main loop ---
let lastTick = performance.now();

function gameLoop(now) {
  const dt = (now - lastTick) / 1000; // seconds
  lastTick = now;

  Game.tick(dt);
  Milestones.check();
  Milestones.processQueue();
  UI.updateStats();
  UI.updateDepartments();
  FloorPlan.update();
  if (typeof RandomEvents !== 'undefined') RandomEvents.tick(dt);

  requestAnimationFrame(gameLoop);
}

// Start once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Save.load();          // restore state before UI renders departments
  UI.init();
  FloorPlan.init();     // build floor plan after departments are loaded
  if (typeof RandomEvents !== 'undefined') RandomEvents.init();
  Save.startAutoSave(); // auto-save every 30s + on page unload
  requestAnimationFrame(gameLoop);
});
