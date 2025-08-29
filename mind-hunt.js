// MindAR hunt logic
(function () {
  const found = new Set();
  let total = 10;
  let config = { naturalTargets: {} };

  const $ = (s) => document.querySelector(s);

  function updateCounts() {
    $('#foundCount').textContent = String(found.size);
    $('#totalCount').textContent = String(total);
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
    }
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
      $('#hud')?.classList.add('hidden');
      $('#menu')?.classList.remove('hidden');
      $('#congrats')?.classList.add('hidden');
    });
    $('#restartBtn')?.addEventListener('click', () => {
      found.clear();
      updateCounts();
      $('#congrats')?.classList.add('hidden');
    });
  }

  window.addEventListener('load', async () => {
    await loadConfig();
    applyConfigToTargets();
    bindUI();
    // MindAR initializes automatically via component
    // Wait a bit for entities to be ready, then bind
    setTimeout(bindTargetEvents, 500);
    updateCounts();
  });
})();

