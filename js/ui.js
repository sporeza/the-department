/**
 * ui.js — DOM manipulation, stat display updates,
 * tab switching, department name renaming,
 * and news ticker management.
 */

const UI = {
  els: {},

  _lastDirectivesState: false,
  _lastAvailableUpgrades: null,

  init() {
    // Cache DOM elements
    this.els.clickZone = document.getElementById('click-zone');
    this.els.formBox   = document.getElementById('form-box');
    this.els.stamp     = document.getElementById('stamp');
    this.els.formsTotal  = document.getElementById('forms-total');
    this.els.formsPerSec = document.getElementById('forms-per-sec');
    this.els.deptList    = document.getElementById('tab-departments');
    this.els.upgradeList = document.getElementById('tab-upgrades');
    this.els.directivesRow = document.getElementById('directives-row');
    this.els.directivesTotal = document.getElementById('directives-total');
    this.els.convertBtn = document.getElementById('btn-convert');
    this.els.formsPerClick = document.getElementById('forms-per-click');

    this.bindClick();
    this.bindTabs();
    this.bindConvert();
    this.renderDepartments();
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

    // Floating +N number
    const clickAmt = Game.formsPerClick;
    this.floatNumber(e.clientX, e.clientY, '+' + (clickAmt % 1 ? clickAmt.toFixed(1) : clickAmt));
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

  // --- Department rendering ---
  renderDepartments() {
    const frag = document.createDocumentFragment();
    Departments.tiers.forEach((tier, i) => {
      const el = document.createElement('div');
      el.className = 'dept-item';
      el.dataset.tier = i;
      el.innerHTML =
        '<div class="dept-info">' +
          '<h3 class="dept-tier-name">' + tier.name + '</h3>' +
          '<p class="dept-desc">' + tier.desc + '</p>' +
          '<p class="dept-rate">+' + tier.baseRate + ' Forms/sec</p>' +
        '</div>' +
        '<div class="dept-buy">' +
          '<span class="dept-cost">✦ ' + formatNumber(Departments.getCost(tier)) + '</span>' +
          '<button class="btn-buy">Buy</button>' +
          '<span class="dept-owned">' + tier.owned + '</span>' +
        '</div>';

      el.querySelector('.btn-buy').addEventListener('click', () => {
        if (Departments.buy(tier)) {
          this.updateStats();
          this.updateDepartments();
        }
      });

      frag.appendChild(el);
    });
    this.els.deptList.appendChild(frag);
  },

  /** Update cost, owned count, and button enabled state for all tiers */
  updateDepartments() {
    const items = this.els.deptList.querySelectorAll('.dept-item');
    items.forEach((el) => {
      const tier = Departments.tiers[el.dataset.tier];
      const cost = Departments.getCost(tier);
      el.querySelector('.dept-cost').textContent = '✦ ' + formatNumber(cost);
      el.querySelector('.dept-owned').textContent = tier.owned;
      el.querySelector('.btn-buy').disabled = Game.forms < cost;
    });
  },

  // --- Directives conversion ---
  bindConvert() {
    this.els.convertBtn.addEventListener('click', () => {
      if (Upgrades.convertToDirective()) {
        this.updateStats();
      }
    });
  },

  // --- Stats display ---
  updateStats() {
    this.els.formsTotal.textContent = formatNumber(Game.forms);
    this.els.formsPerSec.textContent = formatNumber(Game.formsPerSec, 1);
    this.els.formsPerClick.textContent = formatNumber(Game.formsPerClick, Game.formsPerClick % 1 !== 0 ? 1 : undefined);

    // Directives UI visibility
    if (Upgrades.directivesUnlocked !== this._lastDirectivesState) {
      this._lastDirectivesState = Upgrades.directivesUnlocked;
      this.els.directivesRow.style.display = Upgrades.directivesUnlocked ? '' : 'none';
      this.els.convertBtn.parentElement.style.display = Upgrades.directivesUnlocked ? '' : 'none';
    }
    if (Upgrades.directivesUnlocked) {
      this.els.directivesTotal.textContent = formatNumber(Game.directives);
      this.els.convertBtn.disabled = Game.forms < Upgrades.CONVERSION_RATE;
    }

    // Update upgrades tab when available upgrades change
    this.updateUpgradesTab();
  },

  // --- Upgrades tab ---
  updateUpgradesTab() {
    const available = Upgrades.getAvailable();
    const sig = available.map(u => u.id).join(',');
    if (sig === this._lastAvailableUpgrades) {
      // Just update costs/buttons for existing items
      this.updateUpgradeButtons();
      return;
    }
    this._lastAvailableUpgrades = sig;
    this.renderUpgrades(available);
  },

  renderUpgrades(available) {
    const container = this.els.upgradeList;
    container.innerHTML = '';

    // Show purchased upgrades summary
    const purchased = Upgrades.getPurchased();
    if (purchased.length > 0) {
      const section = document.createElement('div');
      section.className = 'upgrades-purchased-section';
      section.innerHTML = '<h4 class="upgrades-section-title">Purchased</h4>';
      purchased.forEach(upg => {
        const el = document.createElement('div');
        el.className = 'upgrade-item upgrade-owned';
        el.innerHTML =
          '<div class="upgrade-info">' +
            '<h3 class="upgrade-name">' + upg.name + '</h3>' +
            '<p class="upgrade-desc">' + upg.desc + '</p>' +
          '</div>' +
          '<div class="upgrade-check">&#10003;</div>';
        section.appendChild(el);
      });
      container.appendChild(section);
    }

    // Available upgrades
    if (available.length > 0) {
      const section = document.createElement('div');
      section.className = 'upgrades-available-section';
      section.innerHTML = '<h4 class="upgrades-section-title">Available</h4>';
      available.forEach(upg => {
        const el = document.createElement('div');
        el.className = 'upgrade-item';
        el.dataset.upgradeId = upg.id;
        const sym = upg.currency === 'forms' ? '✦' : '◈';
        const canAfford = upg.currency === 'forms'
          ? Game.forms >= upg.cost
          : Game.directives >= upg.cost;
        el.innerHTML =
          '<div class="upgrade-info">' +
            '<h3 class="upgrade-name">' + upg.name + '</h3>' +
            '<p class="upgrade-desc">' + upg.desc + '</p>' +
            '<p class="upgrade-effect">' + this.describeEffect(upg) + '</p>' +
          '</div>' +
          '<div class="upgrade-buy">' +
            '<span class="upgrade-cost">' + sym + ' ' + formatNumber(upg.cost) + '</span>' +
            '<button class="btn-buy btn-buy-upgrade"' +
              (canAfford ? '' : ' disabled') + '>Buy</button>' +
          '</div>';

        el.querySelector('.btn-buy-upgrade').addEventListener('click', () => {
          if (Upgrades.buy(upg)) {
            this.updateStats();
            this.updateDepartments();
          }
        });

        section.appendChild(el);
      });
      container.appendChild(section);
    } else if (purchased.length === 0) {
      container.innerHTML = '<p class="tab-placeholder">Upgrades will become available once Directives are unlocked.</p>';
    }
  },

  updateUpgradeButtons() {
    const items = this.els.upgradeList.querySelectorAll('.upgrade-item[data-upgrade-id]');
    items.forEach(el => {
      const upg = Upgrades.get(el.dataset.upgradeId);
      if (!upg) return;
      const btn = el.querySelector('.btn-buy-upgrade');
      if (btn) {
        const canAfford = upg.currency === 'forms'
          ? Game.forms >= upg.cost
          : Game.directives >= upg.cost;
        btn.disabled = !canAfford;
      }
    });
  },

  describeEffect(upg) {
    const eff = upg.effect;
    switch (eff.type) {
      case 'click-add': return '+' + eff.value + ' Forms/click';
      case 'click-mult': return '\u00d7' + eff.value + ' click output';
      case 'click-dept-bonus': return 'Click \u00d7(1 + 0.01 per dept owned)';
      case 'dept-mult':
        var tier = Departments.tiers.find(t => t.id === eff.target);
        return '\u00d7' + eff.value + ' ' + (tier ? tier.name : eff.target) + ' output';
      case 'global-mult': return '\u00d7' + eff.value + ' all department output';
      case 'global-mult-if-doubled': return '+5% all output if any dept has 2+ owned';
      default: return '';
    }
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
