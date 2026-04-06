/**
 * milestones.js — Milestone definitions, trigger conditions,
 * flavour text, and ticker integration.
 *
 * Milestones fire once when their condition is first met.
 * Each milestone pushes its flavour text into the news ticker
 * and shows a brief toast notification.
 */

const Milestones = {
  triggered: {},   // { milestoneId: true }
  _queue: [],      // recently triggered, waiting to show toast

  definitions: [
    // ── Forms earned thresholds ────────────────────────────────
    {
      id: 'forms-100',
      name: 'First Hundred',
      text: 'You have filed 100 Forms. A small sense of accomplishment washes over you. The Department notes this in your file.',
      condition: () => Game.totalFormsEarned >= 100
    },
    {
      id: 'forms-1k',
      name: 'A Thousand Papers',
      text: 'One thousand Forms processed. The cabinet drawer sticks a little now. This is considered normal.',
      condition: () => Game.totalFormsEarned >= 1000
    },
    {
      id: 'forms-10k',
      name: 'The Weight of Paper',
      text: 'Ten thousand Forms. The desk has developed a permanent bow. Facilities has been notified. Facilities has filed your notification.',
      condition: () => Game.totalFormsEarned >= 10000
    },
    {
      id: 'forms-100k',
      name: 'Administrative Mass',
      text: 'One hundred thousand Forms. The filing system has begun to exhibit gravitational pull. Small objects drift toward it.',
      condition: () => Game.totalFormsEarned >= 100000
    },
    {
      id: 'forms-1m',
      name: 'The Millionth Form',
      text: 'One million Forms. A commemorative plaque has been ordered. The order form for the plaque has been filed. The filing of the order form has been commemorated.',
      condition: () => Game.totalFormsEarned >= 1000000
    },
    {
      id: 'forms-10m',
      name: 'Paper Mountain',
      text: 'Ten million Forms. The Department now generates more paperwork than the average mid-sized nation. The average mid-sized nation is concerned.',
      condition: () => Game.totalFormsEarned >= 10000000
    },
    {
      id: 'forms-100m',
      name: 'The Archive Breathes',
      text: 'One hundred million Forms. The archive has developed its own climate. Staff report seasonal weather patterns between shelving units.',
      condition: () => Game.totalFormsEarned >= 100000000
    },
    {
      id: 'forms-1b',
      name: 'A Billion Filed',
      text: 'You have reached 1 Billion Forms. The Department does not celebrate milestones. It notes them. It files the note. It files a note about the note.',
      condition: () => Game.totalFormsEarned >= 1000000000
    },

    // ── First department purchases ─────────────────────────────
    {
      id: 'first-intern',
      name: 'New Hire',
      text: 'You have hired your first Intern. They have already lost something important.',
      condition: () => Departments.getOwned('intern') >= 1
    },
    {
      id: 'first-filing-cabinet',
      name: 'Proper Storage',
      text: 'A Filing Cabinet has been installed. It hums. Nobody questions this.',
      condition: () => Departments.getOwned('filing-cabinet') >= 1
    },
    {
      id: 'first-sub-committee',
      name: 'First Convening',
      text: 'The first Sub-Committee has convened. They will discuss whether convening was the correct decision.',
      condition: () => Departments.getOwned('sub-committee') >= 1
    },
    {
      id: 'first-procedure',
      name: 'Due Process',
      text: 'A Procedure has been established. It does not have a beginning or an end. It has always been happening.',
      condition: () => Departments.getOwned('procedure') >= 1
    },
    {
      id: 'first-division',
      name: 'Expansion',
      text: 'The Division has been opened. It has already begun requisitioning supplies that do not appear in any catalogue.',
      condition: () => Departments.getOwned('division') >= 1
    },
    {
      id: 'first-oversight',
      name: 'Quis Custodiet',
      text: 'An Oversight Body has been created to ensure The Department functions correctly. It will require its own Oversight Body shortly.',
      condition: () => Departments.getOwned('oversight-body') >= 1
    },
    {
      id: 'first-annex',
      name: 'Adjacent Growth',
      text: 'The Annex has appeared. Nobody approved the construction. The construction has retroactively approved itself.',
      condition: () => Departments.getOwned('annex') >= 1
    },
    {
      id: 'first-mandate',
      name: 'The Mandate Awakens',
      text: 'The Mandate has been acquired. It is unclear whether you acquired it or it acquired you. Legal is reviewing the distinction.',
      condition: () => Departments.getOwned('mandate') >= 1
    },

    // ── Department quantity milestones ──────────────────────────
    {
      id: 'interns-10',
      name: 'Full Cohort',
      text: 'You now employ 10 Interns. They have formed a social committee. The social committee has filed for office space.',
      condition: () => Departments.getOwned('intern') >= 10
    },
    {
      id: 'interns-25',
      name: 'The Intern Problem',
      text: '25 Interns. The building can no longer accommodate their enthusiasm. Several have begun living in the supply closet.',
      condition: () => Departments.getOwned('intern') >= 25
    },
    {
      id: 'cabinets-10',
      name: 'The Humming Choir',
      text: '10 Filing Cabinets. The humming has harmonised into something that might be music. Staff find it oddly comforting.',
      condition: () => Departments.getOwned('filing-cabinet') >= 10
    },
    {
      id: 'sub-committees-10',
      name: 'Recursive Governance',
      text: 'The Sub-Committee has convened 10 times. Progress is being made on the definition of "progress".',
      condition: () => Departments.getOwned('sub-committee') >= 10
    },

    // ── Forms per second thresholds ────────────────────────────
    {
      id: 'fps-10',
      name: 'Passive Income',
      text: 'The Department now generates 10 Forms per second without any human input. The system is beginning to sustain itself.',
      condition: () => Game.formsPerSec >= 10
    },
    {
      id: 'fps-100',
      name: 'Institutional Momentum',
      text: '100 Forms per second. The output continues overnight. The Department does not sleep. The Department does not need to.',
      condition: () => Game.formsPerSec >= 100
    },
    {
      id: 'fps-1000',
      name: 'Bureaucratic Velocity',
      text: 'One thousand Forms per second. The printer has not stopped in 72 hours. It has been reclassified as a permanent fixture.',
      condition: () => Game.formsPerSec >= 1000
    },
    {
      id: 'fps-10000',
      name: 'Terminal Velocity',
      text: 'Ten thousand Forms per second. The Department now processes paperwork faster than it can be physically created. This has not slowed production.',
      condition: () => Game.formsPerSec >= 10000
    },

    // ── Click milestones ───────────────────────────────────────
    {
      id: 'clicks-10',
      name: 'Getting Started',
      text: 'Ten stamps. The ink pad is warm. The rubber is supple. This is how it begins.',
      condition: () => Game.totalClicks >= 10
    },
    {
      id: 'clicks-100',
      name: 'The Hundredth Stamp',
      text: 'One hundred approvals. Your stamp has developed a slight wobble. This gives it character.',
      condition: () => Game.totalClicks >= 100
    },
    {
      id: 'clicks-500',
      name: 'Repetitive Strain',
      text: 'Five hundred stamps. Your wrist aches. The Department thanks you for your dedication and reminds you that breaks are not billable.',
      condition: () => Game.totalClicks >= 500
    },
    {
      id: 'clicks-1000',
      name: 'The Thousand',
      text: 'One thousand stamps approved. The stamp now moves of its own accord. You merely guide it.',
      condition: () => Game.totalClicks >= 1000
    },

    // ── Total departments ──────────────────────────────────────
    {
      id: 'total-depts-10',
      name: 'Growing Organism',
      text: 'The Department now has 10 organisational units. The building groans under the weight of process.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 10;
      }
    },
    {
      id: 'total-depts-25',
      name: 'Institutional Sprawl',
      text: '25 departments and counting. The floor plan no longer fits on one page. The second page has been filed.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 25;
      }
    },
    {
      id: 'total-depts-50',
      name: 'Critical Mass',
      text: '50 departments. The Department has achieved critical mass. It can no longer be stopped, only administered.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 50;
      }
    },

    // ── Special / Directives ───────────────────────────────────
    {
      id: 'first-directive',
      name: 'Institutional Will',
      text: 'Your first Directive has been issued. The Department has decided what it wants to become. Nobody else was consulted.',
      condition: () => Game.directives >= 1 || Object.keys(Upgrades.purchased).some(
        id => { const u = Upgrades.get(id); return u && u.currency === 'directives'; }
      )
    },
    {
      id: 'directives-10',
      name: 'Policy Agenda',
      text: '10 Directives accumulated. The Department now has a policy agenda. The agenda has an agenda.',
      condition: () => Game.directives >= 10
    }
  ],

  /** Check all milestones, trigger any newly met ones */
  check() {
    for (const m of this.definitions) {
      if (this.triggered[m.id]) continue;
      if (m.condition()) {
        this.trigger(m);
      }
    }
  },

  /** Fire a milestone */
  trigger(m) {
    this.triggered[m.id] = true;
    this._queue.push(m);
    Milestones.injectTicker(m.text);
  },

  /** Process queued toast notifications (called from game loop) */
  processQueue() {
    if (this._queue.length === 0) return;
    // Only show one toast at a time
    if (document.querySelector('.milestone-toast')) return;
    const m = this._queue.shift();
    this.showToast(m);
  },

  /** Show a toast notification for a milestone */
  showToast(m) {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML =
      '<div class="milestone-toast-title">MILESTONE</div>' +
      '<div class="milestone-toast-name">' + m.name + '</div>' +
      '<div class="milestone-toast-text">' + m.text + '</div>';
    document.body.appendChild(toast);

    // Force reflow then add visible class for animation
    void toast.offsetWidth;
    toast.classList.add('milestone-toast-visible');

    setTimeout(() => {
      toast.classList.remove('milestone-toast-visible');
      toast.classList.add('milestone-toast-exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
  },

  /** Inject milestone text into the news ticker */
  injectTicker(text) {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    // Add separator + milestone item before the end
    const sep = document.createElement('span');
    sep.className = 'ticker-sep';
    sep.textContent = '\u25C6'; // ◆

    const item = document.createElement('span');
    item.className = 'ticker-item ticker-milestone';
    item.textContent = text;

    track.appendChild(sep);
    track.appendChild(item);
  },

  /** Get list of triggered milestone ids (for save) */
  getTriggered() {
    return Object.keys(this.triggered);
  },

  /** Restore triggered milestones from save (without re-firing toasts/ticker) */
  restore(ids) {
    this.triggered = {};
    if (ids) {
      ids.forEach(id => { this.triggered[id] = true; });
    }
  }
};
