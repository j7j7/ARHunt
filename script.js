// ARHunt script scaffold
(function () {
  const found = new Set();
  const total = 10;
  let config = {};

  function $(sel) { return document.querySelector(sel); }

  function updateHUD() {
    const el = $('#foundCount');
    if (el) el.textContent = String(found.size);
  }

  function flashPlane(marker) {
    const plane = marker.querySelector('.overlay-plane');
    if (!plane) return;
    plane.classList.remove('found');
    // force reflow to restart animation
    void plane.offsetWidth;
    plane.classList.add('found');
  }

  function showCongrats() {
    // Generate code: YYYYMMDDHHMISS + random 8 digits
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    const code = timestamp + random8;

    const msg = `Congratulations! You have completed the hunt! Please Screen Capture this code: ${code} for reference`;
    const msgElem = document.getElementById('congratsMsg');
    if (msgElem) msgElem.textContent = msg;
    $('#congrats')?.classList.remove('hidden');
  }

  function hideCongrats() {
    $('#congrats')?.classList.add('hidden');
  }

  function applyConfigToMarker(marker) {
    const id = marker.getAttribute('id');
    const plane = marker.querySelector('.overlay-plane');
    if (!plane) return;
    const c = config[id] || null;
    // Apply config if present
    if (c) {
      // size
      if (typeof c.width === 'number') plane.setAttribute('width', c.width);
      if (typeof c.height === 'number') plane.setAttribute('height', c.height);
      // position
      if (Array.isArray(c.position)) {
        const [x, y, z] = c.position;
        plane.setAttribute('position', `${x} ${y} ${z}`);
      }
      // rotation
      if (Array.isArray(c.rotation)) {
        const [rx, ry, rz] = c.rotation;
        plane.setAttribute('rotation', `${rx} ${ry} ${rz}`);
      }
      // overlaySrc (URL or asset selector like #triangleTex)
      if (c.overlaySrc) {
        // Use URL for flexibility; for asset id, ensure it starts with '#'
        plane.setAttribute('material', `src: url(${c.overlaySrc}); transparent: true; side: double;`);
      }
    }
    // Always update or create the placement guide to mirror the overlay plane
    updatePlacementGuide(marker);
  }

  function updatePlacementGuide(marker) {
    const plane = marker.querySelector('.overlay-plane');
    if (!plane) return;
    let guide = marker.querySelector('.placement-guide');
    if (!guide) {
      guide = document.createElement('a-plane');
      guide.classList.add('placement-guide');
      guide.setAttribute('material', 'color: #22c55e; opacity: 0.18; transparent: true; side: double; shader: flat;');
      marker.appendChild(guide);
    }
    const w = Number(plane.getAttribute('width')) || 1;
    const h = Number(plane.getAttribute('height')) || 1;
    guide.setAttribute('width', w);
    guide.setAttribute('height', h);
    const pos = plane.getAttribute('position') || {x:0,y:0,z:0};
    const rot = plane.getAttribute('rotation') || {x:-90,y:0,z:0};
    // Slightly behind the overlay-plane along its local normal to avoid z-fighting
    const y = typeof pos.y === 'number' ? pos.y - 0.001 : 0;
    guide.setAttribute('position', `${pos.x || 0} ${y} ${pos.z || 0}`);
    guide.setAttribute('rotation', `${rot.x || -90} ${rot.y || 0} ${rot.z || 0}`);
  }

  function resetGame() {
    found.clear();
    updateHUD();
    hideCongrats();
  }

  async function loadConfig() {
    try {
      const res = await fetch('assets/config.json', { cache: 'no-store' });
      if (res.ok) {
        config = await res.json();
      }
    } catch (e) {
      // default to inline settings if config missing
      config = {};
    }
  }

  function initMarkerEvents() {
    const markers = document.querySelectorAll('a-marker');
    // Apply config-driven transforms at startup
    markers.forEach(m => applyConfigToMarker(m));

    markers.forEach(m => {
      m.addEventListener('markerFound', () => {
        const id = m.getAttribute('id');
        if (!found.has(id)) {
          found.add(id);
          updateHUD();
          flashPlane(m);
          if (found.size === total) showCongrats();
        }
      });
      // markerLost not used for counting, but could hide overlay, etc.
    });
  }

  function initUI() {
    $('#startBtn')?.addEventListener('click', () => {
      $('#menu')?.classList.add('hidden');
      $('#hud')?.classList.remove('hidden');
    });

    $('#quitBtn')?.addEventListener('click', () => {
      resetGame();
      $('#hud')?.classList.add('hidden');
      $('#menu')?.classList.remove('hidden');
    });

    $('#restartBtn')?.addEventListener('click', () => {
      resetGame();
    });
  }

  window.addEventListener('load', async () => {
    updateHUD();
    initUI();
    await loadConfig();
    // Wait for A-Frame scene before binding marker events
    const scene = document.querySelector('a-scene');
    if (scene) {
      if (scene.hasLoaded) {
        initMarkerEvents();
      } else {
        scene.addEventListener('loaded', initMarkerEvents);
      }
    }
  });
})();

