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
    this.els.deptList    = document.getElementById('dept-list');
    this.els.upgradeList = document.getElementById('tab-upgrades');
    this.els.deptQtyToggle    = document.getElementById('dept-qty-toggle');
    this.els.convertQtyToggle = document.getElementById('convert-qty-toggle');
    this.els.directivesRow = document.getElementById('directives-row');
    this.els.directivesTotal = document.getElementById('directives-total');
    this.els.convertBtn = document.getElementById('btn-convert');
    this.els.formsPerClick = document.getElementById('forms-per-click');
    this.els.precedentsRow = document.getElementById('precedents-row');
    this.els.precedentsTotal = document.getElementById('precedents-total');

    this.bindClick();
    this.bindTabs();
    this.bindConvert();
    this.bindQtyToggles();
    this.renderDepartments();
    this.bindDeptNameRename();

    // Restore custom department name from save
    if (Game.deptName) {
      document.getElementById('dept-name').textContent = Game.deptName;
    }

    // Apply persisted settings
    applyTickerSpeed();
    applyReducedMotion();
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
    Game.totalRejections++;
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
      if (tier.hidden) return; // skip hidden tiers (e.g., locked Jurisdiction)
      const el = document.createElement('div');
      el.className = 'dept-item';
      el.dataset.tier = i;
      el.innerHTML =
        '<div class="dept-info">' +
          '<h3 class="dept-tier-name">' + Departments.getDisplayName(tier) + '</h3>' +
          '<p class="dept-desc">' + tier.desc + '</p>' +
          '<p class="dept-rate">+' + tier.baseRate + ' Forms/sec</p>' +
        '</div>' +
        '<div class="dept-buy">' +
          '<span class="dept-cost">✦ ' + formatNumber(Departments.getCost(tier)) + '</span>' +
          '<button class="btn-buy">Buy x1</button>' +
          '<span class="dept-owned">' + tier.owned + '</span>' +
        '</div>';

      el.querySelector('.btn-buy').addEventListener('click', () => {
        const qty = Game.settings.buyQuantity;
        if (Departments.buyBulk(tier, qty) > 0) {
          this.updateStats();
          this.updateDepartments();
        }
      });

      // Double-click to rename department
      el.querySelector('.dept-tier-name').addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startDeptRename(e.currentTarget, tier);
      });

      frag.appendChild(el);
    });
    this.els.deptList.appendChild(frag);
  },

  /** Replace a department name <h3> with an inline text input for renaming */
  startDeptRename(nameEl, tier) {
    if (nameEl.querySelector('input')) return; // already editing

    const currentName = Departments.getDisplayName(tier);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'dept-rename-input';
    input.value = currentName;
    input.maxLength = 40;

    nameEl.textContent = '';
    nameEl.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
      Departments.setCustomName(tier, input.value);
      nameEl.textContent = Departments.getDisplayName(tier);
    };

    input.addEventListener('blur', commit, { once: true });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') {
        input.value = tier.name; // revert to default on Escape
        Departments.setCustomName(tier, '');
        input.blur();
      }
    });
  },

  /** Update cost, owned count, button enabled state, and display name for all tiers */
  updateDepartments() {
    const qty = Game.settings.buyQuantity;
    const items = this.els.deptList.querySelectorAll('.dept-item');
    items.forEach((el) => {
      const tier = Departments.tiers[el.dataset.tier];
      if (!tier || tier.hidden) { el.style.display = 'none'; return; }
      el.style.display = '';

      let n, cost, label;
      if (qty === 'max') {
        n = Departments.getMaxAffordable(tier);
        cost = n > 0 ? Departments.getBulkCost(tier, n) : Departments.getCost(tier);
        label = n > 0 ? ('Buy MAX (' + n + ')') : 'Buy MAX';
      } else {
        n = qty;
        cost = Departments.getBulkCost(tier, n);
        label = 'Buy x' + n;
      }

      el.querySelector('.dept-cost').textContent = '✦ ' + formatNumber(cost);
      el.querySelector('.dept-owned').textContent = tier.owned;
      const btn = el.querySelector('.btn-buy');
      btn.textContent = label;
      btn.disabled = (n <= 0) || (Game.forms < cost);
      // Update display name (skip if currently editing)
      const nameEl = el.querySelector('.dept-tier-name');
      if (!nameEl.querySelector('input')) {
        nameEl.textContent = Departments.getDisplayName(tier);
      }
    });
  },

  /** Tear down and rebuild the departments list (needed when hidden tiers become visible) */
  rebuildDepartments() {
    this.els.deptList.innerHTML = '';
    this.renderDepartments();
  },

  // --- Directives conversion ---
  bindConvert() {
    this.els.convertBtn.addEventListener('click', () => {
      const qty = Game.settings.convertQuantity;
      if (Upgrades.convertToDirectives(qty) > 0) {
        this.updateStats();
      }
    });
  },

  // --- Quantity toggles (x1 / x10 / x50 / x100 / MAX) ---
  bindQtyToggles() {
    const wire = (container, settingKey, onChange) => {
      if (!container) return;
      const buttons = container.querySelectorAll('.qty-btn');
      // Reflect persisted setting on load
      const current = Game.settings[settingKey];
      buttons.forEach((btn) => {
        const raw = btn.dataset.qty;
        const val = (raw === 'max') ? 'max' : parseInt(raw, 10);
        btn.classList.toggle('active', val === current);
        btn.addEventListener('click', () => {
          Game.settings[settingKey] = val;
          buttons.forEach((b) => b.classList.toggle('active', b === btn));
          if (onChange) onChange();
        });
      });
    };
    wire(this.els.deptQtyToggle, 'buyQuantity', () => this.updateDepartments());
    wire(this.els.convertQtyToggle, 'convertQuantity', () => this.updateStats());
  },

  // --- Department name (left panel h1) renaming ---
  bindDeptNameRename() {
    const nameEl = document.getElementById('dept-name');
    nameEl.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (nameEl.querySelector('input')) return;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dept-rename-input';
      input.value = nameEl.textContent;
      input.maxLength = 40;

      nameEl.textContent = '';
      nameEl.appendChild(input);
      input.focus();
      input.select();

      const commit = () => {
        const val = input.value.trim();
        const name = val || 'The Department';
        Game.deptName = (name === 'The Department') ? undefined : name;
        nameEl.textContent = name;
      };

      input.addEventListener('blur', commit, { once: true });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
          input.value = 'The Department';
          Game.deptName = undefined;
          input.blur();
        }
      });
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
      const rate = Upgrades.CONVERSION_RATE;
      const cqty = Game.settings.convertQuantity;
      let cn, ccost;
      if (cqty === 'max') {
        cn = Math.floor(Game.forms / rate);
        ccost = cn * rate;
      } else {
        cn = cqty;
        ccost = cn * rate;
      }
      const btn = this.els.convertBtn;
      if (cqty === 'max') {
        btn.textContent = cn > 0
          ? 'Convert ✦ ' + formatNumber(ccost) + ' → ◈ ' + formatNumber(cn)
          : 'Convert MAX';
      } else {
        btn.textContent = 'Convert ✦ ' + formatNumber(ccost) + ' → ◈ ' + formatNumber(cn);
      }
      btn.disabled = (cn <= 0) || (Game.forms < ccost);
    }

    // Precedents UI visibility (show once any have been earned or restructurings done)
    const showPrec = Game.precedents > 0 || Game.restructurings > 0;
    this.els.precedentsRow.style.display = showPrec ? '' : 'none';
    if (showPrec) {
      this.els.precedentsTotal.textContent = formatNumber(Game.precedents);
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

    // Available upgrades — grouped by category
    if (available.length > 0) {
      const section = document.createElement('div');
      section.className = 'upgrades-available-section';
      section.innerHTML = '<h4 class="upgrades-section-title">Available</h4>';

      // Bucket by category in a fixed display order
      const groupOrder = [
        { key: 'click',     label: 'Click' },
        { key: 'dept-mult', label: 'Departments' },
        { key: 'synergy',   label: 'Synergies' },
        { key: 'passive',   label: 'Passive' },
        { key: 'flavour',   label: 'Flavour' },
        { key: 'prestige',  label: 'Prestige' }
      ];
      const buckets = {};
      available.forEach(upg => {
        const key = upg.category || 'passive';
        (buckets[key] = buckets[key] || []).push(upg);
      });

      groupOrder.forEach(group => {
        const list = buckets[group.key];
        if (!list || list.length === 0) return;

        const groupEl = document.createElement('div');
        groupEl.className = 'upgrades-group upgrades-group-' + group.key;
        groupEl.innerHTML = '<h5 class="upgrades-group-title">' + group.label + '</h5>';

        list.forEach(upg => {
          const el = document.createElement('div');
          let cls = 'upgrade-item';
          if (upg.category === 'synergy') cls += ' synergy';
          if (upg.tier === 'deep') cls += ' synergy-deep';
          el.className = cls;
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
              // Force a re-render so a freshly-purchased synergy moves to the
              // Purchased list and dependents (e.g. deep synergies) appear.
              this._lastAvailableUpgrades = null;
              this.updateUpgradesTab();
              if (typeof CentreTabs !== 'undefined' && CentreTabs.renderRegistry) {
                CentreTabs.renderRegistry();
              }
            }
          });

          groupEl.appendChild(el);
        });

        section.appendChild(groupEl);
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
    const tierName = (id) => {
      const t = Departments.tiers.find(tt => tt.id === id);
      return t ? Departments.getDisplayName(t) : id;
    };
    switch (eff.type) {
      case 'click-add': return '+' + eff.value + ' Forms/click';
      case 'click-mult': return '\u00d7' + eff.value + ' click output';
      case 'click-dept-bonus': return 'Click \u00d7(1 + 0.01 per dept owned)';
      case 'dept-mult':
        return '\u00d7' + eff.value + ' ' + tierName(eff.target) + ' output';
      case 'global-mult': return '\u00d7' + eff.value + ' all department output';
      case 'global-mult-if-doubled': return '+5% all output if any dept has 2+ owned';
      case 'unlock-restructuring': return 'Unlocks the Restructuring procedure';
      case 'auto-filing': return 'Offline income +25% (and never capped)';
      case 'precedent-bonus-flat':
        return 'Restructurings yield +' + Math.round(eff.percent * 100) + '% Precedents';
      case 'synergy':
        if (!Array.isArray(eff.bonuses)) return '';
        return eff.bonuses.map(b => {
          if (b.kind === 'mult-per-owned') {
            return tierName(b.target) + ' +' + Math.round(b.percentPerOwned * 100) + '% per ' + tierName(b.source) + ' owned';
          }
          if (b.kind === 'mult-per-grouped') {
            return tierName(b.target) + ' +' + Math.round(b.percentPerGroup * 100) + '% per ' + b.groupSize + ' ' + tierName(b.source) + ' (max ' + b.maxStacks + ' stacks)';
          }
          if (b.kind === 'mult-flat') {
            return '\u00d7' + b.value + ' ' + tierName(b.target) + ' output';
          }
          if (b.kind === 'mult-flat-per-owned') {
            return tierName(b.target) + ' +' + b.flatPerOwned + ' Forms/sec per ' + tierName(b.source) + ' owned';
          }
          if (b.kind === 'global-mult') {
            return '\u00d7' + b.value + ' all department output';
          }
          if (b.kind === 'milestone-stacking') {
            return '+' + (b.percentPerMilestone * 100).toFixed(1) + '% global per milestone earned this run';
          }
          if (b.kind === 'directives-trickle') {
            return 'Generates ' + b.ratePerSec + ' \u25c8/sec passively';
          }
          return '';
        }).filter(Boolean).join(' \u00b7 ');
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

// ============================================================
// CentreTabs — controller for the centre panel tab bar.
// Floor Plan is the default; other tabs swap in admin views.
// ============================================================
const CentreTabs = {
  active: 'floorplan',
  _views: {},
  _tabs: {},

  init() {
    document.querySelectorAll('.centre-tab').forEach(tab => {
      const id = tab.dataset.centreTab;
      this._tabs[id] = tab;
      if (tab.classList.contains('locked') || tab.disabled) return;
      tab.addEventListener('click', () => this.switchTo(id));
    });
    document.querySelectorAll('.centre-view').forEach(view => {
      const id = view.id.replace('centre-view-', '');
      this._views[id] = view;
    });

    // Render static / one-time content
    this.renderHonours();
    this.renderRestructuring();
    this.renderOperations();
    this.renderRegistry();

    // If a save already had The Reorganisation purchased, unlock the tab now
    if (typeof Restructuring !== 'undefined' && Restructuring.isUnlocked()) {
      this.unlockRestructuring();
    }
  },

  /** Unlock the Restructuring centre tab (called when "The Reorganisation" is purchased or restored from save) */
  unlockRestructuring() {
    const tab = this._tabs.restructuring;
    if (!tab) return;
    if (!tab.classList.contains('locked') && !tab.disabled) return; // already unlocked

    tab.classList.remove('locked');
    tab.disabled = false;
    tab.removeAttribute('title');

    // Bind click (init() skipped this because it was disabled)
    tab.addEventListener('click', () => this.switchTo('restructuring'));

    this.renderRestructuring();
  },

  switchTo(id) {
    if (!this._views[id]) return;
    this.active = id;
    Object.keys(this._tabs).forEach(k => this._tabs[k].classList.toggle('active', k === id));
    Object.keys(this._views).forEach(k => this._views[k].classList.toggle('active', k === id));

    // Refresh dynamic views on switch
    if (id === 'registry') this.renderRegistry();
    if (id === 'honours') this.renderHonours();
    if (id === 'operations') this.refreshOperationsStatus();
    if (id === 'restructuring') this.renderRestructuring();
  },

  /** Called from the game loop — only does work when a live view is visible. */
  tickActive() {
    if (this.active === 'registry') this.renderRegistry();
    if (this.active === 'restructuring' && typeof Restructuring !== 'undefined' && Restructuring.isUnlocked()) {
      this.refreshRestructuringLive();
    }
  },

  // ---------- Registry (Stats) ----------
  renderRegistry() {
    const view = this._views.registry;
    if (!view) return;

    const totalDepts = Departments.tiers.reduce((s, t) => s + t.owned, 0);
    const ownedTiers = Departments.tiers.filter(t => t.owned > 0).length;
    const upgradesPurchased = Object.keys(Upgrades.purchased || {}).length;
    const milestonesEarned = Object.keys(Milestones.triggered || {}).length;
    const milestonesTotal = (Milestones.definitions || []).length;

    let eventsCaught = 0, eventsMissed = 0, activeBuffs = 0;
    if (typeof RandomEvents !== 'undefined') {
      eventsCaught = RandomEvents.caughtCount || 0;
      eventsMissed = RandomEvents.missedCount || 0;
      activeBuffs = (RandomEvents.buffs || []).length;
    }

    const projectedPrecedents = (typeof Restructuring !== 'undefined') ? Restructuring.calculateGain() : 0;

    const rows = (pairs) => pairs.map(([l, v]) =>
      '<div class="registry-row"><span class="registry-label">' + l +
      '</span><span class="registry-value">' + v + '</span></div>'
    ).join('');

    const lifetime = rows([
      ['Total Forms filed', formatNumber(Game.totalFormsEarned)],
      ['Total Directives converted', formatNumber(Game.totalDirectivesConverted)],
      ['Total clicks approved', formatNumber(Game.totalClicks)],
      ['Total stamps rejected', formatNumber(Game.totalRejections)],
      ['Restructurings survived', formatNumber(Game.restructurings || 0)],
      ['Total Precedents earned', formatNumber(Game.totalPrecedentsEarned)],
      ['Peak Forms / sec', formatNumber(Game.peakFormsPerSec, 1)],
      ['Random events caught', formatNumber(eventsCaught)],
      ['Random events missed', formatNumber(eventsMissed)],
      ['Milestones earned', milestonesEarned + ' / ' + milestonesTotal],
      ['Time The Department has existed', formatDuration(Date.now() - Game.gameStartTime)]
    ]);

    const tierRows = Departments.tiers
      .filter(t => !t.hidden || t.owned > 0)
      .map(t =>
        '<div class="registry-row"><span class="registry-label">&nbsp;&nbsp;' +
        Departments.getDisplayName(t) + '</span><span class="registry-value">' +
        t.owned + ' &middot; ' + formatNumber(t.effectiveRate, 1) + '/s' +
        ' &middot; ' + formatNumber(t.totalFormsGenerated) + ' lifetime</span></div>'
      ).join('');

    const current = rows([
      ['Forms filed this run', formatNumber(Game.runFormsEarned)],
      ['Forms on hand', formatNumber(Game.forms)],
      ['Forms / sec', formatNumber(Game.formsPerSec, 1)],
      ['Forms / click', formatNumber(Game.formsPerClick, Game.formsPerClick % 1 !== 0 ? 1 : undefined)],
      ['Directives held', Upgrades.directivesUnlocked ? formatNumber(Game.directives) : '\u2014'],
      ['Departments owned', formatNumber(totalDepts)],
      ['Department tiers active', ownedTiers + ' / ' + Departments.tiers.length],
      ['Upgrades purchased', formatNumber(upgradesPurchased)],
      ['Precedents held', formatNumber(Game.precedents || 0)],
      ['Projected Precedents', formatNumber(projectedPrecedents)],
      ['Time since last Restructuring', formatDuration(Date.now() - Game.runStartTime)],
      ['Active buffs', formatNumber(activeBuffs)]
    ]) + '<div class="registry-row" style="margin-top:8px"><span class="registry-label"><em>By tier:</em></span><span class="registry-value"></span></div>' + tierRows;

    view.innerHTML =
      '<div class="admin-view">' +
        '<h2 class="admin-view-header">The Registry</h2>' +
        '<p class="admin-view-flavour">The following records are accurate as of the time of filing. The time of filing is not disclosed.</p>' +
        '<div class="registry-grid">' +
          '<div class="registry-column"><h3>Lifetime</h3>' + lifetime + '</div>' +
          '<div class="registry-column"><h3>Current Run</h3>' + current + '</div>' +
        '</div>' +
      '</div>';
  },

  // ---------- Honours Board (Achievements) ----------
  renderHonours() {
    const view = this._views.honours;
    if (!view) return;

    const defs = Milestones.definitions || [];
    const earnedCount = defs.filter(m => Milestones.triggered[m.id]).length;

    const cards = defs.map(m => {
      const earned = !!Milestones.triggered[m.id];
      if (earned) {
        return '<div class="honour-card earned">' +
          '<div class="honour-stamp">Commendation Filed</div>' +
          '<div class="honour-name">' + m.name + '</div>' +
          '<div class="honour-text">' + m.text + '</div>' +
        '</div>';
      }
      return '<div class="honour-card locked">' +
        '<div class="honour-stamp">[Classified]</div>' +
        '<div class="honour-name">[REDACTED]</div>' +
        '<div class="honour-text">Awarded for conduct relating to [REDACTED].</div>' +
      '</div>';
    }).join('');

    view.innerHTML =
      '<div class="admin-view">' +
        '<h2 class="admin-view-header">The Honours Board</h2>' +
        '<p class="admin-view-flavour">Commendations awarded by The Department, to The Department, on behalf of The Department.</p>' +
        '<div class="honours-summary">' + earnedCount + ' of ' + defs.length + ' commendations on file</div>' +
        '<div class="honours-grid">' + cards + '</div>' +
      '</div>';
  },

  // ---------- Restructuring (prestige) ----------
  renderRestructuring() {
    const view = this._views.restructuring;
    if (!view) return;

    // Locked state — no Reorganisation upgrade purchased yet
    if (typeof Restructuring === 'undefined' || !Restructuring.isUnlocked()) {
      view.innerHTML =
        '<div class="admin-view">' +
          '<h2 class="admin-view-header">Restructuring</h2>' +
          '<p class="admin-view-flavour">Standard Procedure 7(b) — Reorganisation Authority Required</p>' +
          '<div class="restructuring-stub">' +
            '<div class="restructuring-stub-stamp">Authority Pending</div>' +
            '<p class="restructuring-stub-text">' +
              'Restructuring procedures are not yet authorised. The directive titled <em>"The Reorganisation"</em> has not been filed. Until such time as the requisite paperwork is processed, The Department will continue in its present configuration. The Department will continue regardless.' +
            '</p>' +
          '</div>' +
        '</div>';
      return;
    }

    // Unlocked state — show live Precedent calculation, summary, action button
    const gain = Restructuring.calculateGain();
    const held = Game.precedents || 0;
    const totalAfter = held + gain;
    const survived = Game.restructurings || 0;
    const currentMult = Game.getPrecedentMultiplier();
    const newMult = Math.pow(1.01, totalAfter);
    const canDo = Restructuring.canRestructure();
    const nextThreshold = Restructuring.formsForNextPrecedent();

    view.innerHTML =
      '<div class="admin-view">' +
        '<h2 class="admin-view-header">Restructuring</h2>' +
        '<p class="admin-view-flavour">Standard Procedure 7(b) — Filed under the authority of "The Reorganisation"</p>' +

        '<div class="restructure-notice">' +
          '<div class="restructure-notice-header">NOTICE OF PROPOSED DISSOLUTION</div>' +
          '<p class="restructure-notice-body">' +
            'Initiating a Restructuring will dissolve all current departments, forms, and directives. This action is in accordance with Standard Procedure 7(b). The Department will continue.' +
          '</p>' +
        '</div>' +

        '<div class="restructure-grid">' +
          '<div class="restructure-column">' +
            '<h3>Current Standing</h3>' +
            '<div class="registry-row"><span class="registry-label">Precedents held</span><span class="registry-value" data-rs="held">\u2316 ' + formatNumber(held) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">Permanent multiplier</span><span class="registry-value" data-rs="cur-mult">\u00d7' + currentMult.toFixed(3) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">Restructurings survived</span><span class="registry-value" data-rs="survived">' + formatNumber(survived) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">Forms filed this run</span><span class="registry-value" data-rs="run">' + formatNumber(Game.runFormsEarned) + '</span></div>' +
          '</div>' +
          '<div class="restructure-column">' +
            '<h3>Projected Outcome</h3>' +
            '<div class="registry-row"><span class="registry-label">Precedents to be earned</span><span class="registry-value" data-rs="gain">\u2316 ' + formatNumber(gain) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">Total after Restructuring</span><span class="registry-value" data-rs="total-after">\u2316 ' + formatNumber(totalAfter) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">New permanent multiplier</span><span class="registry-value" data-rs="new-mult">\u00d7' + newMult.toFixed(3) + '</span></div>' +
            '<div class="registry-row"><span class="registry-label">Forms required for next \u2316</span><span class="registry-value" data-rs="next">' + formatNumber(nextThreshold) + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="restructure-summary">' +
          '<div class="restructure-summary-col">' +
            '<h4>To be dissolved</h4>' +
            '<ul>' +
              '<li>All Forms on hand</li>' +
              '<li>All Directives</li>' +
              '<li>All departments and their staff</li>' +
              '<li>All purchased Upgrades (excluding "The Reorganisation")</li>' +
              '<li>All temporary buffs and active events</li>' +
            '</ul>' +
          '</div>' +
          '<div class="restructure-summary-col">' +
            '<h4>To be retained</h4>' +
            '<ul>' +
              '<li>Precedents (\u2316) earned, in perpetuity</li>' +
              '<li>"The Reorganisation" itself</li>' +
              '<li>All commendations on the Honours Board</li>' +
              '<li>Lifetime totals in the Registry</li>' +
              '<li>Custom departmental nomenclature</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +

        '<div class="restructure-action">' +
          '<button class="btn-ops danger" data-rs="initiate"' + (canDo ? '' : ' disabled') + '>Initiate Restructuring</button>' +
          '<div class="restructure-action-note" data-rs="note">' +
            (canDo
              ? 'Authority to proceed has been confirmed. The Department will continue.'
              : 'Insufficient Forms have been processed to justify Restructuring. At least one Precedent must be earnable.') +
          '</div>' +
        '</div>' +
      '</div>';

    this.bindRestructuringAction();
  },

  /** Cheap per-tick refresh of the live values on the Restructuring panel (no DOM teardown). */
  refreshRestructuringLive() {
    const view = this._views.restructuring;
    if (!view) return;
    const q = (sel) => view.querySelector('[data-rs="' + sel + '"]');
    const gainEl = q('gain');
    if (!gainEl) return; // not in unlocked render

    const gain = Restructuring.calculateGain();
    const held = Game.precedents || 0;
    const totalAfter = held + gain;
    const newMult = Math.pow(1.01, totalAfter);
    const canDo = Restructuring.canRestructure();
    const nextThreshold = Restructuring.formsForNextPrecedent();

    gainEl.textContent = '\u2316 ' + formatNumber(gain);
    q('total-after').textContent = '\u2316 ' + formatNumber(totalAfter);
    q('new-mult').textContent = '\u00d7' + newMult.toFixed(3);
    q('run').textContent = formatNumber(Game.runFormsEarned);
    q('next').textContent = formatNumber(nextThreshold);

    const btn = q('initiate');
    if (btn) btn.disabled = !canDo;
    const note = q('note');
    if (note) {
      note.textContent = canDo
        ? 'Authority to proceed has been confirmed. The Department will continue.'
        : 'Insufficient Forms have been processed to justify Restructuring. At least one Precedent must be earnable.';
    }
  },

  bindRestructuringAction() {
    const view = this._views.restructuring;
    if (!view) return;
    const btn = view.querySelector('[data-rs="initiate"]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!Restructuring.canRestructure()) return;
      // Confirm via native dialog (deadpan, in keeping with the tone)
      const ok = window.confirm(
        'Initiate Restructuring?\n\n' +
        'All current Forms, Directives, departments and Upgrades will be dissolved. ' +
        'Precedents earned will be retained.\n\n' +
        'The Department will continue.'
      );
      if (!ok) return;
      Restructuring.perform();
    });
  },

  // ---------- Operations (Save / Options) ----------
  renderOperations() {
    const view = this._views.operations;
    if (!view) return;

    view.innerHTML =
      '<div class="admin-view">' +
        '<h2 class="admin-view-header">Operations</h2>' +
        '<p class="admin-view-flavour">Administrative procedures. Authorisation is assumed.</p>' +

        '<div class="operations-section">' +
          '<h3 class="operations-section-title">Save &amp; Data</h3>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">File Current State</div>' +
              '<div class="ops-action-desc">Commit the current Department state to local storage.</div>' +
            '</div>' +
            '<button class="btn-ops" data-ops="save">File Now</button>' +
          '</div>' +
          '<div class="ops-status" data-ops-status="save"></div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Submit to Archive</div>' +
              '<div class="ops-action-desc">Export the current save as a transferable string.</div>' +
            '</div>' +
            '<button class="btn-ops" data-ops="export">Export</button>' +
          '</div>' +
          '<textarea class="ops-textarea" data-ops="export-text" readonly placeholder="Exported save will appear here…"></textarea>' +
          '<div class="ops-status" data-ops-status="export"></div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Retrieve from Archive</div>' +
              '<div class="ops-action-desc">Paste a previously exported save string and import it. The page will reload.</div>' +
            '</div>' +
            '<button class="btn-ops" data-ops="import">Import</button>' +
          '</div>' +
          '<textarea class="ops-textarea" data-ops="import-text" placeholder="Paste an exported save string here…"></textarea>' +
          '<div class="ops-status" data-ops-status="import"></div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Initiate Total Dissolution</div>' +
              '<div class="ops-action-desc">Type <strong>CONFIRMED</strong> to dissolve The Department completely. This action cannot be reversed. Proceed only if authorised.</div>' +
            '</div>' +
            '<div>' +
              '<input class="ops-input" type="text" data-ops="wipe-confirm" placeholder="CONFIRMED" />' +
              '<button class="btn-ops danger" data-ops="wipe">Dissolve</button>' +
            '</div>' +
          '</div>' +
          '<div class="ops-status" data-ops-status="wipe"></div>' +
        '</div>' +

        '<div class="operations-section">' +
          '<h3 class="operations-section-title">Options</h3>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Offline Income</div>' +
              '<div class="ops-action-desc">Continue earning Forms while the tab is closed.</div>' +
            '</div>' +
            '<label><input type="checkbox" data-option="offlineIncome" checked /> Enabled</label>' +
          '</div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">News Ticker Speed</div>' +
              '<div class="ops-action-desc">Pace at which the ticker scrolls.</div>' +
            '</div>' +
            '<select class="ops-input" data-option="tickerSpeed"><option value="slow">Slow</option><option value="normal" selected>Normal</option><option value="fast">Fast</option></select>' +
          '</div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Reduced Motion</div>' +
              '<div class="ops-action-desc">Disables non-essential animations.</div>' +
            '</div>' +
            '<label><input type="checkbox" data-option="reducedMotion" /> Enabled</label>' +
          '</div>' +

          '<div class="ops-action">' +
            '<div class="ops-action-info">' +
              '<div class="ops-action-label">Number Formatting</div>' +
              '<div class="ops-action-desc">How large numbers are displayed throughout The Department.</div>' +
            '</div>' +
            '<select class="ops-input" data-option="numberFormat"><option value="full">Full</option><option value="abbreviated" selected>Abbreviated</option><option value="scientific">Scientific</option></select>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.bindOperations();
    this.syncOptionsControls();
  },

  syncOptionsControls() {
    var view = this._views.operations;
    if (!view) return;
    var oi = view.querySelector('[data-option="offlineIncome"]');
    if (oi) oi.checked = Game.settings.offlineIncome;
    var rm = view.querySelector('[data-option="reducedMotion"]');
    if (rm) rm.checked = Game.settings.reducedMotion;
    var ts = view.querySelector('[data-option="tickerSpeed"]');
    if (ts) ts.value = Game.settings.tickerSpeed;
    var nf = view.querySelector('[data-option="numberFormat"]');
    if (nf) nf.value = Game.settings.numberFormat;
  },

  bindOperations() {
    const view = this._views.operations;
    if (!view) return;

    const setStatus = (key, msg, isError) => {
      const el = view.querySelector('[data-ops-status="' + key + '"]');
      if (!el) return;
      el.textContent = msg || '';
      el.classList.toggle('error', !!isError);
    };

    view.querySelector('[data-ops="save"]').addEventListener('click', () => {
      const ok = Save.save();
      if (ok) {
        const t = new Date(Save.lastSavedAt || Date.now());
        const hh = String(t.getHours()).padStart(2, '0');
        const mm = String(t.getMinutes()).padStart(2, '0');
        const ss = String(t.getSeconds()).padStart(2, '0');
        setStatus('save', 'Filed at ' + hh + ':' + mm + ':' + ss + '.');
      } else {
        setStatus('save', 'Filing failed. Storage unavailable.', true);
      }
    });

    view.querySelector('[data-ops="export"]').addEventListener('click', () => {
      const str = Save.exportString();
      const ta = view.querySelector('[data-ops="export-text"]');
      ta.value = str;
      ta.select();
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(str);
          copied = true;
        }
      } catch (e) { /* ignore */ }
      setStatus('export', copied
        ? 'Archive prepared and copied to clipboard.'
        : 'Archive prepared. Copy the text above to retain it.');
    });

    view.querySelector('[data-ops="import"]').addEventListener('click', () => {
      const ta = view.querySelector('[data-ops="import-text"]');
      const ok = Save.importString(ta.value);
      if (ok) {
        setStatus('import', 'Archive accepted. Reloading…');
        setTimeout(() => location.reload(), 500);
      } else {
        setStatus('import', 'Submission rejected. The string is not a valid Departmental record.', true);
      }
    });

    view.querySelector('[data-ops="wipe"]').addEventListener('click', () => {
      const input = view.querySelector('[data-ops="wipe-confirm"]');
      if ((input.value || '').trim() !== 'CONFIRMED') {
        setStatus('wipe', 'Type CONFIRMED to authorise dissolution.', true);
        return;
      }
      Save.wipeAll();
      setStatus('wipe', 'Dissolution complete. The Department will continue.');
      setTimeout(() => location.reload(), 600);
    });

    // --- Options bindings ---
    var oiCheck = view.querySelector('[data-option="offlineIncome"]');
    if (oiCheck) oiCheck.addEventListener('change', function() {
      Game.settings.offlineIncome = this.checked;
      Save.save();
    });

    var tsSelect = view.querySelector('[data-option="tickerSpeed"]');
    if (tsSelect) tsSelect.addEventListener('change', function() {
      Game.settings.tickerSpeed = this.value;
      applyTickerSpeed();
      Save.save();
    });

    var rmCheck = view.querySelector('[data-option="reducedMotion"]');
    if (rmCheck) rmCheck.addEventListener('change', function() {
      Game.settings.reducedMotion = this.checked;
      applyReducedMotion();
      Save.save();
    });

    var nfSelect = view.querySelector('[data-option="numberFormat"]');
    if (nfSelect) nfSelect.addEventListener('change', function() {
      Game.settings.numberFormat = this.value;
      Save.save();
    });
  },

  refreshOperationsStatus() {
    // Reserved for future per-open updates (e.g., last saved time).
  }
};

