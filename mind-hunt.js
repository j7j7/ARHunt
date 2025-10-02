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

    // Colors for multi-colored fireworks
    const colors = [
      ['#ff6b35', '#f7931e', '#ffc107'], // Orange/Yellow
      ['#e91e63', '#f06292', '#ffb3d1'], // Pink/Magenta
      ['#2196f3', '#64b5f6', '#bbdefb'], // Blue
      ['#4caf50', '#81c784', '#c8e6c9'], // Green
      ['#9c27b0', '#ba68c8', '#e1bee7'], // Purple
      ['#ff5722', '#ff8a65', '#ffccbc'], // Red/Orange
      ['#00bcd4', '#4dd0e1', '#b2ebf2'], // Cyan
      ['#ffeb3b', '#fff176', '#fff9c4']  // Yellow
    ];

    // Create center explosion point
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create 100 particles in globe explosion pattern
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      
      // Random color from palette
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      const gradient = `radial-gradient(circle, ${colorSet[0]}, ${colorSet[1]}, ${colorSet[2]})`;
      particle.style.background = gradient;
      particle.style.boxShadow = `0 0 8px ${colorSet[1]}`;
      
      // Calculate explosion direction (360 degrees around center)
      const angle = (Math.PI * 2 * i) / 100; // Distribute evenly in circle
      const randomAngle = angle + (Math.random() - 0.5) * 0.5; // Add some randomness
      
      // Random explosion distance (50-200px from center)
      const distance = 50 + Math.random() * 150;
      
      // Calculate end position
      const endX = centerX + Math.cos(randomAngle) * distance;
      const endY = centerY + Math.sin(randomAngle) * distance;
      
      // Set initial position at center
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      
      // Random animation duration between 1.5-3 seconds
      const duration = 1.5 + Math.random() * 1.5;
      
      // Set CSS custom properties for end position
      particle.style.setProperty('--end-x', endX + 'px');
      particle.style.setProperty('--end-y', endY + 'px');
      
      particle.style.animation = `firework-globe-explosion ${duration}s ease-out forwards`;
      
      fireworks.appendChild(particle);
    }

    // Hide fireworks container after animation completes
    setTimeout(() => {
      fireworks.classList.add('hidden');
      fireworks.innerHTML = ''; // Clean up particles
    }, 4000);
  };

  const showCongrats = () => {
    // Stop the AR/video feed
    const mindarSystem = sceneEl.systems['mindar-image-system'];
    if (mindarSystem) {
      mindarSystem.stop();
    }

    // Hide the AR container completely
    arContainer.classList.add('hidden');

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
    foundTextEl.innerText = ''; // Clear bottom text
    foundTextEl.classList.remove('show'); // Remove any show class
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
    arContainer.classList.remove('hidden'); // Show AR container again
    resetGame();
    startAR(); // Restart the AR system
  });

  // Wait for the scene to load before setting up targets
  sceneEl.addEventListener('loaded', () => {
    setupTargets();
  });
});