// ARHunt Admin script
(function () {
  const fields = {
    markerSelect: document.getElementById('markerSelect'),
    overlaySelect: document.getElementById('overlaySelect'),
    widthInput: document.getElementById('widthInput'),
    heightInput: document.getElementById('heightInput'),
    posX: document.getElementById('posX'),
    posY: document.getElementById('posY'),
    posZ: document.getElementById('posZ'),
    rotX: document.getElementById('rotX'),
    rotY: document.getElementById('rotY'),
    rotZ: document.getElementById('rotZ'),
    loadConfigFile: document.getElementById('loadConfigFile'),
    downloadBtn: document.getElementById('downloadBtn'),
  };

  const defaultConfig = {
    triangle: { overlaySrc: 'assets/overlays/triangle.svg', width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    square:   { overlaySrc: 'assets/overlays/square.svg',   width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    rectangle:{ overlaySrc: 'assets/overlays/rectangle.svg',width: 1.3, height: 0.8, position: [0,0,0], rotation: [-90,0,0] },
    circle:   { overlaySrc: 'assets/overlays/circle.svg',   width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    star:     { overlaySrc: 'assets/overlays/star.svg',     width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    pentagon: { overlaySrc: 'assets/overlays/pentagon.svg', width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    hexagon:  { overlaySrc: 'assets/overlays/hexagon.svg',  width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    diamond:  { overlaySrc: 'assets/overlays/diamond.svg',  width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    heart:    { overlaySrc: 'assets/overlays/heart.svg',    width: 1.0, height: 1.0, position: [0,0,0], rotation: [-90,0,0] },
    arrow:    { overlaySrc: 'assets/overlays/arrow.svg',    width: 1.2, height: 0.8, position: [0,0,0], rotation: [-90,0,0] },
  };

  let config = JSON.parse(JSON.stringify(defaultConfig));

  function getMarkerEntity(id) {
    return document.querySelector(`a-marker#${CSS.escape(id)}`);
  }

  function applyToMarker(id) {
    const m = getMarkerEntity(id);
    if (!m) return;
    const plane = m.querySelector('.overlay-plane');
    if (!plane) return;
    const c = config[id];
    plane.setAttribute('width', Number(c.width));
    plane.setAttribute('height', Number(c.height));
    const [x,y,z] = c.position;
    plane.setAttribute('position', `${x} ${y} ${z}`);
    const [rx,ry,rz] = c.rotation;
    plane.setAttribute('rotation', `${rx} ${ry} ${rz}`);
    plane.setAttribute('material', `src: ${c.overlaySrc}; transparent: true;`);
  }

  function loadConfigIntoUI(id) {
    const c = config[id];
    fields.overlaySelect.value = c.overlaySrc;
    fields.widthInput.value = c.width;
    fields.heightInput.value = c.height;
    fields.posX.value = c.position[0];
    fields.posY.value = c.position[1];
    fields.posZ.value = c.position[2];
    fields.rotX.value = c.rotation[0];
    fields.rotY.value = c.rotation[1];
    fields.rotZ.value = c.rotation[2];
  }

  function updateConfigFromUI(id) {
    const c = config[id];
    c.overlaySrc = fields.overlaySelect.value;
    c.width = Number(fields.widthInput.value);
    c.height = Number(fields.heightInput.value);
    c.position = [Number(fields.posX.value), Number(fields.posY.value), Number(fields.posZ.value)];
    c.rotation = [Number(fields.rotX.value), Number(fields.rotY.value), Number(fields.rotZ.value)];
  }

  function downloadConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Auto-bind events
  function bindUI() {
    fields.markerSelect.addEventListener('change', () => {
      loadConfigIntoUI(fields.markerSelect.value);
    });

    [fields.overlaySelect, fields.widthInput, fields.heightInput, fields.posX, fields.posY, fields.posZ, fields.rotX, fields.rotY, fields.rotZ]
      .forEach(el => el.addEventListener('input', () => {
        const id = fields.markerSelect.value;
        updateConfigFromUI(id);
        applyToMarker(id);
      }));

    fields.downloadBtn.addEventListener('click', downloadConfig);

    fields.loadConfigFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          config = Object.assign({}, defaultConfig, parsed);
          loadConfigIntoUI(fields.markerSelect.value);
          // Apply to all markers
          Object.keys(config).forEach(applyToMarker);
        } catch (err) {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    });
  }

  // React to marker found to auto-select it in UI
  function bindMarkerEvents() {
    document.querySelectorAll('a-marker').forEach(m => {
      m.addEventListener('markerFound', () => {
        const id = m.getAttribute('id');
        fields.markerSelect.value = id;
        loadConfigIntoUI(id);
      });
    });
  }

  window.addEventListener('load', () => {
    bindUI();
    bindMarkerEvents();
    loadConfigIntoUI(fields.markerSelect.value);
    Object.keys(config).forEach(applyToMarker);
  });
})();

