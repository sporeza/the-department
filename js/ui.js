/**
 * ui.js — DOM manipulation, stat display updates,
 * tab switching, department name renaming,
 * and news ticker management.
 */

const UI = {
  els: {},

  init() {
    // Cache DOM elements
    this.els.clickZone = document.getElementById('click-zone');
    this.els.formBox   = document.getElementById('form-box');
    this.els.stamp     = document.getElementById('stamp');
    this.els.formsTotal  = document.getElementById('forms-total');
    this.els.formsPerSec = document.getElementById('forms-per-sec');

    this.bindClick();
    this.bindTabs();
  },

  // --- Click mechanic ---
  bindClick() {
    this.els.clickZone.addEventListener('click', (e) => {
      const formRect = this.els.formBox.getBoundingClientRect();
      const stampRect = this.els.stamp.getBoundingClientRect();

      // The stamp imprint is roughly centered on the click point.
      // Require that the stamp footprint is mostly inside the form box —
      // shrink the valid target area by half the stamp's dimensions on
      // each side so the stamp can't hang more than ~50% off the edge.
      const padX = stampRect.width * 0.5;
      const padY = stampRect.height * 0.5;

      const inBox = (
        e.clientX >= formRect.left   + padX &&
        e.clientX <= formRect.right  - padX &&
        e.clientY >= formRect.top    + padY &&
        e.clientY <= formRect.bottom - padY
      );

      if (inBox) {
        this.stampHit(e);
      } else {
        this.stampMiss(e);
      }
    });
  },

  /** Successful stamp — earn forms, show stamp imprint on form */
  stampHit(e) {
    Game.clickApprove();
    this.updateStats();
    this.playStampAnim();

    // Show a stamp imprint at click position on the form
    const formRect = this.els.formBox.getBoundingClientRect();
    const x = e.clientX - formRect.left;
    const y = e.clientY - formRect.top;

    const imprint = document.createElement('div');
    imprint.className = 'stamp-imprint';
    imprint.textContent = 'APPROVED';
    imprint.style.left = x + 'px';
    imprint.style.top = y + 'px';

    this.els.formBox.appendChild(imprint);
    imprint.addEventListener('animationend', () => imprint.remove());

    // Floating +1 number
    this.floatNumber(e.clientX, e.clientY, '+' + Game.formsPerClick);
  },

  /** Mis-stamp — rejection animation, no reward */
  stampMiss(e) {
    this.playStampAnim();
    this.els.stamp.classList.add('stamp-rejected');
    this.els.stamp.addEventListener('animationend', () => {
      this.els.stamp.classList.remove('stamp-rejected');
    }, { once: true });

    // Floating "REJECTED" text
    this.floatNumber(e.clientX, e.clientY, 'REJECTED', true);
  },

  /** Brief press animation on the stamp element */
  playStampAnim() {
    this.els.stamp.classList.remove('stamp-press');
    // Force reflow to restart animation
    void this.els.stamp.offsetWidth;
    this.els.stamp.classList.add('stamp-press');
  },

  /** Floating text that rises and fades */
  floatNumber(x, y, text, isReject) {
    const el = document.createElement('div');
    el.className = 'float-text' + (isReject ? ' float-reject' : '');
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  },

  // --- Stats display ---
  updateStats() {
    this.els.formsTotal.textContent = formatNumber(Game.forms);
    this.els.formsPerSec.textContent = formatNumber(Game.formsPerSec, 1);
  },

  // --- Tab switching ---
  bindTabs() {
    document.querySelectorAll('.shop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      });
    });
  }
};

// --- Helpers ---
function formatNumber(n, decimals) {
  if (typeof decimals === 'number') {
    return n.toFixed(decimals);
  }
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}