// --- Helpers ---

function applyTickerSpeed() {
  var track = document.getElementById('ticker-track');
  if (!track) return;
  var speeds = { slow: '70s', normal: '45s', fast: '25s' };
  track.style.animationDuration = speeds[Game.settings.tickerSpeed] || '45s';
}

var _tickerCycleId = null;
var _tickerCycleIndex = 0;

function applyReducedMotion() {
  var enabled = Game.settings.reducedMotion;
  document.body.setAttribute('data-reduced-motion', enabled ? 'true' : 'false');

  // Ticker: switch between scroll animation and static cycling
  if (enabled) {
    startTickerCycle();
  } else {
    stopTickerCycle();
  }
}

function startTickerCycle() {
  stopTickerCycle();
  _tickerCycleIndex = 0;
  tickerCycleAdvance();
  _tickerCycleId = setInterval(tickerCycleAdvance, 4000);
}

function tickerCycleAdvance() {
  var track = document.getElementById('ticker-track');
  if (!track) return;
  var items = track.querySelectorAll('.ticker-item');
  if (items.length === 0) return;

  // Remove active class from all items
  for (var i = 0; i < items.length; i++) items[i].classList.remove('ticker-active');

  // Wrap index if items were added/removed
  if (_tickerCycleIndex >= items.length) _tickerCycleIndex = 0;
  items[_tickerCycleIndex].classList.add('ticker-active');
  _tickerCycleIndex = (_tickerCycleIndex + 1) % items.length;
}

