/**
 * ticker.js — Central news ticker module.
 * Owns a capped, deduplicated queue and a periodic dynamic-line generator
 * driven by game state. All ticker pushes (milestones, events, restructuring,
 * dynamic flavour) route through Ticker.push(), which dedupes by key and caps
 * the queue at MAX_ITEMS.
 */

const Ticker = {
  MAX_ITEMS: 28,
  DYNAMIC_MIN_INTERVAL: 35, // seconds
  DYNAMIC_MAX_INTERVAL: 75,

  _queue: [],          // [{ text, source, dedupeKey, pinned, ts }]
  _dynamicTimer: 0,
  _nextDynamicIn: 50,

  // Canonical seed lines (formerly hardcoded in index.html)
  SEED_LINES: [
    'Local department surpasses GDP of several nations; declines to comment',
    'Sub-Committee formed to investigate previous Sub-Committee; new Sub-Committee to be investigated by further Sub-Committee',
    'Intern missing since Tuesday; colleagues assume they found the filing room on sublevel 4 and are unable to leave',
    'The Mandate has amended itself again; legal scholars describe the new version as "yes"',
    'Scientists confirm: bureaucracy is the universe\u2019s most stable structure, expected to outlast stars',
    'Department of Redundancy Department now largest department in The Department'
  ],

  // ====================================================================
  //  PUBLIC API
  // ====================================================================

  /**
   * Push a ticker entry. Dedupes by key; silently drops duplicates.
   * Evicts the oldest non-pinned item when the queue is full.
   */
  push(text, opts) {
    opts = opts || {};
    const source = opts.source || 'misc';
    const dedupeKey = opts.dedupeKey || text;
    const pinned = !!opts.pinned;

    // Dedupe — this is the event-duplication bug fix.
    for (let i = 0; i < this._queue.length; i++) {
      if (this._queue[i].dedupeKey === dedupeKey) return;
    }

    // Evict oldest non-pinned if full
    if (this._queue.length >= this.MAX_ITEMS) {
      let evictIdx = -1;
      for (let i = 0; i < this._queue.length; i++) {
        if (!this._queue[i].pinned) { evictIdx = i; break; }
      }
      if (evictIdx === -1) evictIdx = 0;
      this._queue.splice(evictIdx, 1);
    }

    this._queue.push({
      text: text,
      source: source,
      dedupeKey: dedupeKey,
      pinned: pinned,
      ts: Date.now()
    });
    this.rebuildDOM();
  },

  /** Called every frame from gameLoop. Accumulates dt and fires dynamic lines. */
  tick(dt) {
    this._dynamicTimer += dt;
    if (this._dynamicTimer >= this._nextDynamicIn) {
      this._dynamicTimer = 0;
      this._nextDynamicIn = this.rollNextDynamicInterval();
      this.fireDynamicLine();
    }
  },

  rollNextDynamicInterval() {
    return this.DYNAMIC_MIN_INTERVAL + Math.random() * (this.DYNAMIC_MAX_INTERVAL - this.DYNAMIC_MIN_INTERVAL);
  },

  /**
   * Rewrites #ticker-track innerHTML from the current queue. Preserves
   * inline animationDuration on the track (set by applyTickerSpeed).
   */
  rebuildDOM() {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    const parts = [];
    for (const entry of this._queue) {
      const cls = 'ticker-item ticker-' + entry.source;
      parts.push('<span class="' + cls + '">' + this._escapeHtml(entry.text) + '</span>');
      parts.push('<span class="ticker-sep">\u25C6</span>');
    }
    track.innerHTML = parts.join('');
    // Reset reduced-motion cycle index since item list changed
    if (typeof UI !== 'undefined' && UI.resetTickerCycleIndex) UI.resetTickerCycleIndex();
  },

  _escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  },

  // ====================================================================
  //  DYNAMIC LINE GENERATOR
  // ====================================================================

  fireDynamicLine() {
    const eligible = [];
    for (const def of this.dynamicLines) {
      try {
        if (this._checkCondition(def)) eligible.push(def);
      } catch (e) { /* swallow — never let a condition error kill the loop */ }
    }
    if (eligible.length === 0) return;

    // Drop any whose dedupeKey is already in the queue
    const fresh = [];
    for (const d of eligible) {
      const key = 'dyn:' + d.id;
      let already = false;
      for (let i = 0; i < this._queue.length; i++) {
        if (this._queue[i].dedupeKey === key) { already = true; break; }
      }
      if (!already) fresh.push(d);
    }
    const pool = fresh.length > 0 ? fresh : eligible;

    // Weighted random pick
    let totalW = 0;
    for (const d of pool) totalW += (d.weight || 1);
    let r = Math.random() * totalW;
    let pick = pool[0];
    for (const d of pool) {
      r -= (d.weight || 1);
      if (r <= 0) { pick = d; break; }
    }

    const text = this.resolveTokens(pick.text);
    this.push(text, { source: 'dynamic', dedupeKey: 'dyn:' + pick.id });
  },

  _checkCondition(def) {
    if (typeof def.condition === 'function') return def.condition();
    return this._currentTier() >= (def.tierMin || 0);
  },

  _currentTier() {
    if (Game.restructurings >= 5 || Game.precedents >= 25) return 7;
    if (Game.restructurings >= 1) return 6;
    if (Game.formsPerSec >= 10000 || Departments.getOwned('mandate') >= 1) return 5;
    if (Departments.getOwned('division') >= 1 || Departments.getOwned('oversight-body') >= 1) return 4;
    if (Departments.getOwned('sub-committee') >= 1 || Upgrades.directivesUnlocked) return 3;
    if (Departments.getOwned('filing-cabinet') >= 1) return 2;
    if (Departments.getOwned('intern') >= 1) return 1;
    return 0;
  },

  // ====================================================================
  //  TOKEN RESOLVER
  // ====================================================================

  resolveTokens(template) {
    const self = this;
    return template.replace(/\{(\w+)(?::([\w-]+))?\}/g, function (_, kind, arg) {
      switch (kind) {
        case 'stat': return self._resolveStat(arg);
        case 'owned': {
          const t = Departments.tiers.find(x => x.id === arg);
          return t ? formatNumber(t.owned) : '0';
        }
        case 'deptName': {
          const t = Departments.tiers.find(x => x.id === arg);
          return t ? Departments.getDisplayName(t) : '';
        }
        case 'deptNameLower': {
          const t = Departments.tiers.find(x => x.id === arg);
          if (!t) return '';
          const n = Departments.getDisplayName(t);
          return n.replace(/^The\s+/i, '').toLowerCase();
        }
        case 'gameName': return Game.deptName || 'The Department';
        default: return '';
      }
    });
  },

  _resolveStat(name) {
    switch (name) {
      case 'forms': return formatNumber(Game.forms);
      case 'formsPerSec': return formatNumber(Game.formsPerSec);
      case 'formsPerClick': return formatNumber(Game.formsPerClick);
      case 'totalFormsEarned': return formatNumber(Game.totalFormsEarned);
      case 'runFormsEarned': return formatNumber(Game.runFormsEarned);
      case 'totalClicks': return formatNumber(Game.totalClicks);
      case 'totalRejections': return formatNumber(Game.totalRejections);
      case 'directives': return formatNumber(Game.directives);
      case 'totalDirectivesConverted': return formatNumber(Game.totalDirectivesConverted);
      case 'precedents': return formatNumber(Game.precedents);
      case 'totalPrecedentsEarned': return formatNumber(Game.totalPrecedentsEarned);
      case 'restructurings': return formatNumber(Game.restructurings);
      case 'peakFormsPerSec': return formatNumber(Game.peakFormsPerSec);
      case 'caughtEvents': return formatNumber((typeof RandomEvents !== 'undefined') ? RandomEvents.caughtCount : 0);
      case 'missedEvents': return formatNumber((typeof RandomEvents !== 'undefined') ? RandomEvents.missedCount : 0);
      case 'totalDepts': {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return formatNumber(total);
      }
      case 'runDuration': return formatDuration(Date.now() - (Game.runStartTime || Date.now()));
      case 'gameDuration': return formatDuration(Date.now() - (Game.gameStartTime || Date.now()));
      default: return '';
    }
  },

  // ====================================================================
  //  PERSISTENCE
  // ====================================================================

  serialise() {
    return {
      queue: this._queue.map(function (e) {
        return {
          text: e.text,
          source: e.source,
          dedupeKey: e.dedupeKey,
          pinned: e.pinned,
          ts: e.ts
        };
      }),
      nextDynamicIn: this._nextDynamicIn,
      dynamicTimer: this._dynamicTimer
    };
  },

  restore(data) {
    if (!data || !data.queue) {
      this.seedInitialQueue();
      return;
    }
    this._queue = [];
    const items = data.queue.slice(-this.MAX_ITEMS);
    for (const it of items) {
      this._queue.push({
        text: it.text,
        source: it.source || 'misc',
        dedupeKey: it.dedupeKey || it.text,
        pinned: !!it.pinned,
        ts: it.ts || Date.now()
      });
    }
    this._nextDynamicIn = data.nextDynamicIn || this.rollNextDynamicInterval();
    this._dynamicTimer = data.dynamicTimer || 0;
    this.rebuildDOM();
  },

  seedInitialQueue() {
    this._queue = [];
    for (let i = 0; i < this.SEED_LINES.length; i++) {
      this._queue.push({
        text: this.SEED_LINES[i],
        source: 'seed',
        dedupeKey: 'seed:' + i,
        pinned: false,
        ts: Date.now()
      });
    }
    this._nextDynamicIn = this.rollNextDynamicInterval();
    this._dynamicTimer = 0;
    this.rebuildDOM();
  }
};

