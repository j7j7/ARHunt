// MindAR hunt logic
(function () {
  const found = new Set();
  let total = 11;
  let config = { naturalTargets: {} };

  const $ = (s) => document.querySelector(s);

  // Object descriptions for each target
  const objectDescriptions = {
    0: "🎨 Abstract Art - A vibrant geometric composition",
    1: "🌊 Ocean Waves - Peaceful blue waters in motion", 
    2: "🏔️ Mountain Peak - Majestic snow-capped summit",
    3: "🌸 Cherry Blossom - Delicate pink spring flowers",
    4: "🌙 Crescent Moon - Glowing in the midnight sky",
    5: "🦋 Butterfly - Colorful wings in graceful flight",
    6: "🔥 Campfire - Warm flames dancing in the night",
    7: "🌈 Rainbow - Seven colors arcing across the sky",
    8: "🍄 Mushroom - Enchanted forest fungi",
    9: "💎 Crystal Gem - Sparkling precious stone",
    10: "⭐ Golden Star - Shining bright in the cosmos"
  };

  function updateCounts() {
    $('#foundCount').textContent = String(found.size);
    $('#totalCount').textContent = String(total);
  }

  function updateFoundText() {
    const foundTextEl = $('#foundText');
    if (!foundTextEl) return;
    
    if (found.size === 0) {
      foundTextEl.innerHTML = '';
      return;
    }

    const foundArray = Array.from(found).sort((a, b) => a - b);
    const descriptions = foundArray.map(idx => 
      `<div class="found-item">${objectDescriptions[idx] || `Object ${idx + 1}`}</div>`
    ).join('');
    
    foundTextEl.innerHTML = `<div class="found-list">${descriptions}</div>`;
  }

  function flashPlane(el) {
    const plane = el.querySelector('.overlay-plane');
    if (!plane) return;
    plane.classList.remove('found');
    void plane.offsetWidth;
    plane.classList.add('found');
  }

  function applyConfigToTargets() {
    const nt = config.naturalTargets || {};
    const keys = Object.keys(nt);
    if (keys.length > 0) total = keys.length;
    updateCounts();

    // Apply config-driven transforms and update guides for configured targets
    for (const key of keys) {
      const idx = Number(key);
      const ent = document.getElementById(`target-${idx}`);
      if (!ent) continue;
      const plane = ent.querySelector('.overlay-plane');
      if (!plane) continue;
      const c = nt[key];
      if (typeof c.width === 'number') plane.setAttribute('width', c.width);
      if (typeof c.height === 'number') plane.setAttribute('height', c.height);
      if (Array.isArray(c.position)) {
        const [x,y,z] = c.position; plane.setAttribute('position', `${x} ${y} ${z}`);
      }
      if (Array.isArray(c.rotation)) {
        const [rx,ry,rz] = c.rotation; plane.setAttribute('rotation', `${rx} ${ry} ${rz}`);
      }
      if (c.overlaySrc) plane.setAttribute('material', `src: ${c.overlaySrc}; transparent: true;`);
      updatePlacementGuideForEntity(ent);
    }

    // Also ensure unconfigured targets get a guide sized to their current overlay plane
    document.querySelectorAll('[mindar-image-target]').forEach(updatePlacementGuideForEntity);
  }

  function updatePlacementGuideForEntity(ent) {
    const plane = ent.querySelector('.overlay-plane');
    if (!plane) return;
    let guide = ent.querySelector('.placement-guide');
    if (!guide) {
      guide = document.createElement('a-plane');
      guide.classList.add('placement-guide');
      guide.setAttribute('material', 'color: #22c55e; opacity: 0.18; transparent: true; side: double; shader: flat;');
      ent.appendChild(guide);
    }
    const w = Number(plane.getAttribute('width')) || 1;
    const h = Number(plane.getAttribute('height')) || 1;
    guide.setAttribute('width', w);
    guide.setAttribute('height', h);
    const pos = plane.getAttribute('position') || {x:0,y:0,z:0};
    const rot = plane.getAttribute('rotation') || {x:0,y:0,z:0};
    // Slightly behind the overlay-plane along z to avoid z-fighting
    const z = typeof pos.z === 'number' ? pos.z - 0.001 : 0;
    guide.setAttribute('position', `${pos.x || 0} ${pos.y || 0} ${z}`);
    guide.setAttribute('rotation', `${rot.x || 0} ${rot.y || 0} ${rot.z || 0}`);
  }

  function updateAllPlacementGuides() {
    document.querySelectorAll('[mindar-image-target]').forEach(updatePlacementGuideForEntity);
  }

  async function loadConfig() {
    try {
      const res = await fetch('assets/config.json', { cache: 'no-store' });
      if (res.ok) config = await res.json();
    } catch (_) {}
    config.naturalTargets ||= {};
  }

  function bindTargetEvents() {
    const ents = document.querySelectorAll('[mindar-image-target]');
    ents.forEach((ent) => {
      ent.addEventListener('targetFound', () => {
        const id = ent.getAttribute('id');
        const idx = Number(id?.split('-')[1] || -1);
        if (!found.has(idx)) {
          found.add(idx);
          updateCounts();
          updateFoundText();
          flashPlane(ent);
          if (found.size >= total) {
            $('#congrats').classList.remove('hidden');
          }
        }
      });
    });
  }

  function bindUI() {
    $('#startBtn')?.addEventListener('click', () => {
      $('#menu')?.classList.add('hidden');
      $('#hud')?.classList.remove('hidden');
    });
    $('#quitBtn')?.addEventListener('click', () => {
      found.clear();
      updateCounts();
      updateFoundText();
      $('#hud')?.classList.add('hidden');
      $('#menu')?.classList.remove('hidden');
      $('#congrats')?.classList.add('hidden');
    });
    $('#restartBtn')?.addEventListener('click', () => {
      found.clear();
      updateCounts();
      updateFoundText();
      $('#congrats')?.classList.add('hidden');
    });
  }

  window.addEventListener('load', async () => {
    await loadConfig();
    applyConfigToTargets();
    updateAllPlacementGuides();
    bindUI();
    // MindAR initializes automatically via component
    // Wait a bit for entities to be ready, then bind
    setTimeout(bindTargetEvents, 500);
    updateCounts();
  });
})();