function stopTickerCycle() {
  if (_tickerCycleId) {
    clearInterval(_tickerCycleId);
    _tickerCycleId = null;
  }
  // Remove ticker-active class (CSS handles visibility via data-reduced-motion)
  var track = document.getElementById('ticker-track');
  if (!track) return;
  var items = track.querySelectorAll('.ticker-item');
  for (var i = 0; i < items.length; i++) items[i].classList.remove('ticker-active');
}

// Exposed so Ticker.rebuildDOM can reset the reduced-motion cycle after the
// item list changes without reaching into module-local state.
UI.resetTickerCycleIndex = function () { _tickerCycleIndex = 0; };

var NUMBER_SUFFIXES = [
  { val: 1e48, suf: 'QiDc' },
  { val: 1e45, suf: 'QaDc' },
  { val: 1e42, suf: 'TDc' },
  { val: 1e39, suf: 'DDc' },
  { val: 1e36, suf: 'UDc' },
  { val: 1e33, suf: 'Dc' },
  { val: 1e30, suf: 'No' },
  { val: 1e27, suf: 'Oc' },
  { val: 1e24, suf: 'Sp' },
  { val: 1e21, suf: 'Sx' },
  { val: 1e18, suf: 'Qi' },
  { val: 1e15, suf: 'Qa' },
  { val: 1e12, suf: 'T' },
  { val: 1e9,  suf: 'B' },
  { val: 1e6,  suf: 'M' },
  { val: 1e3,  suf: 'K' }
];

