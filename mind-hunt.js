document.addEventListener('DOMContentLoaded', async () => {
   // Initialize InstantDB
   const { init, i, id } = await import('https://esm.sh/@instantdb/core@0.22.6');
   const schema = i.schema({
     entities: {
       gameSessions: i.entity({
         playerName: i.string(),
         completionTime: i.date(),
         qrContent: i.string(),
         targetsFound: i.number(),
         expiresAt: i.date(),
       }),
       discoveries: i.entity({
         playerName: i.string(),
         targetIndex: i.number(),
         foundAt: i.date(),
       }),
     },
   });
   const db = init({ appId: '445c0fd0-115d-46b3-b421-c05f6d6e9f89', schema });

   let lastNotificationTime = Date.now();
   let notifications = [];

   const addNotification = (playerName, targetIndex) => {
     const message = `Player: ${playerName} found ${targetIndex + 1}/${total} item!`;
     const notification = document.createElement('div');
     notification.className = 'notification';
     notification.innerText = message;
     const container = document.querySelector('#notifications');
     container.insertBefore(notification, container.firstChild);
     while (container.children.length > 5) {
       container.removeChild(container.lastChild);
     }
     setTimeout(() => notification.classList.add('show'), 10);
     setTimeout(() => {
       notification.classList.remove('show');
       setTimeout(() => {
         if (notification.parentNode) {
           notification.parentNode.removeChild(notification);
         }
       }, 300);
     }, 2000);
   };

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
   const playerNameInput = document.querySelector('#playerName');
   const playerNameDisplay = document.querySelector('#playerNameDisplay');

   const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white', 'pink', 'brown'];
   const objects = ['lamp', 'chair', 'ball', 'tree', 'car', 'book', 'phone', 'cup', 'hat', 'shoe'];

   const generateRandomName = () => {
     const color = colors[Math.floor(Math.random() * colors.length)];
     const object = objects[Math.floor(Math.random() * objects.length)];
     return `${color}-${object}`;
   };

   // Generate and set random name
   playerNameInput.value = generateRandomName();

   // Handle enter key in name input
   playerNameInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
       e.preventDefault();
       startBtn.click();
     }
   });

   let targets = [];
   let found = [];
   let total = 0;
   let playerName = '';

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
     const fireworksColors = [
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
       const colorSet = fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
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
     const qrContent = `${playerName}-${yyyy}${mm}${dd}${hh}${mi}${ss}${randomNumber}`;

     // Generate QR code
     QRCode.toCanvas(qrCodeCanvas, qrContent, (error) => {
       if (error) console.error(error);
       console.log('QR code generated!');
     });

     // Save to InstantDB
     const completionTime = new Date();
     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
     db.transact(db.tx.gameSessions[id()].update({
       playerName,
       completionTime,
       qrContent,
       targetsFound: total,
       expiresAt,
     }));

     // Display player name
     playerNameDisplay.innerText = `Congratulations, ${playerName}!`;

     hud.classList.add('hidden');
     congrats.classList.remove('hidden');
  };

  let countdownStarted = false; // Track if countdown has been started

   const updateFound = (targetId, targetIndex) => {
     if (!found.includes(targetId)) {
       found.push(targetId);
       foundCountEl.innerText = found.length;

       // Save discovery to InstantDB
       db.transact(db.tx.discoveries[id()].update({
         playerName,
         targetIndex,
         foundAt: new Date(),
       }));

       // Trigger fireworks celebration for each new discovery
       triggerFireworks();

       foundTextEl.innerText = descriptions[targetIndex];
       foundTextEl.classList.add('show');
       setTimeout(() => {
         foundTextEl.classList.remove('show');
       }, 2000);
     }

    if (found.length === total && !countdownStarted) {
      // All targets found - start countdown before showing congratulations (only once)
      countdownStarted = true;
      startCountdown();
    }
  };

  let countdownInterval = null; // Track countdown interval

  const startCountdown = () => {
    // Clear any existing countdown
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    let countdownValue = 5;

    // Hide only the HUD bar (keep found text visible) and show countdown
    hudBar.classList.add('hidden');
    countdown.classList.remove('hidden');

    // Update countdown display
    countdownTimerEl.textContent = countdownValue;

    countdownInterval = setInterval(() => {
      countdownValue--;
      countdownTimerEl.textContent = countdownValue;

      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
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
     playerName = ''; // Reset player name
     
     // Clear any running countdown
     if (countdownInterval) {
       clearInterval(countdownInterval);
       countdownInterval = null;
     }
     countdown.classList.add('hidden');
     
     // Reset countdown flag
     countdownStarted = false;
   };

   startBtn.addEventListener('click', () => {
     playerName = playerNameInput.value.trim() || 'Anonymous';
     lastNotificationTime = Date.now(); // Reset for new session
     // Subscribe to discoveries for notifications
     db.subscribeQuery({ discoveries: {} }, (resp) => {
       if (resp.data) {
         const discoveries = resp.data.discoveries;
         const newDiscoveries = discoveries.filter(d =>
           new Date(d.foundAt).getTime() > lastNotificationTime &&
           d.playerName !== playerName
         );
         newDiscoveries.forEach(d => addNotification(d.playerName, d.targetIndex));
         if (newDiscoveries.length > 0) {
           lastNotificationTime = Math.max(...newDiscoveries.map(d => new Date(d.foundAt).getTime()));
         }
       }
     });
     menu.classList.add('hidden');
     hud.classList.remove('hidden');
     arContainer.classList.remove('hidden');
     startAR();
   });

   quitBtn.addEventListener('click', () => {
     stopAR();
     resetGame();
     playerNameInput.value = generateRandomName(); // Set new random name
     hud.classList.add('hidden');
     arContainer.classList.add('hidden');
     menu.classList.remove('hidden');
   });

   restartBtn.addEventListener('click', () => {
     congrats.classList.add('hidden');
     hud.classList.remove('hidden');
     arContainer.classList.remove('hidden'); // Show AR container again
     resetGame();
     playerNameInput.value = generateRandomName(); // Set new random name
     startAR(); // Restart the AR system
   });

  // Wait for the scene to load before setting up targets
  sceneEl.addEventListener('loaded', () => {
    setupTargets();
  });
});