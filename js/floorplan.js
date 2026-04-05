/**
 * floorplan.js — Office floor plan rendering.
 * Handles room placement, organic growth animation,
 * corridor connections, and visual-only display logic.
 *
 * Rooms are laid out in a hand-tuned organic arrangement
 * radiating outward from a central Registry room.
 * Each department tier gets a room that appears (inflates)
 * when the first unit is purchased and grows subtly with
 * additional units. Corridors grow between rooms like
 * mycelium. Liminal spaces fade in as the department expands.
 */

const FloorPlan = {
  el: null,

  // Hand-placed room positions (% from top-left of container).
  // Arranged to radiate organically from the centre Registry.
  layout: [
    // tier index, label,        left%  top%   base-w  base-h  angle(deg)
    { tier: -1, label: 'Registry',     left: 45, top: 44, w: 120, h: 80,  angle: 0 },
    { tier: 0,  label: 'Interns',      left: 26, top: 32, w: 90,  h: 60,  angle: -2 },
    { tier: 1,  label: 'Filing',       left: 64, top: 30, w: 95,  h: 62,  angle: 1.5 },
    { tier: 2,  label: 'Sub-Committee',left: 28, top: 60, w: 100, h: 64,  angle: 1 },
    { tier: 3,  label: 'Procedure',    left: 66, top: 58, w: 100, h: 64,  angle: -1.5 },
    { tier: 4,  label: 'Division',     left: 14, top: 46, w: 105, h: 68,  angle: 2 },
    { tier: 5,  label: 'Oversight',    left: 80, top: 44, w: 105, h: 68,  angle: -1 },
    { tier: 6,  label: 'Annex',        left: 46, top: 18, w: 110, h: 70,  angle: 1.8 },
    { tier: 7,  label: 'Mandate',      left: 46, top: 74, w: 115, h: 74,  angle: -0.8 },
  ],

  // Corridors connect pairs of rooms (by layout index)
  corridors: [
    [0, 1], [0, 2], [0, 3], [0, 4],  // Registry to first ring
    [1, 5], [2, 6], [3, 4],           // Cross connections
    [5, 7], [6, 7], [4, 8], [3, 8],   // Outer ring
    [1, 3], [2, 4],                    // Diagonal tissue
  ],

  // Liminal spaces — unlabelled atmospheric rooms
  liminalSpaces: [
    { left: 38, top: 28, w: 40, h: 30, angle: 4,   needTotal: 15 },
    { left: 55, top: 68, w: 35, h: 28, angle: -3,  needTotal: 30 },
    { left: 12, top: 22, w: 38, h: 26, angle: 2,   needTotal: 50 },
    { left: 85, top: 65, w: 42, h: 30, angle: -5,  needTotal: 80 },
    { left: 50, top: 50, w: 28, h: 22, angle: 6,   needTotal: 120 },
  ],

  _rooms: [],       // DOM elements for department rooms
  _corridors: [],   // DOM elements for corridors
  _liminals: [],    // DOM elements for liminal spaces
  _prevState: null,  // Stringified previous state to avoid unnecessary DOM updates

  init() {
    this.el = document.getElementById('floor-plan');
    this._buildRooms();
    this._buildCorridors();
    this._buildLiminals();
    this.update();
  },

  _buildRooms() {
    this.layout.forEach((room, i) => {
      const div = document.createElement('div');
      div.className = 'room' + (room.tier === -1 ? ' room-registry' : ' room-dept');
      div.innerHTML =
        '<div class="room-inner">' +
          '<span class="room-label">' + room.label + '</span>' +
          '<span class="room-badge">0</span>' +
        '</div>';
      this.el.appendChild(div);
      this._rooms.push(div);
    });
  },

  _buildCorridors() {
    this.corridors.forEach(pair => {
      const div = document.createElement('div');
      div.className = 'corridor';
      div.dataset.from = pair[0];
      div.dataset.to = pair[1];
      this.el.appendChild(div);
      this._corridors.push(div);
    });
  },

  _buildLiminals() {
    this.liminalSpaces.forEach(space => {
      const div = document.createElement('div');
      div.className = 'room room-liminal';
      div.style.left = space.left + '%';
      div.style.top = space.top + '%';
      div.style.width = space.w + 'px';
      div.style.height = space.h + 'px';
      div.style.transform = 'translate(-50%, -50%) rotate(' + space.angle + 'deg) scale(0)';
      div.dataset.need = space.needTotal;
      this.el.appendChild(div);
      this._liminals.push(div);
    });
  },

  /** Called each frame from the game loop */
  update() {
    // Build a snapshot to avoid unnecessary DOM work
    const snap = Departments.tiers.map(t => t.owned).join(',');
    if (snap === this._prevState) return;
    this._prevState = snap;

    const totalOwned = Departments.tiers.reduce((s, t) => s + t.owned, 0);

    // Update rooms
    this.layout.forEach((room, i) => {
      const div = this._rooms[i];
      if (room.tier === -1) {
        // Registry — always visible, badge shows total
        div.style.left = room.left + '%';
        div.style.top = room.top + '%';
        div.style.width = room.w + 'px';
        div.style.height = room.h + 'px';
        div.style.transform = 'translate(-50%, -50%) rotate(' + room.angle + 'deg)';
        div.querySelector('.room-badge').textContent = totalOwned || '✦';
        return;
      }

      const tier = Departments.tiers[room.tier];
      const owned = tier.owned;
      const visible = owned > 0;

      // Scale room slightly with ownership (1.0 → 1.3 over 100 units)
      const growth = 1 + Math.min(owned, 100) * 0.003;
      const w = room.w * growth;
      const h = room.h * growth;

      div.style.left = room.left + '%';
      div.style.top = room.top + '%';
      div.style.width = w + 'px';
      div.style.height = h + 'px';

      if (visible) {
        div.style.transform = 'translate(-50%, -50%) rotate(' + room.angle + 'deg) scale(1)';
        div.style.opacity = '1';
        div.querySelector('.room-badge').textContent = owned;
      } else {
        div.style.transform = 'translate(-50%, -50%) rotate(' + room.angle + 'deg) scale(0)';
        div.style.opacity = '0';
      }
    });

    // Update corridors — visible when both connected rooms are visible
    this._corridors.forEach(div => {
      const fromIdx = parseInt(div.dataset.from);
      const toIdx = parseInt(div.dataset.to);
      const fromRoom = this.layout[fromIdx];
      const toRoom = this.layout[toIdx];

      const fromVisible = fromRoom.tier === -1 || Departments.tiers[fromRoom.tier].owned > 0;
      const toVisible = toRoom.tier === -1 || Departments.tiers[toRoom.tier].owned > 0;

      if (fromVisible && toVisible) {
        // Position the corridor as a line between room centres
        const x1 = fromRoom.left;
        const y1 = fromRoom.top;
        const x2 = toRoom.left;
        const y2 = toRoom.top;

        // Convert % to px using container size
        const rect = this.el.getBoundingClientRect();
        const px1 = x1 / 100 * rect.width;
        const py1 = y1 / 100 * rect.height;
        const px2 = x2 / 100 * rect.width;
        const py2 = y2 / 100 * rect.height;

        const dx = px2 - px1;
        const dy = py2 - py1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        div.style.left = px1 + 'px';
        div.style.top = py1 + 'px';
        div.style.width = len + 'px';
        div.style.height = '3px';
        div.style.transform = 'rotate(' + angle + 'deg)';
        div.style.transformOrigin = '0 50%';
        div.style.opacity = '1';
      } else {
        div.style.opacity = '0';
      }
    });

    // Update liminal spaces — appear when total ownership exceeds threshold
    this._liminals.forEach(div => {
      const need = parseInt(div.dataset.need);
      if (totalOwned >= need) {
        div.style.transform = div.style.transform.replace(/scale\([^)]*\)/, 'scale(1)');
        div.style.opacity = '0.4';
      }
    });
  }
};