function formatDuration(ms) {
  var sec = Math.floor(ms / 1000);
  var days = Math.floor(sec / 86400); sec %= 86400;
  var hrs  = Math.floor(sec / 3600);  sec %= 3600;
  var mins = Math.floor(sec / 60);    sec %= 60;
  var parts = [];
  if (days > 0) parts.push(days + 'd');
  if (hrs > 0)  parts.push(hrs + 'h');
  if (mins > 0) parts.push(mins + 'm');
  if (parts.length === 0) parts.push(sec + 's');
  return parts.join(' ');
}

function formatNumber(n, decimals) {
  if (typeof decimals === 'number') return n.toFixed(decimals);

  var fmt = Game.settings.numberFormat;
  if (fmt === 'full') return Math.floor(n).toLocaleString();
  if (fmt === 'scientific') return n >= 1e3 ? n.toExponential(2) : Math.floor(n).toLocaleString();

  // 'abbreviated' (default) — use suffix table, fall back to scientific for huge numbers
  if (n >= 1e51) return n.toExponential(2);
  for (var i = 0; i < NUMBER_SUFFIXES.length; i++) {
    if (n >= NUMBER_SUFFIXES[i].val) {
      return (n / NUMBER_SUFFIXES[i].val).toFixed(2) + ' ' + NUMBER_SUFFIXES[i].suf;
    }
  }
  return Math.floor(n).toLocaleString();
}
