// Admin page for capturing photos and mapping MindAR targets
(function(){
  // Capture section
  const video = document.getElementById('capVideo');
  const startCam = document.getElementById('startCam');
  const snap = document.getElementById('snap');
  const downloadCap = document.getElementById('downloadCap');
  const canvas = document.getElementById('capCanvas');

  async function startCamera(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}, audio:false});
      video.srcObject = stream;
      await video.play();
    }catch(e){
      alert('Camera failed to start. Please allow camera permissions.');
    }
  }

  function capture(){
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob)=>{
      const url = URL.createObjectURL(blob);
      downloadCap.href = url;
      downloadCap.style.display = 'inline-block';
      const ts = new Date().toISOString().replace(/[:.]/g,'-');
      downloadCap.download = `capture-${ts}.png`;
    }, 'image/png');
  }

  startCam?.addEventListener('click', startCamera);
  snap?.addEventListener('click', capture);

  // Mapping & config
  const targetIndex = document.getElementById('targetIndex');
  const overlaySelect = document.getElementById('overlaySelect');
  const width = document.getElementById('width');
  const height = document.getElementById('height');
  const posX = document.getElementById('posX');
  const posY = document.getElementById('posY');
  const posZ = document.getElementById('posZ');
  const rotX = document.getElementById('rotX');
  const rotY = document.getElementById('rotY');
  const rotZ = document.getElementById('rotZ');
  const applyBtn = document.getElementById('apply');
  const downloadConfig = document.getElementById('downloadConfig');
  const mindFile = document.getElementById('mindFile');

  // Preview scene elements for 0..9
  function entityFor(idx){ return document.getElementById(`t-${idx}`); }

  function applyToPreview(idx){
    const ent = entityFor(idx);
    if(!ent) return;
    const plane = ent.querySelector('.overlay-plane');
    if(!plane) return;
    plane.setAttribute('material', `src: ${overlaySelect.value}; transparent: true;`);
    plane.setAttribute('width', Number(width.value));
    plane.setAttribute('height', Number(height.value));
    plane.setAttribute('position', `${Number(posX.value)} ${Number(posY.value)} ${Number(posZ.value)}`);
    plane.setAttribute('rotation', `${Number(rotX.value)} ${Number(rotY.value)} ${Number(rotZ.value)}`);
  }

  applyBtn?.addEventListener('click', ()=>{
    applyToPreview(targetIndex.value);
  });

  // naturalTargets config builder
  const naturalTargets = {}; // { index: { overlaySrc, width, height, position, rotation } }

  function collectCurrent(idx){
    naturalTargets[idx] = {
      overlaySrc: overlaySelect.value,
      width: Number(width.value),
      height: Number(height.value),
      position: [Number(posX.value), Number(posY.value), Number(posZ.value)],
      rotation: [Number(rotX.value), Number(rotY.value), Number(rotZ.value)],
    };
  }

  // Update object on any input change to keep it current
  [overlaySelect, width, height, posX, posY, posZ, rotX, rotY, rotZ].forEach(el=>{
    el.addEventListener('input', ()=> collectCurrent(targetIndex.value));
  });

  downloadConfig?.addEventListener('click', ()=>{
    // Output only naturalTargets section; merge manually into assets/config.json later
    const blob = new Blob([JSON.stringify({ naturalTargets }, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'natural-config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Allow overriding the .mind file for this session
  mindFile?.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    const scene = document.querySelector('a-scene');
    scene.setAttribute('mindar-image', `imageTargetSrc: ${url}`);
  });
})();

