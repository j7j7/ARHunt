// MindAR hunt logic
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.querySelector('#startBtn');
  const quitBtn = document.querySelector('#quitBtn');
  const restartBtn = document.querySelector('#restartBtn');
  const menu = document.querySelector('#menu');
  const hud = document.querySelector('#hud');
  const congrats = document.querySelector('#congrats');
  const arContainer = document.querySelector('#ar-container');
  const sceneEl = document.querySelector('a-scene');
  const foundCountEl = document.querySelector('#foundCount');
  const totalCountEl = document.querySelector('#totalCount');
  const foundTextEl = document.querySelector('#foundText');
  const qrCodeCanvas = document.querySelector('#qrCodeCanvas');

  let targets = [];
  let found = [];
  let total = 0;

  const showCongrats = () => {
    // Generate QR code content
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const qrContent = `${yyyy}${mm}${dd}${hh}${mi}${ss}${randomNumber}`;

    // Generate QR code
    QRCode.toCanvas(qrCodeCanvas, qrContent, (error) => {
      if (error) console.error(error);
      console.log('QR code generated!');
    });

    hud.classList.add('hidden');
    congrats.classList.remove('hidden');
  };

  const updateFound = (targetId, targetName) => {
    if (!found.includes(targetId)) {
      found.push(targetId);
      foundCountEl.innerText = found.length;

      foundTextEl.innerText = `Found ${targetName}!`;
      foundTextEl.classList.add('show');
      setTimeout(() => {
        foundTextEl.classList.remove('show');
      }, 2000);
    }

    if (found.length === total) {
      showCongrats();
    }
  };

  const setupTargets = () => {
    targets = sceneEl.querySelectorAll('[mindar-image-target]');
    total = targets.length;
    totalCountEl.innerText = total;

    targets.forEach((target, index) => {
      const targetName = `Target #${index + 1}`;
      target.addEventListener('targetFound', () => {
        updateFound(target.id, targetName);
      });
    });
  };

  const stopAR = () => {
    const mindarSystem = sceneEl.systems['mindar-image-system'];
    mindarSystem.stop();
  };

  const startAR = () => {
    const mindarSystem = sceneEl.systems['mindar-image-system'];
    mindarSystem.start();
  };

  const resetGame = () => {
    found = [];
    foundCountEl.innerText = 0;
  };

  startBtn.addEventListener('click', () => {
    menu.classList.add('hidden');
    hud.classList.remove('hidden');
    arContainer.classList.remove('hidden');
    startAR();
  });

  quitBtn.addEventListener('click', () => {
    stopAR();
    resetGame();
    hud.classList.add('hidden');
    arContainer.classList.add('hidden');
    menu.classList.remove('hidden');
  });

  restartBtn.addEventListener('click', () => {
    congrats.classList.add('hidden');
    hud.classList.remove('hidden');
    resetGame();
  });

  // Wait for the scene to load before setting up targets
  sceneEl.addEventListener('loaded', () => {
    setupTargets();
  });
});

