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
    },

    // ── Extended Forms thresholds ──────────────────────────────
    {
      id: 'forms-10b',
      name: 'Ten Billion Filed',
      text: 'At this volume, Forms are no longer counted. They are weighed. The scales are calibrated weekly by a man who does not speak.',
      condition: () => Game.totalFormsEarned >= 10000000000
    },
    {
      id: 'forms-100b',
      name: 'Administrative Singularity',
      text: 'One hundred billion Forms. Light bends slightly around the archive. Nobody has thought to mention this.',
      condition: () => Game.totalFormsEarned >= 100000000000
    },
    {
      id: 'forms-1t',
      name: 'The Trillionth Form',
      text: 'A trillion Forms. There is no plaque this time. The plaque department has been absorbed into the archive.',
      condition: () => Game.totalFormsEarned >= 1e12
    },
    {
      id: 'forms-1qa',
      name: 'Post-Numerical Bureaucracy',
      text: 'One quadrillion Forms. The Department has exceeded the readable range of its own inventory system. This is considered an upgrade.',
      hidden: true,
      condition: () => Game.totalFormsEarned >= 1e15
    },

    // ── The Jurisdiction unlock ────────────────────────────────
    {
      id: 'first-jurisdiction',
      name: 'Territorial Expansion',
      text: 'The Jurisdiction has been established. Its borders are described in the same document that describes its borders. This is considered legally sufficient.',
      condition: () => Departments.getOwned('jurisdiction') >= 1
    },

    // ── Mid/late-tier quantity milestones ──────────────────────
    {
      id: 'interns-50',
      name: 'A Cohort of Cohorts',
      text: 'Fifty Interns. Management has stopped learning their names. The Interns have stopped offering them.',
      condition: () => Departments.getOwned('intern') >= 50
    },
    {
      id: 'interns-100',
      name: 'Unpaid Infrastructure',
      text: 'One hundred Interns. The Department now runs primarily on enthusiasm and mild confusion. This is classed as sustainable.',
      condition: () => Departments.getOwned('intern') >= 100
    },
    {
      id: 'cabinets-25',
      name: 'The Humming Cathedral',
      text: 'Twenty-five Filing Cabinets. The resonant frequency of the room is now a recognised occupational hazard. Staff find it inspiring.',
      condition: () => Departments.getOwned('filing-cabinet') >= 25
    },
    {
      id: 'sub-committees-25',
      name: 'Procedural Procedure',
      text: 'Twenty-five Sub-Committees. They now meet exclusively to discuss each other. A working group has been formed to investigate this.',
      condition: () => Departments.getOwned('sub-committee') >= 25
    },
    {
      id: 'procedures-10',
      name: 'Standard Operating Procedure',
      text: 'Ten Procedures. Each one references the others. There is no longer a first step.',
      condition: () => Departments.getOwned('procedure') >= 10
    },
    {
      id: 'procedures-25',
      name: 'Due Process, Multiplied',
      text: 'Twenty-five Procedures. A new Procedure has been created to select which Procedure applies. It is Procedure 26.',
      condition: () => Departments.getOwned('procedure') >= 25
    },
    {
      id: 'divisions-10',
      name: 'Internal Partitions',
      text: 'Ten Divisions. Maps of the building must now be updated retroactively. The updates are filed with the Divisions.',
      condition: () => Departments.getOwned('division') >= 10
    },
    {
      id: 'divisions-25',
      name: 'Jurisdictional Fog',
      text: 'Twenty-five Divisions. It is no longer possible to say where one ends and another begins. This is considered efficient.',
      condition: () => Departments.getOwned('division') >= 25
    },
    {
      id: 'oversight-5',
      name: 'Watching the Watchers',
      text: 'Five Oversight Bodies. Each observes the others. The observations are compared, discussed, and filed unread.',
      condition: () => Departments.getOwned('oversight-body') >= 5
    },
    {
      id: 'annex-5',
      name: 'Retroactive Architecture',
      text: 'Five Annexes. The building has, in some sense, always had five Annexes. Earlier memories are being revised for consistency.',
      condition: () => Departments.getOwned('annex') >= 5
    },
    {
      id: 'mandates-3',
      name: 'Plural Imperative',
      text: 'Three Mandates. They issue slightly different instructions. The Department follows all of them, on principle.',
      condition: () => Departments.getOwned('mandate') >= 3
    },
    {
      id: 'mandates-10',
      name: 'The Unanimous Voice',
      text: 'Ten Mandates. They now speak as one. Nobody is entirely sure when that happened.',
      condition: () => Departments.getOwned('mandate') >= 10
    },

    // ── Extended Forms/sec thresholds ──────────────────────────
    {
      id: 'fps-100k',
      name: 'Industrial Bureaucracy',
      text: 'One hundred thousand Forms per second. The conveyor belt has become a cultural institution. Tours are filed in advance.',
      condition: () => Game.formsPerSec >= 100000
    },
    {
      id: 'fps-1m',
      name: 'A Million a Second',
      text: 'One million Forms per second. The concept of "per second" is beginning to feel quaint. Time is a formality.',
      condition: () => Game.formsPerSec >= 1000000
    },
    {
      id: 'fps-10m',
      name: 'Beyond Tempo',
      text: 'Ten million Forms per second. The Department now outputs paperwork at a rate the physical world struggles to accept. It accepts anyway.',
      condition: () => Game.formsPerSec >= 10000000
    },

    // ── Extended click totals ──────────────────────────────────
    {
      id: 'clicks-5k',
      name: 'Stampcraft',
      text: 'Five thousand approvals. The motion has become involuntary. You approve things while asleep. Some of them are real.',
      condition: () => Game.totalClicks >= 5000
    },
    {
      id: 'clicks-25k',
      name: 'The Union Would Object',
      text: 'Twenty-five thousand stamps. You do not have a union. The form to request one is currently being reviewed.',
      condition: () => Game.totalClicks >= 25000
    },
    {
      id: 'clicks-100k',
      name: 'Manual Override',
      text: 'One hundred thousand stamps. The rubber has worn into the shape of your hand. Or your hand into the shape of the rubber.',
      condition: () => Game.totalClicks >= 100000
    },

    // ── Extended total-dept counts ─────────────────────────────
    {
      id: 'total-depts-75',
      name: 'Organisational Plateau',
      text: 'Seventy-five departments. The Department has achieved the shape it was always going to become. It looks slightly tired.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 75;
      }
    },
    {
      id: 'total-depts-100',
      name: 'The Hundred Hands',
      text: 'One hundred departments. The org chart is now a short novel. It has a sequel.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 100;
      }
    },
    {
      id: 'total-depts-200',
      name: 'Unmanageable Completeness',
      text: 'Two hundred departments. Nobody asked for this. Nobody is stopping it either.',
      condition: () => {
        let total = 0;
        for (const t of Departments.tiers) total += t.owned;
        return total >= 200;
      }
    },

    // ── Directive milestones ───────────────────────────────────
    {
      id: 'directives-100',
      name: 'Active Policy',
      text: 'One hundred Directives. The Department has strong opinions now. It would prefer not to share them with outsiders.',
      condition: () => Game.directives >= 100
    },
    {
      id: 'directives-1k',
      name: 'A Thousand Decrees',
      text: 'One thousand Directives. Many of them contradict each other. This is not considered a problem; it is considered nuance.',
      condition: () => Game.directives >= 1000
    },
    {
      id: 'directives-converted-10k',
      name: 'Conversion Rate',
      text: 'Ten thousand Forms have been processed into pure Directive. The conversion chamber is always warm. Nobody is sure why.',
      condition: () => Game.totalDirectivesConverted >= 10000
    },

    // ── Synergy milestones ─────────────────────────────────────
    {
      id: 'first-synergy',
      name: 'First Alignment',
      text: 'A synergy has been achieved. Two departments now reinforce each other in a way that sounds impressive in meetings.',
      condition: () => Upgrades.getSynergyCount() >= 1
    },
    {
      id: 'all-standard-synergies',
      name: 'Perfect Alignment',
      text: 'All ten standard synergies acquired. The Department now hums with horrible efficiency. Coffee cups vibrate faintly.',
      condition: () => {
        const ids = ['misfiling-protocol','evidence-based-review','review-of-the-review','standing-orders','operational-continuity','jurisdictional-overlap','extended-jurisdiction','territorial-instrument','career-trajectory','permanent-record'];
        return ids.every(id => Upgrades.has(id));
      }
    },
    {
      id: 'first-deep-synergy',
      name: 'Deeper Than Expected',
      text: 'A deep synergy has been unlocked. It runs beneath the others. It may always have been there.',
      condition: () => Upgrades.has('terms-of-reference') || Upgrades.has('regulatory-capture')
    },
    {
      id: 'all-deep-synergies',
      name: 'The Lower Structure',
      text: 'Both deep synergies unlocked. There is a shape beneath the org chart. You are not supposed to see it yet.',
      condition: () => Upgrades.has('terms-of-reference') && Upgrades.has('regulatory-capture')
    },
    {
      id: 'all-synergies',
      name: 'Total Interlock',
      text: 'Every synergy, deep and shallow, has been secured. The Department no longer has parts. It has tendencies.',
      condition: () => Upgrades.getSynergyCount() >= 12
    },

    // ── Prestige / Restructuring ───────────────────────────────
    {
      id: 'first-restructuring',
      name: 'Begin Again',
      text: 'The first Restructuring is complete. Very little has changed, officially. Everything has changed, unofficially.',
      condition: () => Game.restructurings >= 1
    },
    {
      id: 'restructurings-5',
      name: 'Institutional Déjà Vu',
      text: 'Five Restructurings. Some of the filing cabinets seem familiar. They would prefer not to discuss it.',
      condition: () => Game.restructurings >= 5
    },
    {
      id: 'restructurings-10',
      name: 'The Cycle Is The Product',
      text: 'Ten Restructurings. The Department now understands that its real output is becoming itself, repeatedly.',
      condition: () => Game.restructurings >= 10
    },
    {
      id: 'restructurings-25',
      name: 'Eternal Return',
      text: 'Twenty-five Restructurings. A plaque reading "THIS IS THE LAST ONE" has been installed and reinstalled.',
      condition: () => Game.restructurings >= 25
    },
    {
      id: 'first-precedent-upgrade',
      name: 'Binding Precedent',
      text: 'A permanent precedent has been set. It will be cited in all future iterations of the Department, whether or not they agree.',
      condition: () => Game.precedentUpgrades && Object.keys(Game.precedentUpgrades).length >= 1
    },
    {
      id: 'all-precedent-upgrades',
      name: 'Unassailable Doctrine',
      text: 'Every available precedent has been established. The Department has argued with itself across time and won every round.',
      condition: () => {
        const ids = ['institutional-memory-p','continuity-of-operations','established-procedure','precedent-of-scale','the-eternal-mandate','doctrine-of-precedent','interlocking-directorates'];
        return ids.every(id => Game.precedentUpgrades && Game.precedentUpgrades[id]);
      }
    },
    {
      id: 'precedents-earned-100',
      name: 'A Century of Precedents',
      text: 'One hundred Precedents earned, lifetime. The past is now load-bearing.',
      condition: () => Game.totalPrecedentsEarned >= 100
    },

    // ── Random events ──────────────────────────────────────────
    {
      id: 'first-event-caught',
      name: 'Noticed',
      text: 'You caught something unusual crossing the office floor. Most people don\u2019t notice these. Most people are filed for re-orientation.',
      condition: () => typeof RandomEvents !== 'undefined' && RandomEvents.caughtCount >= 1
    },
    {
      id: 'events-caught-25',
      name: 'Observant',
      text: 'Twenty-five events caught. The Department is beginning to suspect you are paying attention. It is deciding how it feels about that.',
      condition: () => typeof RandomEvents !== 'undefined' && RandomEvents.caughtCount >= 25
    },
    {
      id: 'events-caught-100',
      name: 'Eye of the Needle',
      text: 'One hundred events caught. Nothing slips past you. The Department finds this slightly unnerving.',
      condition: () => typeof RandomEvents !== 'undefined' && RandomEvents.caughtCount >= 100
    },
    {
      id: 'first-event-missed',
      name: 'A Moment\u2019s Inattention',
      text: 'You missed one. It is fine. It has been filed as "fine".',
      condition: () => typeof RandomEvents !== 'undefined' && RandomEvents.missedCount >= 1
    },
    {
      id: 'events-missed-25',
      name: 'Selective Attention',
      text: 'Twenty-five events missed. They have been added to your file. Your file does not have a section for this. A new section has been created.',
      hidden: true,
      condition: () => typeof RandomEvents !== 'undefined' && RandomEvents.missedCount >= 25
    },

    // ── Rejections ─────────────────────────────────────────────
    {
      id: 'first-rejection',
      name: 'Stamped Incorrectly',
      text: 'You have misstamped a Form. The Form has been rejected. You have been gently reminded that accuracy is a virtue.',
      hidden: true,
      condition: () => Game.totalRejections >= 1
    },
    {
      id: 'rejections-100',
      name: 'Creative Placement',
      text: 'One hundred rejections. Someone is collecting the misprints. They say they\u2019re "nice to look at".',
      hidden: true,
      condition: () => Game.totalRejections >= 100
    },
    {
      id: 'rejections-1000',
      name: 'A Body of Work',
      text: 'One thousand rejected Forms. The misprint collection has been moved to a dedicated annex. It has been given a title. The title has been filed.',
      hidden: true,
      condition: () => Game.totalRejections >= 1000
    },

    // ── Time-based ─────────────────────────────────────────────
    {
      id: 'time-existed-1h',
      name: 'First Hour on the Job',
      text: 'One hour inside the Department. Time will pass differently from now on. You will not notice when.',
      condition: () => (Date.now() - Game.gameStartTime) >= 3600000
    },
    {
      id: 'time-existed-24h',
      name: 'A Day in Office',
      text: 'Twenty-four hours with the Department. It is now more familiar than your home. It files a small note about this.',
      condition: () => (Date.now() - Game.gameStartTime) >= 86400000
    },
    {
      id: 'time-existed-7d',
      name: 'Career Trajectory',
      text: 'One week. You have colleagues now. Some of them are Filing Cabinets.',
      condition: () => (Date.now() - Game.gameStartTime) >= 604800000
    },
    {
      id: 'run-time-24h',
      name: 'Endurance Filing',
      text: 'A single run of twenty-four hours without Restructuring. Impressive. Impractical. Filed.',
      condition: () => (Date.now() - Game.runStartTime) >= 86400000
    },

    // ── Peak / stacks / surge ──────────────────────────────────
    {
      id: 'peak-fps-1m',
      name: 'Recorded High',
      text: 'The Department once hit one million Forms per second. It has not done it since. It refers to it often.',
      condition: () => Game.peakFormsPerSec >= 1000000
    },
    {
      id: 'permanent-record-50',
      name: 'A Busy Run',
      text: 'Fifty milestones in a single cycle. The Permanent Record is straining. It is coping.',
      hidden: true,
      condition: () => (Game.permanentRecordStacks || 0) >= 50
    },

    // ── Completion tracks ──────────────────────────────────────
    {
      id: 'all-click-upgrades',
      name: 'Ergonomic Maximum',
      text: 'Every click upgrade purchased. Your stamp is now the finest stamp that has ever been or will ever be. It is still just a stamp.',
      condition: () => {
        const ids = ['ballpoint-pen','fresh-ink-pad','carbon-copy','the-in-tray','institutional-memory'];
        return ids.every(id => Upgrades.has(id));
      }
    },
    {
      id: 'all-dept-mults-intern',
      name: 'The Perfect Intern',
      text: 'Every Intern milestone upgrade owned. This is, technically, the best possible Intern. It still loses things.',
      condition: () => {
        const ids = ['intern-orientation','intern-mult-10','intern-mult-25','intern-mult-50','intern-mult-100'];
        return ids.every(id => Upgrades.has(id));
      }
    },
    {
      id: 'all-dept-mults-every-tier',
      name: 'Complete Ladder',
      text: 'Every milestone upgrade for every tier has been purchased. The Department is, by one particular measure, done. By every other measure, it has barely started.',
      condition: () => Upgrades.definitions.filter(u => u.category === 'dept-mult').every(u => Upgrades.has(u.id))
    },

    // ── Hidden / absurd ────────────────────────────────────────
    {
      id: 'ten-of-every-tier',
      name: 'Diversification',
      text: 'Ten of every department tier. This required, briefly, the existence of The Jurisdiction. Nobody will admit it.',
      hidden: true,
      condition: () => Departments.tiers.every(t => t.owned >= 10)
    },
    {
      id: 'speedrun-first-restructure',
      name: 'Hasty Legacy',
      text: 'Your first Restructuring arrived in under thirty minutes. Speed is admirable. Speed is also a form of admission.',
      hidden: true,
      condition: () => Game.firstRestructureMs > 0 && Game.firstRestructureMs < 1800000
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
    Ticker.push(m.text, { source: 'milestone', dedupeKey: 'ms:' + m.id });

    // Permanent Record (Filing Cabinet + Mandate synergy):
    // each milestone fired during a run grants +0.5% global Forms/sec.
    if (typeof Upgrades !== 'undefined' && Upgrades.has('permanent-record')) {
      Game.permanentRecordStacks = (Game.permanentRecordStacks || 0) + 1;
      Upgrades.applyEffects();
    }
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
