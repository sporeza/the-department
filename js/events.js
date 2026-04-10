/**
 * events.js — Random event system.
 * Spawns clickable events in the centre panel on timers.
 * Manages temporary buff effects from event rewards.
 */

const RandomEvents = {
  // --- State ---
  unlocked: false,
  activeEvent: null,   // { id, timeRemaining, el } or null
  buffs: [],           // [{ id, label, multiplier, remaining }]
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
        return el;
      },
      reward: function () {
        var bonus = Math.max(1, Game.formsPerSec * 30);
        Game.forms += bonus;
        Game.totalFormsEarned += bonus;
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
        return el;
      },
      reward: function () {
        RandomEvents.addBuff('inspector-boost', 'Inspector Approved', 3, 60);
        return '\u00d73 all output for 60s';
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

    // If restoring a saved active event, re-spawn its DOM
    if (this.activeEvent && this.activeEvent.id) {
      var def = this.getEventDef(this.activeEvent.id);
      if (def && this.activeEvent.timeRemaining > 1) {
        this.activeEvent.el = def.spawn(this._container, this.activeEvent.timeRemaining);
        this.activeEvent.el.addEventListener('click', function () {
          RandomEvents.catchEvent();
        });
      } else {
        this.activeEvent = null;
      }
    }

    // Apply any restored buffs to income
    if (this.buffs.length > 0) {
      Departments.recalcIncome();
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
    var el = def.spawn(this._container, def.duration);
    this.activeEvent = {
      id: def.id,
      timeRemaining: def.duration,
      el: el
    };
    el.addEventListener('click', function () {
      RandomEvents.catchEvent();
    });
  },

  // --- Catch (player clicked) ---
  catchEvent: function () {
    if (!this.activeEvent) return;
    var def = this.getEventDef(this.activeEvent.id);
    if (!def) return;

    this.caughtCount++;

    // Grant reward
    var rewardText = def.reward();

    // Remove DOM
    if (this.activeEvent.el && this.activeEvent.el.parentNode) {
      this.activeEvent.el.remove();
    }
    this.activeEvent = null;

    // Toast notification
    this.showEventToast(def.name, def.flavour, rewardText);

    // Ticker
    Milestones.injectTicker(def.flavour);

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
    this.activeEvent = null;

    // Ticker
    if (def && def.missText) {
      Milestones.injectTicker(def.missText);
    }
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
  addBuff: function (id, label, multiplier, duration) {
    // Replace existing buff of same id
    for (var i = this.buffs.length - 1; i >= 0; i--) {
      if (this.buffs[i].id === id) {
        this.buffs.splice(i, 1);
      }
    }
    this.buffs.push({ id: id, label: label, multiplier: multiplier, remaining: duration });
    Departments.recalcIncome();
  },

  tickBuffs: function (dt) {
    if (this.buffs.length === 0) return;
    var changed = false;
    for (var i = this.buffs.length - 1; i >= 0; i--) {
      this.buffs[i].remaining -= dt;
      if (this.buffs[i].remaining <= 0) {
        this.buffs.splice(i, 1);
        changed = true;
      }
    }
    if (changed) {
      Departments.recalcIncome();
    }
  },

  getGlobalBuffMultiplier: function () {
    var mult = 1;
    for (var i = 0; i < this.buffs.length; i++) {
      mult *= this.buffs[i].multiplier;
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
      html +=
        '<div class="buff-row">' +
          '<span class="buff-label">' + b.label + '</span>' +
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
        ? { id: this.activeEvent.id, timeRemaining: this.activeEvent.timeRemaining }
        : null,
      buffs: this.buffs.map(function (b) {
        return { id: b.id, label: b.label, multiplier: b.multiplier, remaining: b.remaining };
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
        el: null  // DOM re-created in init()
      };
    }
    if (data.buffs) {
      this.buffs = data.buffs.filter(function (b) {
        return b.remaining > 0;
      });
    }
    this.caughtCount = data.caughtCount || 0;
    this.missedCount = data.missedCount || 0;
  }
};
