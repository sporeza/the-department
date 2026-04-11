/**
 * events.js — Random event system.
 * Spawns clickable events in the centre panel on timers.
 * Manages temporary buff effects from event rewards.
 */

const RandomEvents = {
  // --- State ---
  unlocked: false,
  activeEvent: null,   // { id, timeRemaining, duration, el } or null
  buffs: [],           // [{ id, label, multiplier, remaining, scope }]
  caughtCount: 0,      // lifetime events caught (persists through Restructuring)
  missedCount: 0,      // lifetime events missed (persists through Restructuring)
  spawnTimers: {
    tier1: 0,
    tier2: 0
  },

  // --- Constants ---
  TIER1_MIN: 5, // default:120
  TIER1_MAX: 10, // default:300
  TIER2_MIN: 45, // default:900
  TIER2_MAX: 75, //default:1800

  // --- Cached DOM ---
  _container: null,
  _buffContainer: null,
  _lastBuffSig: '',
  _policyModal: null,
  _policyModalBar: null,

  // --- Event Definitions ---
  events: [
    {
      id: 'lost-form',
      tier: 1,
      name: 'The Lost Form',
      duration: 9,
      flavour: 'Form 14(c) \u2014 origin unknown, destination unclear. It passed through. You caught it. This has been noted.',
      missText: "A form passed through unattended. It has been filed under 'lost causes'.",
      spawn: function (container, duration) {
        var el = document.createElement('div');
        el.className = 'event-lost-form';
        el.style.animationDuration = duration + 's';
        el.innerHTML =
          '<div class="event-lost-form-inner">' +
            '<span class="event-form-label">FORM 14(c)</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () { RandomEvents.catchEvent(); });
        return el;
      },
      reward: function () {
        var bonus = Math.max(1, Game.formsPerSec * 30);
        Game.forms += bonus;
        Game.totalFormsEarned += bonus;
        Game.runFormsEarned += bonus;
        return '+' + formatNumber(bonus) + ' Forms';
      }
    },
    {
      id: 'urgent-memo',
      tier: 1,
      name: 'The Urgent Memo',
      duration: 20,
      flavour: "The memo was urgent. All memos are urgent. Urgency is The Department's resting state.",
      missText: "The memo was filed in the wrong tray. It is now someone else's problem. It has always been someone else's problem.",
      spawn: function (container, duration) {
        var el = document.createElement('div');
        el.className = 'event-urgent-memo';
        el.innerHTML =
          '<div class="event-urgent-memo-inner">' +
            '<span class="event-memo-stamp">URGENT</span>' +
            '<span class="event-memo-label">ACTION REQUIRED</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () { RandomEvents.catchEvent(); });
        return el;
      },
      reward: function () {
        RandomEvents.addBuff('urgent-memo', 'Urgent Memo', 1.5, 30, 'income');
        return '+50% Forms/sec for 30s';
      }
    },
    {
      id: 'escaped-intern',
      tier: 1,
      name: 'The Escaped Intern',
      duration: 12,
      flavour: 'They were found. They were returned to their station. They do not speak of sublevel 4.',
      missText: 'The Intern has not been seen since Tuesday. Colleagues believe they found sublevel 4.',
      spawn: function (container, duration) {
        var el = document.createElement('div');
        el.className = 'event-escaped-intern';
        el.style.animationDuration = duration + 's';
        el.innerHTML =
          '<div class="event-intern-sprite">' +
            '<span class="event-intern-icon">\uD83C\uDFC3</span>' +
            '<span class="event-intern-label">INTERN</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () { RandomEvents.catchEvent(); });
        return el;
      },
      reward: function () {
        var intern = Departments.tiers.find(function (t) { return t.id === 'intern'; });
        var rate = (intern && intern.effectiveRate) ? intern.effectiveRate : 0;
        var bonus = Math.max(1, rate * 60);
        Game.forms += bonus;
        Game.totalFormsEarned += bonus;
        Game.runFormsEarned += bonus;
        return '+' + formatNumber(bonus) + ' Forms';
      }
    },
    {
      id: 'visiting-inspector',
      tier: 2,
      name: 'The Visiting Inspector',
      duration: 17,
      flavour: 'The Inspector found everything satisfactory. The Inspector always finds everything satisfactory. The Inspector has never found anything unsatisfactory.',
      missText: 'The Inspector departed before preparations could be made. A note has been left expressing mild disapproval.',
      spawn: function (container, duration) {
        var el = document.createElement('div');
        el.className = 'event-inspector';
        el.style.animationDuration = duration + 's';
        el.innerHTML =
          '<div class="event-inspector-inner">' +
            '<span class="event-inspector-icon">\uD83D\uDCCB</span>' +
            '<span class="event-inspector-label">INSPECTOR</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () { RandomEvents.catchEvent(); });
        return el;
      },
      reward: function () {
        RandomEvents.addBuff('inspector-boost', 'Inspector Approved', 3, 60, 'income');
        return '\u00d73 all output for 60s';
      }
    },
    {
      id: 'policy-window',
      tier: 2,
      name: 'The Policy Window',
      duration: 25,
      flavour: 'Policy has been enacted. Compliance is assumed. Non-compliance has not been defined and therefore cannot occur.',
      missText: 'The window closed. A policy was selected by default. It was the wrong one. This has been filed.',
      // Possible choice pairs — one is picked at spawn time and stored on the DOM element
      _pairs: [
        {
          id: 'pair-a',
          choices: [
            {
              key: 'streamline',
              label: 'Streamline Processing',
              blurb: '+75% Forms/sec for 90s',
              apply: function () {
                RandomEvents.addBuff('streamline', 'Streamline Processing', 1.75, 90, 'income');
                return '+75% Forms/sec for 90s';
              }
            },
            {
              key: 'discretionary',
              label: 'Discretionary Budget',
              blurb: 'Large one-time Forms bonus',
              apply: function () {
                var bonus = Math.max(1, Game.formsPerSec * 120);
                Game.forms += bonus;
                Game.totalFormsEarned += bonus;
                Game.runFormsEarned += bonus;
                return '+' + formatNumber(bonus) + ' Forms';
              }
            }
          ]
        },
        {
          id: 'pair-b',
          choices: [
            {
              key: 'overtime',
              label: 'Mandatory Overtime',
              blurb: '\u00d72 click output for 120s',
              apply: function () {
                RandomEvents.addBuff('overtime', 'Mandatory Overtime', 2, 120, 'click');
                return '\u00d72 click output for 120s';
              }
            },
            {
              key: 'wellbeing',
              label: 'Staff Wellbeing Initiative',
              blurb: '+25% all departments for 60s',
              apply: function () {
                RandomEvents.addBuff('wellbeing', 'Staff Wellbeing', 1.25, 60, 'income');
                return '+25% all departments for 60s';
              }
            }
          ]
        }
      ],
      spawn: function (container, duration) {
        var def = this;
        var pair = def._pairs[Math.floor(Math.random() * def._pairs.length)];
        var el = document.createElement('div');
        el.className = 'event-policy-notice';
        el.innerHTML =
          '<div class="event-policy-notice-inner">' +
            '<span class="event-policy-notice-title">NEW POLICY</span>' +
            '<span class="event-policy-notice-sub">ENACTED</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () {
          RandomEvents._openPolicyModal(pair);
        });
        // Stash the chosen pair on the active-event object once spawnEvent creates it
        el._policyPair = pair;
        return el;
      },
      reward: function (choiceKey) {
        // Find chosen choice across all pairs
        var def = this;
        for (var i = 0; i < def._pairs.length; i++) {
          var pair = def._pairs[i];
          for (var j = 0; j < pair.choices.length; j++) {
            if (pair.choices[j].key === choiceKey) {
              return pair.choices[j].apply();
            }
          }
        }
        return '';
      }
    },
    {
      id: 'mysterious-package',
      tier: 2,
      name: 'The Mysterious Package',
      duration: 18,
      flavour: 'The package arrived. No sender. No return address. Intake processed it. This is their job.',
      missText: "The package was left in intake overnight. In the morning, it was gone. This has been filed under 'resolved'.",
      // Weighted outcomes. 'directive' outcome is skipped when directives are locked.
      _outcomes: [
        {
          key: 'biscuits',
          weight: 40,
          flavour: 'Assorted biscuits. Morale improved briefly.',
          apply: function () {
            RandomEvents.addBuff('biscuits', 'Assorted Biscuits', 1.05, 60, 'income');
            return '+5% all output for 60s';
          }
        },
        {
          key: 'unclear',
          weight: 25,
          flavour: 'It is unclear what this is. It has been filed.',
          apply: function () {
            var bonus = Math.max(1, Game.formsPerSec * 60);
            Game.forms += bonus;
            Game.totalFormsEarned += bonus;
            Game.runFormsEarned += bonus;
            return '+' + formatNumber(bonus) + ' Forms';
          }
        },
        {
          key: 'triplicate',
          weight: 20,
          flavour: 'Form 7B (triplicate). You already have these.',
          apply: function () {
            var bonus = Math.max(1, Game.formsPerSec * 15);
            Game.forms += bonus;
            Game.totalFormsEarned += bonus;
            Game.runFormsEarned += bonus;
            return '+' + formatNumber(bonus) + ' Forms';
          }
        },
        {
          key: 'directive',
          weight: 15,
          requiresDirectives: true,
          flavour: 'An unsigned Directive.',
          apply: function () {
            var qty = 3;
            Game.directives += qty;
            return '+' + qty + ' Directives';
          }
        }
      ],
      spawn: function (container, duration) {
        var el = document.createElement('div');
        el.className = 'event-mysterious-package';
        el.innerHTML =
          '<div class="event-package-inner">' +
            '<span class="event-package-icon">\uD83D\uDCE6</span>' +
            '<span class="event-package-label">INTAKE</span>' +
          '</div>';
        container.appendChild(el);
        el.addEventListener('click', function () { RandomEvents.catchEvent(); });
        return el;
      },
      reward: function () {
        var def = this;
        // Build eligible outcomes
        var directivesReady = (typeof Upgrades !== 'undefined' && Upgrades.directivesUnlocked);
        var pool = [];
        var total = 0;
        for (var i = 0; i < def._outcomes.length; i++) {
          var o = def._outcomes[i];
          if (o.requiresDirectives && !directivesReady) continue;
          pool.push(o);
          total += o.weight;
        }
        var roll = Math.random() * total;
        var acc = 0;
        var chosen = pool[0];
        for (var j = 0; j < pool.length; j++) {
          acc += pool[j].weight;
          if (roll < acc) { chosen = pool[j]; break; }
        }
        var rewardText = chosen.apply();
        // Prepend the outcome flavour so the toast has the in-universe note
        return chosen.flavour + ' \u2014 ' + rewardText;
      }
    }
  ],

  // --- Initialisation ---
  init: function () {
    // Spawn into the floor plan view so events sit inside the office area
    // and are naturally hidden when another centre tab is active.
    this._container = document.getElementById('centre-view-floorplan')
      || document.getElementById('panel-centre');
    this._buffContainer = document.getElementById('active-buffs');

    // If restoring a saved active event, re-spawn its DOM. Each event's spawn()
    // wires its own click handler, so no extra wiring here.
    if (this.activeEvent && this.activeEvent.id) {
      var def = this.getEventDef(this.activeEvent.id);
      if (def && this.activeEvent.timeRemaining > 1) {
        var duration = this.activeEvent.duration || def.duration;
        this.activeEvent.el = def.spawn(this._container, duration);
      } else {
        this.activeEvent = null;
      }
    }

    // Apply any restored buffs to income and click
    if (this.buffs.length > 0) {
      if (typeof Upgrades !== 'undefined') Upgrades.applyEffects();
      else Departments.recalcIncome();
    }
  },

  // --- Lookup ---
  getEventDef: function (id) {
    for (var i = 0; i < this.events.length; i++) {
      if (this.events[i].id === id) return this.events[i];
    }
    return null;
  },

  getTierEvents: function (tier) {
    var result = [];
    for (var i = 0; i < this.events.length; i++) {
      if (this.events[i].tier === tier) result.push(this.events[i]);
    }
    return result;
  },

  // --- Core Tick ---
  tick: function (dt) {
    // Check unlock
    if (!this.unlocked) {
      if (Departments.getOwned('filing-cabinet') >= 1) {
        this.unlocked = true;
        this.spawnTimers.tier1 = this.rollSpawnTimer(1);
        this.spawnTimers.tier2 = this.rollSpawnTimer(2);
      } else {
        return;
      }
    }

    // Tick active event countdown
    if (this.activeEvent) {
      this.activeEvent.timeRemaining -= dt;
      if (this._policyModalBar) {
        var pct = Math.max(0, this.activeEvent.timeRemaining / this.activeEvent.duration) * 100;
        this._policyModalBar.style.width = pct + '%';
      }
      if (this.activeEvent.timeRemaining <= 0) {
        this.missEvent();
      }
    }

    // Tick spawn timers
    if (!this.activeEvent) {
      this.spawnTimers.tier1 -= dt;
      this.spawnTimers.tier2 -= dt;

      if (this.spawnTimers.tier2 <= 0) {
        this.trySpawn(2);
        this.spawnTimers.tier2 = this.rollSpawnTimer(2);
      }
      if (!this.activeEvent && this.spawnTimers.tier1 <= 0) {
        this.trySpawn(1);
        this.spawnTimers.tier1 = this.rollSpawnTimer(1);
      }
    }

    // Tick buffs
    this.tickBuffs(dt);
    this.updateBuffUI();
  },

  rollSpawnTimer: function (tier) {
    var min = tier === 1 ? this.TIER1_MIN : this.TIER2_MIN;
    var max = tier === 1 ? this.TIER1_MAX : this.TIER2_MAX;
    return Math.random() * (max - min) + min;
  },

  // --- Spawn ---
  trySpawn: function (tier) {
    if (this.activeEvent) return;
    var pool = this.getTierEvents(tier);
    if (pool.length === 0) return;
    var def = pool[Math.floor(Math.random() * pool.length)];
    this.spawnEvent(def);
  },

  spawnEvent: function (def) {
    // spawn() is responsible for wiring its own click handlers
    var el = def.spawn(this._container, def.duration);
    this.activeEvent = {
      id: def.id,
      timeRemaining: def.duration,
      duration: def.duration,
      el: el
    };
  },

  // --- Catch (player clicked) ---
  catchEvent: function (choiceKey) {
    if (!this.activeEvent) return;
    var def = this.getEventDef(this.activeEvent.id);
    if (!def) return;

    this.caughtCount++;

    // Grant reward (may be parameterised by a choice key for multi-choice events)
    var rewardText = def.reward(choiceKey);

    // Remove DOM
    if (this.activeEvent.el && this.activeEvent.el.parentNode) {
      this.activeEvent.el.remove();
    }
    this._cleanupPolicyModal();
    this.activeEvent = null;

    // Toast notification
    this.showEventToast(def.name, def.flavour, rewardText);

    // Ticker (dedupes by event id — repeat catches won't fill the queue)
    Ticker.push(def.flavour, { source: 'event-catch', dedupeKey: 'event-catch:' + def.id });

    // Update stats immediately
    UI.updateStats();
  },

  // --- Miss (event expired) ---
  missEvent: function () {
    if (!this.activeEvent) return;
    this.missedCount++;
    var def = this.getEventDef(this.activeEvent.id);

    // Remove DOM
    if (this.activeEvent.el && this.activeEvent.el.parentNode) {
      this.activeEvent.el.remove();
    }
    this._cleanupPolicyModal();
    this.activeEvent = null;

    // Ticker (dedupes by event id — repeat misses won't fill the queue)
    if (def && def.missText) {
      Ticker.push(def.missText, { source: 'event-miss', dedupeKey: 'event-miss:' + def.id });
    }
  },

  // --- Policy Window modal ---
  _openPolicyModal: function (pair) {
    if (this._policyModal) return;
    var modal = document.createElement('div');
    modal.className = 'event-policy-modal';
    var html =
      '<div class="event-policy-card">' +
        '<div class="event-policy-header">NEW POLICY ENACTED</div>' +
        '<div class="event-policy-body">Two courses of action are available. Select one. Both will be filed.</div>' +
        '<div class="event-policy-choices">';
    for (var i = 0; i < pair.choices.length; i++) {
      var c = pair.choices[i];
      html +=
        '<button class="event-policy-choice" data-key="' + c.key + '">' +
          '<span class="event-policy-choice-label">' + c.label + '</span>' +
          '<span class="event-policy-choice-blurb">' + c.blurb + '</span>' +
        '</button>';
    }
    html +=
        '</div>' +
        '<div class="event-policy-timer">' +
          '<div class="event-policy-timer-bar"></div>' +
        '</div>' +
      '</div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    this._policyModal = modal;
    this._policyModalBar = modal.querySelector('.event-policy-timer-bar');

    var self = this;
    var buttons = modal.querySelectorAll('.event-policy-choice');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', function (e) {
        var key = e.currentTarget.getAttribute('data-key');
        self.catchEvent(key);
      });
    }

    // Force reflow then fade in
    void modal.offsetWidth;
    modal.classList.add('visible');
  },

  _cleanupPolicyModal: function () {
    if (this._policyModal && this._policyModal.parentNode) {
      this._policyModal.remove();
    }
    this._policyModal = null;
    this._policyModalBar = null;
  },

  // --- Toast ---
  showEventToast: function (name, flavour, rewardText) {
    var toast = document.createElement('div');
    toast.className = 'event-toast';
    toast.innerHTML =
      '<div class="event-toast-title">EVENT</div>' +
      '<div class="event-toast-name">' + name + '</div>' +
      '<div class="event-toast-reward">' + rewardText + '</div>' +
      '<div class="event-toast-text">' + flavour + '</div>';
    document.body.appendChild(toast);

    // Force reflow then animate in
    void toast.offsetWidth;
    toast.classList.add('event-toast-visible');

    setTimeout(function () {
      toast.classList.remove('event-toast-visible');
      toast.classList.add('event-toast-exit');
      toast.addEventListener('animationend', function () { toast.remove(); });
    }, 4000);
  },

  // --- Buff System ---
  addBuff: function (id, label, multiplier, duration, scope) {
    scope = scope || 'income';
    // Replace existing buff of same id
    for (var i = this.buffs.length - 1; i >= 0; i--) {
      if (this.buffs[i].id === id) {
        this.buffs.splice(i, 1);
      }
    }
    this.buffs.push({ id: id, label: label, multiplier: multiplier, remaining: duration, scope: scope });
    // Recalc the right side of the game: click buffs run through applyEffects,
    // income buffs only touch department income math.
    if (scope === 'click' && typeof Upgrades !== 'undefined') {
      Upgrades.applyEffects();
    } else {
      Departments.recalcIncome();
    }
  },

  tickBuffs: function (dt) {
    if (this.buffs.length === 0) return;
    var expiredScopes = { income: false, click: false };
    var changed = false;
    for (var i = this.buffs.length - 1; i >= 0; i--) {
      this.buffs[i].remaining -= dt;
      if (this.buffs[i].remaining <= 0) {
        expiredScopes[this.buffs[i].scope || 'income'] = true;
        this.buffs.splice(i, 1);
        changed = true;
      }
    }
    if (changed) {
      if (expiredScopes.click && typeof Upgrades !== 'undefined') {
        // applyEffects() runs recalcIncome() at its tail, so this covers both.
        Upgrades.applyEffects();
      } else {
        Departments.recalcIncome();
      }
    }
  },

  getGlobalBuffMultiplier: function () {
    var mult = 1;
    for (var i = 0; i < this.buffs.length; i++) {
      var b = this.buffs[i];
      if ((b.scope || 'income') === 'click') continue;
      mult *= b.multiplier;
    }
    return mult;
  },

  getClickBuffMultiplier: function () {
    var mult = 1;
    for (var i = 0; i < this.buffs.length; i++) {
      if (this.buffs[i].scope === 'click') {
        mult *= this.buffs[i].multiplier;
      }
    }
    return mult;
  },

  // --- Buff UI ---
  updateBuffUI: function () {
    if (!this._buffContainer) return;

    // Build a signature to skip unnecessary DOM updates
    var sig = this.buffs.map(function (b) {
      return b.id + ':' + Math.ceil(b.remaining);
    }).join(',');
    if (sig === this._lastBuffSig) return;
    this._lastBuffSig = sig;

    if (this.buffs.length === 0) {
      this._buffContainer.style.display = 'none';
      this._buffContainer.innerHTML = '';
      return;
    }

    this._buffContainer.style.display = '';
    var html = '';
    for (var i = 0; i < this.buffs.length; i++) {
      var b = this.buffs[i];
      var scopeTag = (b.scope === 'click') ? ' <span class="buff-scope">CLICK</span>' : '';
      html +=
        '<div class="buff-row">' +
          '<span class="buff-label">' + b.label + scopeTag + '</span>' +
          '<span class="buff-value">\u00d7' + b.multiplier + '</span>' +
          '<span class="buff-timer">' + Math.ceil(b.remaining) + 's</span>' +
        '</div>';
    }
    this._buffContainer.innerHTML = html;
  },

  // --- Save/Load ---
  serialise: function () {
    return {
      unlocked: this.unlocked,
      spawnTimers: { tier1: this.spawnTimers.tier1, tier2: this.spawnTimers.tier2 },
      activeEvent: this.activeEvent
        ? {
            id: this.activeEvent.id,
            timeRemaining: this.activeEvent.timeRemaining,
            duration: this.activeEvent.duration
          }
        : null,
      buffs: this.buffs.map(function (b) {
        return {
          id: b.id,
          label: b.label,
          multiplier: b.multiplier,
          remaining: b.remaining,
          scope: b.scope || 'income'
        };
      }),
      caughtCount: this.caughtCount,
      missedCount: this.missedCount
    };
  },

  restore: function (data) {
    this.unlocked = !!data.unlocked;
    if (data.spawnTimers) {
      this.spawnTimers.tier1 = data.spawnTimers.tier1 || 0;
      this.spawnTimers.tier2 = data.spawnTimers.tier2 || 0;
    }
    if (data.activeEvent && data.activeEvent.id) {
      this.activeEvent = {
        id: data.activeEvent.id,
        timeRemaining: data.activeEvent.timeRemaining || 0,
        duration: data.activeEvent.duration || 0,
        el: null  // DOM re-created in init()
      };
    }
    if (data.buffs) {
      this.buffs = data.buffs.filter(function (b) {
        return b.remaining > 0;
      }).map(function (b) {
        return {
          id: b.id,
          label: b.label,
          multiplier: b.multiplier,
          remaining: b.remaining,
          scope: b.scope || 'income'
        };
      });
    }
    this.caughtCount = data.caughtCount || 0;
    this.missedCount = data.missedCount || 0;
  }
};