// ======================================================================
//  DYNAMIC LINE DEFINITIONS
//  Structure: { id, text, tierMin, condition?, weight? }
//  Default condition = _currentTier() >= tierMin.
// ======================================================================

Ticker.dynamicLines = [
  // ── Tier 0 — Just started ────────────────────────────────────────────
  { id: 't0-quiet-room', tierMin: 0, text: 'The room is quiet. A single form sits on the desk. You know what to do.' },
  { id: 't0-stamp-warm', tierMin: 0, text: 'The stamp is warm to the touch. It has been waiting for you.' },
  { id: 't0-ink-pad', tierMin: 0, text: 'The ink pad is fresh. The forms are plentiful. Morale is tentative.' },
  { id: 't0-supervisor', tierMin: 0, text: 'Somewhere, a supervisor is watching. Probably. It doesn\u2019t matter.' },
  { id: 't0-clock', tierMin: 0, text: 'The clock on the wall has no numbers. Nobody has mentioned this.' },
  { id: 't0-manual', tierMin: 0, text: 'A training manual has been left on your desk. Chapter one is titled \u201CChapter One\u201D.' },
  { id: 't0-coffee', tierMin: 0, text: 'A cup of coffee has appeared. It is not yours, but you are welcome to it.' },
  { id: 't0-sign', tierMin: 0, text: 'A laminated sign above the desk reads: KEEP STAMPING. It has always been there.' },

  // ── Tier 1 — First Intern ────────────────────────────────────────────
  { id: 't1-intern-enthusiasm', tierMin: 1, text: 'The {deptNameLower:intern} count has reached {owned:intern}. Enthusiasm remains, on average, undiminished.' },
  { id: 't1-intern-sandwich', tierMin: 1, text: 'An intern has brought in a tray of sandwiches. Nobody ordered sandwiches. The sandwiches will be eaten.' },
  { id: 't1-intern-coffee', tierMin: 1, text: 'The intern has mastered the coffee machine. This is their greatest professional achievement to date.' },
  { id: 't1-intern-name-tag', tierMin: 1, text: 'An intern has been issued a name tag. The tag reads: INTERN. They seem fine with this.' },
  { id: 't1-stamp-rhythm', tierMin: 1, text: '{stat:totalClicks} stamps applied. A rhythm has developed. The rhythm is the work.' },
  { id: 't1-filing-basics', tierMin: 1, text: 'A leaflet titled \u201CFiling: The Basics\u201D has been distributed. It is 240 pages long.' },
  { id: 't1-intern-lost', tierMin: 1, text: 'An intern asked where the bathroom is. A map has been prepared. The map is also being prepared.' },
  { id: 't1-desk-plant', tierMin: 1, text: 'Someone has brought in a desk plant. It appears to be thriving. Nobody is watering it.' },
  { id: 't1-lunch-break', tierMin: 1, text: 'Lunch break has been scheduled. Lunch break has been postponed. Lunch break has been retroactively approved.' },
  { id: 't1-new-starter', tierMin: 1, text: 'A new starter pack has been issued: one pen, one stapler, one existential question.' },
  { id: 't1-intern-5', tierMin: 1, text: 'You now have {owned:intern} interns. Between them, they have broken one stapler and formed a book club.',
    condition: () => Ticker._currentTier() >= 1 && Departments.getOwned('intern') >= 5 },
  { id: 't1-intern-volume', tierMin: 1, text: 'Forms entering the system: {stat:formsPerSec} per second. Forms leaving the system: also {stat:formsPerSec}, through means unspecified.' },

  // ── Tier 2 — First Filing Cabinet (events unlocked) ──────────────────
  { id: 't2-cabinet-hum', tierMin: 2, text: 'The {deptNameLower:filing-cabinet} continues to hum. All {owned:filing-cabinet} of them. In a key nobody has identified.' },
  { id: 't2-drawer-stuck', tierMin: 2, text: 'A drawer in Cabinet 3 has stuck. A memo has been drafted. The memo has been filed in Cabinet 3.' },
  { id: 't2-cabinet-light', tierMin: 2, text: 'A light inside one of the filing cabinets has turned on. There is no bulb in that cabinet. There never was.' },
  { id: 't2-event-unlock', tierMin: 2, text: 'Personnel have been instructed to keep an eye out for stray paperwork. Interception is encouraged.' },
  { id: 't2-file-cat', tierMin: 2, text: 'A stray cat has been filed. It is content with this arrangement. It has been given a reference number.' },
  { id: 't2-cabinet-weight', tierMin: 2, text: 'Facilities has expressed concern about floor loading. Facilities has filed its concern. The floor has filed its concern.' },
  { id: 't2-cabinet-choir', tierMin: 2, text: 'The {owned:filing-cabinet} filing cabinets have begun humming in close harmony. Someone is transcribing it.',
    condition: () => Ticker._currentTier() >= 2 && Departments.getOwned('filing-cabinet') >= 10 },
  { id: 't2-carbon-copy', tierMin: 2, text: 'Every form now has a shadow. Every shadow has begun making its own decisions.' },
  { id: 't2-first-event', tierMin: 2, text: '{stat:caughtEvents} stray documents intercepted so far. The system is grateful. The system never says so.',
    condition: () => Ticker._currentTier() >= 2 && (typeof RandomEvents !== 'undefined') && RandomEvents.caughtCount >= 1 },
  { id: 't2-missed-event', tierMin: 2, text: '{stat:missedEvents} documents have slipped through unattended. They are living their own lives now.',
    condition: () => Ticker._currentTier() >= 2 && (typeof RandomEvents !== 'undefined') && RandomEvents.missedCount >= 3 },
  { id: 't2-overnight', tierMin: 2, text: 'The lights were left on overnight. The work continued regardless. Nobody clocked it.' },
  { id: 't2-forms-10k', tierMin: 2, text: 'Lifetime Forms filed: {stat:totalFormsEarned}. The number is noted. The noting is also noted.' },
  { id: 't2-procedure-coming', tierMin: 2, text: 'A document titled \u201CHow We Do Things\u201D has been drafted. It is 40 pages and covers the first step.' },

  // ── Tier 3 — Sub-Committee / Directives unlocked ─────────────────────
  { id: 't3-subcom-convening', tierMin: 3, text: 'The {deptName:sub-committee} has convened {owned:sub-committee} times today. Subject: unclear. Minutes: inconclusive. Outcome: scheduled.' },
  { id: 't3-subcom-agenda', tierMin: 3, text: 'The Sub-Committee has published its agenda. The agenda has been flagged for review. The review has been added to the agenda.' },
  { id: 't3-directive-issued', tierMin: 3, text: '{stat:directives} Directives on file. Each one suggests the next one. None disagree.' },
  { id: 't3-directive-conversion', tierMin: 3, text: '{stat:totalDirectivesConverted} Directives converted since inception. Institutional will is now a going concern.',
    condition: () => Ticker._currentTier() >= 3 && Game.totalDirectivesConverted >= 5 },
  { id: 't3-second-subcom', tierMin: 3, text: 'A second Sub-Committee has been convened to discuss the output of the first Sub-Committee. They are meeting in the same room.' },
  { id: 't3-minutes', tierMin: 3, text: 'The minutes from last Tuesday\u2019s meeting have been circulated. Last Tuesday has not yet occurred.' },
  { id: 't3-procedure-read', tierMin: 3, text: 'Someone has attempted to read The Procedure in full. They are on day four. They have not been heard from since day two.' },
  { id: 't3-chairperson', tierMin: 3, text: 'A chairperson has been elected. Nobody can recall the election. Nobody is disputing the result.' },
  { id: 't3-vote', tierMin: 3, text: 'A motion has passed 7-0 with 3 abstentions and 4 absences. There are 5 members in total.' },
  { id: 't3-rejections', tierMin: 3, text: '{stat:totalRejections} rejected stamps recorded. The voids are accumulating. The voids are developing opinions.',
    condition: () => Ticker._currentTier() >= 3 && Game.totalRejections >= 25 },
  { id: 't3-policy-draft', tierMin: 3, text: 'A draft policy has been drafted to standardise the drafting of policies. It is itself non-standard.' },
  { id: 't3-fps-referenced', tierMin: 3, text: '{stat:formsPerSec} Forms are now processed per second. None of them are urgent. All of them are urgent.' },
  { id: 't3-committee-name', tierMin: 3, text: 'The {deptNameLower:sub-committee} has requested a dedicated letterhead. The request has been escalated to The Sub-Committee.' },
  { id: 't3-procedure-owners', tierMin: 3, text: '{owned:procedure} Procedures in effect. None of them reference each other. All of them reference a document called \u201CAppendix A\u201D.',
    condition: () => Ticker._currentTier() >= 3 && Departments.getOwned('procedure') >= 1 },

  // ── Tier 4 — Mid-game (Division or Oversight Body) ───────────────────
  { id: 't4-division-opinions', tierMin: 4, text: 'The {deptName:division} has issued {owned:division} internal opinions this quarter. Nobody asked. Nobody objected.' },
  { id: 't4-division-breakroom', tierMin: 4, text: 'The Division\u2019s break room has a break room. The inner break room is considered more prestigious.' },
  { id: 't4-oversight-self', tierMin: 4, text: 'The Oversight Body has produced a report on the Oversight Body. It is flattering. It is self-aware. It has been filed.',
    condition: () => Ticker._currentTier() >= 4 && Departments.getOwned('oversight-body') >= 1 },
  { id: 't4-oversight-report', tierMin: 4, text: 'A report has been issued confirming the existence of the Oversight Body. The Oversight Body commissioned the report.' },
  { id: 't4-procedure-breed', tierMin: 4, text: '{owned:procedure} Procedures in force. Several appear to have produced subsidiary Procedures without authorisation.',
    condition: () => Ticker._currentTier() >= 4 && Departments.getOwned('procedure') >= 10 },
  { id: 't4-division-complaint', tierMin: 4, text: 'The Division has filed a complaint about the Sub-Committee. The Sub-Committee is preparing a sub-committee to consider whether to consider it.' },
  { id: 't4-reject-rate-high', tierMin: 4, text: 'Rejection count: {stat:totalRejections}. Stamp quality control has issued a strongly-worded note to itself.',
    condition: () => Ticker._currentTier() >= 4 && Game.totalRejections / Math.max(1, Game.totalClicks) > 0.1 },
  { id: 't4-fps-thousand', tierMin: 4, text: '{stat:formsPerSec} Forms per second. The printer has been running for so long it is now classified as a load-bearing appliance.' },
  { id: 't4-precedent-hint', tierMin: 4, text: 'Somebody has said the word \u201Crestructuring\u201D out loud. It was not clear who. Everyone looked up.' },
  { id: 't4-peak-fps', tierMin: 4, text: 'Peak output on record: {stat:peakFormsPerSec} Forms per second. The record is itself a form.' },
  { id: 't4-runtime', tierMin: 4, text: 'This run has lasted {stat:runDuration}. The Department does not track time. You have, though.' },
  { id: 't4-internal-mail', tierMin: 4, text: 'Internal mail has developed its own internal mail. The couriers report excellent morale and no memory of being hired.' },
  { id: 't4-sandwich-budget', tierMin: 4, text: 'The sandwich budget has been approved. The sandwich budget has been revised. The sandwich budget is now a department.' },
  { id: 't4-total-owned', tierMin: 4, text: '{stat:totalDepts} organisational units active. The building groans politely.',
    condition: () => {
      if (Ticker._currentTier() < 4) return false;
      let total = 0;
      for (const t of Departments.tiers) total += t.owned;
      return total >= 25;
    } },
  { id: 't4-division-name', tierMin: 4, text: 'The {deptNameLower:division} has begun signing memos in the plural.' },

  // ── Tier 5 — Late-game (Mandate or Forms/sec \u226510k) ───────────────
  { id: 't5-mandate-awake', tierMin: 5, text: 'The Mandate has produced a document. Nobody requested it. Nobody is reading it. It is legally binding.' },
  { id: 't5-annex-passports', tierMin: 5, text: 'The Annex has begun issuing internal passports. Several have been used to enter the Annex from inside the Annex.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('annex') >= 1 },
  { id: 't5-annex-postcode', tierMin: 5, text: 'The Annex now has its own postcode. Mail addressed to The Department is being forwarded to the Annex and back, for processing.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('annex') >= 5 },
  { id: 't5-fps-10k', tierMin: 5, text: '{stat:formsPerSec} Forms per second. Paper is no longer a constraint. Paper has been reclassified as a concept.' },
  { id: 't5-oversight-hierarchy', tierMin: 5, text: '{owned:oversight-body} Oversight Bodies. An unofficial hierarchy has emerged. Nobody drew it. It is enforced regardless.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('oversight-body') >= 10 },
  { id: 't5-mandate-law', tierMin: 5, text: 'The Mandate has amended itself. Legal scholars describe the new version as, quote, \u201Cyes\u201D.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('mandate') >= 1 },
  { id: 't5-annex-breakaway', tierMin: 5, text: 'The Annex has requested independence. The request has been filed. It is the {stat:missedEvents}th item in the queue.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('annex') >= 10 },
  { id: 't5-directive-stockpile', tierMin: 5, text: 'Directives on hand: {stat:directives}. The Department now has more opinions than capacity to hold them.' },
  { id: 't5-long-run', tierMin: 5, text: 'This run has lasted {stat:runDuration}. No fires. No losses. No complaints that have been acknowledged.' },
  { id: 't5-building-breathing', tierMin: 5, text: 'The building has begun breathing on a regular cycle. Facilities has been notified. Facilities considers it a feature.' },
  { id: 't5-sandwich-dept', tierMin: 5, text: 'The Sandwich Budget Department has been quietly reclassified as a core function. Nobody is complaining.' },
  { id: 't5-mandate-name', tierMin: 5, text: 'The {deptNameLower:mandate} has drafted its own definition. The definition is now law. The law is now a draft.' },
  { id: 't5-intern-division', tierMin: 5, text: 'More than {owned:intern} interns now report to {owned:division} Divisions. The reporting lines form a closed loop.',
    condition: () => Ticker._currentTier() >= 5 && Departments.getOwned('intern') >= 50 && Departments.getOwned('division') >= 3 },
  { id: 't5-gdp', tierMin: 5, text: 'A national statistics office has requested data. The request has been filed. The office has been filed.' },

  // ── Tier 6 — Post-Restructuring ──────────────────────────────────────
  { id: 't6-restructured-same-room', tierMin: 6, text: 'The building is empty. The forms are waiting. It is exactly as it was. The restructuring was a success.' },
  { id: 't6-old-staff', tierMin: 6, text: 'Several former employees have returned under new titles. They do not recall being hired previously. Their badges are fresh.' },
  { id: 't6-precedent-held', tierMin: 6, text: '{stat:precedents} Precedents in effect. Each one adds a little to the total. The total is always larger than the sum of its parts.' },
  { id: 't6-old-memos', tierMin: 6, text: 'Old memos have resurfaced. They are being treated as new. They are being signed for the second time.' },
  { id: 't6-runtime-short', tierMin: 6, text: 'The second run has begun. The stamp feels familiar. The ink pad remembers you.' },
  { id: 't6-restructurings', tierMin: 6, text: 'Restructurings on record: {stat:restructurings}. Each one has been described as \u201Cthe last\u201D. None of them were.' },
  { id: 't6-institutional-memory', tierMin: 6, text: 'The building itself remembers how to file. The staff are a formality. They are welcome to stay.' },
  { id: 't6-same-clerk', tierMin: 6, text: '{gameName} has started over. {gameName} has not started over. Both statements are on file.' },
  { id: 't6-quiet-return', tierMin: 6, text: 'The first form of the new era has been filed. It is identical to the last form of the previous era. It has been given a new reference number.' },
  { id: 't6-intern-return', tierMin: 6, text: 'The interns have returned. They do not recall leaving. Their coffee is already made.' },
  { id: 't6-reorganisation-quote', tierMin: 6, text: 'A quote from the restructuring circular has been misattributed. The misattribution has been retroactively corrected. The quote is now authorless.' },

  // ── Tier 7 — Deep prestige ───────────────────────────────────────────
  { id: 't7-eternal', tierMin: 7, text: 'The Department is older than several governments now. It outlasted them without preparing for it.' },
  { id: 't7-precedent-inertia', tierMin: 7, text: '{stat:precedents} Precedents. The early game takes forty seconds. The work takes forever.' },
  { id: 't7-jurisdiction', tierMin: 7, text: 'The Jurisdiction has asserted itself over matters not previously considered matters.',
    condition: () => Ticker._currentTier() >= 7 && Departments.getOwned('jurisdiction') >= 1 },
  { id: 't7-game-age', tierMin: 7, text: 'The Department has existed for {stat:gameDuration}. The existence is a matter of public record. The public has been filed.' },
  { id: 't7-time-itself', tierMin: 7, text: 'A committee has been convened to discuss time itself. Time has filed a grievance. The grievance will be addressed in due course.' },
  { id: 't7-forms-all-time', tierMin: 7, text: 'Lifetime Forms: {stat:totalFormsEarned}. The count is now longer than the average employee contract.' },
  { id: 't7-self-reference', tierMin: 7, text: 'A document has been drafted referring to itself as the standard. It is now the standard. No other standard remains.' },
  { id: 't7-outlasted', tierMin: 7, text: 'Scientists have confirmed: bureaucracy is the universe\u2019s most stable structure. They have filed the confirmation. The filing is also stable.' },
  { id: 't7-prestige-name', tierMin: 7, text: 'The entity known as {gameName} has been reclassified as a natural phenomenon. No further intervention is planned.' },
  { id: 't7-mandate-eternal', tierMin: 7, text: '\u201CIt was always thus.\u201D The phrase has appeared on every document for reasons nobody has felt moved to investigate.',
    condition: () => Ticker._currentTier() >= 7 && !!(Game.precedentUpgrades && Game.precedentUpgrades['the-eternal-mandate']) },
  { id: 't7-absurd-depts', tierMin: 7, text: '{stat:totalDepts} organisational units across all wings, annexes, and conceptual spaces. Several are imaginary. Several are load-bearing.' },
  { id: 't7-forms-per-star', tierMin: 7, text: 'Recent projections suggest The Department will outlive the current astronomical epoch. Projections have been filed under \u201Coptimistic\u201D.' },
  { id: 't7-no-end', tierMin: 7, text: 'There is no end state. There is no success condition. There is only the next form. You know this. You continue.' }
];
