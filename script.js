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
    $('#congrats')?.classList.remove('hidden');
  }

  function hideCongrats() {
    $('#congrats')?.classList.add('hidden');
  }

  function applyConfigToMarker(marker) {
    const id = marker.getAttribute('id');
    const plane = marker.querySelector('.overlay-plane');
    if (!plane) return;
    const c = config[id];
    if (!c) return;
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
      plane.setAttribute('material', `src: ${c.overlaySrc}; transparent: true;`);
    }
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

