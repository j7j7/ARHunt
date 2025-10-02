document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.querySelector('#startBtn');
  const quitBtn = document.querySelector('#quitBtn');
  const restartBtn = document.querySelector('#restartBtn');
  const menu = document.querySelector('#menu');
  const hud = document.querySelector('#hud');
  const hudBar = document.querySelector('.hud-bar');
  const congrats = document.querySelector('#congrats');
  const countdown = document.querySelector('#countdown');
  const fireworks = document.querySelector('#fireworks');
  const arContainer = document.querySelector('#ar-container');
  const sceneEl = document.querySelector('a-scene');
  const foundCountEl = document.querySelector('#foundCount');
  const totalCountEl = document.querySelector('#totalCount');
  const foundTextEl = document.querySelector('#foundText');
  const qrCodeCanvas = document.querySelector('#qrCodeCanvas');
  const countdownTimerEl = document.querySelector('.countdown-timer');

  let targets = [];
  let found = [];
  let total = 0;

  const descriptions = [
    "Lakshmi Puja with family", // DA1.jpg, target-0
    "Rama’s divine procession", // DA2.jpg, target-1
    "Sikh procession from fort", // DA3.jpg, target-2
    "Village celebration scene", // DA4.jpg, target-3
    "Temple with fireworks", // DA5.jpg, target-4
    "Vishnu battling demon", // DA6.jpg, target-5
    "Traditional multi-tiered brass lamp (Kuthuvilakku)", // DA7.jpg, target-6
    "Rama vs. Ravana battle" // DA8.jpg, target-7
  ];

  const triggerFireworks = () => {
    console.log('Triggering fireworks!');
    
    // Clear any existing particles
    fireworks.innerHTML = '';
    fireworks.classList.remove('hidden');

    // Create 100 particles
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      
      // Random starting position across the screen width
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * 100; // Start from top 100px of screen
      
      // Random horizontal drift
      const driftX = (Math.random() - 0.5) * 200; // -100px to +100px drift
      
      // Set initial position
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
      
      // Random animation duration between 2-4 seconds
      const duration = 2 + Math.random() * 2;
      particle.style.animation = `firework-fall ${duration}s ease-in forwards`;
      
      // Add horizontal drift using transform
      particle.style.transform = `translateX(${driftX}px)`;
      
      fireworks.appendChild(particle);
    }

    // Hide fireworks container after animation completes
    setTimeout(() => {
      fireworks.classList.add('hidden');
      fireworks.innerHTML = ''; // Clean up particles
    }, 5000);
  };

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

  const updateFound = (targetId, targetIndex) => {
    if (!found.includes(targetId)) {
      found.push(targetId);
      foundCountEl.innerText = found.length;

      // Trigger fireworks celebration for each new discovery
      triggerFireworks();

      foundTextEl.innerText = descriptions[targetIndex];
      foundTextEl.classList.add('show');
      setTimeout(() => {
        foundTextEl.classList.remove('show');
      }, 2000);
    }

    if (found.length === total) {
      // All targets found - start countdown before showing congratulations
      startCountdown();
    }
  };

  const startCountdown = () => {
    let countdownValue = 5;

    // Hide only the HUD bar (keep found text visible) and show countdown
    hudBar.classList.add('hidden');
    countdown.classList.remove('hidden');

    // Update countdown display
    countdownTimerEl.textContent = countdownValue;

    const countdownInterval = setInterval(() => {
      countdownValue--;
      countdownTimerEl.textContent = countdownValue;

      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        // Countdown finished, show congratulations
        countdown.classList.add('hidden');
        hud.classList.add('hidden'); // Now hide entire HUD including found text
        showCongrats();
      }
    }, 1000);
  };

  const setupTargets = () => {
    targets = sceneEl.querySelectorAll('[mindar-image-target]');
    total = targets.length;
    totalCountEl.innerText = total;

    targets.forEach((target) => {
      const targetIndex = target.getAttribute('mindar-image-target').targetIndex;
      target.addEventListener('targetFound', () => {
        updateFound(target.id, targetIndex);
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