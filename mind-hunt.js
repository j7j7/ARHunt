// Wait for both DOM and InstantDB to be ready
const initializeApp = () => {
   console.log('Initializing app...');
   console.log('InstantDB available:', !!window.InstantDB);
   
   // Initialize InstantDB (now available globally)
   if (!window.InstantDB) {
     console.error('InstantDB not available on window object');
     return;
   }
   
   const { init, i, id } = window.InstantDB;
   console.log('InstantDB methods:', { init: !!init, i: !!i, id: !!id });
   const schema = i.schema({
     entities: {
       // Game sessions track overall player progress
       gameSessions: i.entity({
         playerName: i.string(),
         sessionId: i.string(), // Unique identifier for this game session
         startedAt: i.date(), // When the player started the game
         targetsFound: i.number(), // Current number of targets found
         totalTargets: i.number(), // Total targets in the game (8)
         currentProgress: i.number(), // Progress percentage (0-100)
         isCompleted: i.boolean(), // Whether the session is completed
         lastActivity: i.date(), // Last time player was active
         expiresAt: i.date(), // When this record expires
       }),
       // Separate entity for completion data
       gameCompletions: i.entity({
         sessionId: i.string(), // Link to the game session
         playerName: i.string(),
         completionTime: i.date(), // When they completed
         qrContent: i.string(), // QR code content
         sessionDuration: i.number(), // Total time in seconds
       }),
       // Individual discoveries with detailed timing
       discoveries: i.entity({
         sessionId: i.string(), // Link to the game session
         playerName: i.string(),
         targetIndex: i.number(), // Which target (0-7)
         targetDescription: i.string(), // Description of what was found
         foundAt: i.date(), // Exact timestamp of discovery
         timeSinceStart: i.number(), // Seconds since game start
         sequenceNumber: i.number(), // Order of discovery (1st, 2nd, etc.)
       }),
       // Player statistics and achievements
       playerStats: i.entity({
         playerName: i.string(),
         totalGamesPlayed: i.number(),
         totalGamesCompleted: i.number(),
         bestCompletionTime: i.number().optional(), // Best time in seconds
         totalTargetsFound: i.number(), // Across all games
         averageTargetsPerGame: i.number(),
         lastPlayed: i.date(),
         createdAt: i.date(),
       }),
     },
   });
   const db = init({ appId: '445c0fd0-115d-46b3-b421-c05f6d6e9f89', schema });

   let lastNotificationTime = Date.now();
   let notifications = [];

   const addNotification = async (playerName, targetIndex, sequenceNumber) => {
     // Use the sequence number from the remote player's discovery
     const message = `Player: ${playerName} found item ${sequenceNumber}/8!`;
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

   // Player name will be entered manually by the user

   // Let MindAR handle camera permissions directly

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
   let currentSessionId = '';
   let gameStartTime = null;
   let currentSessionDbId = null; // Store the database record ID
   let gameActive = false; // Flag to control whether targets should respond

   const descriptions = [
     "Lakshmi Puja with family", // DA1.jpg, target-0
     "Rama's divine procession", // DA2.jpg, target-1
     "Sikh procession from fort", // DA3.jpg, target-2
     "Village celebration scene", // DA4.jpg, target-3
     "Temple with fireworks", // DA5.jpg, target-4
     "Vishnu battling demon", // DA6.jpg, target-5
     "Traditional multi-tiered brass lamp (Kuthuvilakku)", // DA7.jpg, target-6
     "Rama vs. Ravana battle" // DA8.jpg, target-7
   ];

   // Session and player stats management
   const createGameSession = async () => {
     console.log('🎯 CREATING GAME SESSION');
     const now = new Date();
     gameStartTime = now;
     currentSessionId = `${playerName}-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
     
     // If total targets not set yet, use default of 8
     const totalTargets = total > 0 ? total : 8;
     console.log('📊 Using total targets:', totalTargets, '(from variable:', total, ')');
     
     const sessionData = {
       playerName,
       sessionId: currentSessionId,
       startedAt: now,
       targetsFound: 0,
       totalTargets: totalTargets,
       currentProgress: 0,
       isCompleted: false,
       lastActivity: now,
       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
       // Required fields by existing database schema - initialize with defaults
       completionTime: new Date(0), // Use epoch as default "not completed" marker
       qrContent: '' // Will be updated when session completes
     };

     console.log('📊 Session Data to Create:', JSON.stringify(sessionData, null, 2));

     try {
       const sessionDbId = id();
       currentSessionDbId = sessionDbId;
       console.log('🔑 Generated Session DB ID:', sessionDbId);
       
       console.log('💾 POSTING to gameSessions table...');
       const result = await db.transact(db.tx.gameSessions[sessionDbId].update(sessionData));
       console.log('✅ Game session created successfully!');
       console.log('📝 DB Response:', result);
       console.log('🆔 Current Session ID:', currentSessionId);
       console.log('🗂️ Current Session DB ID:', currentSessionDbId);
       
       // Update or create player stats
       console.log('📈 Updating player stats...');
       await updatePlayerStats('gameStarted');
     } catch (error) {
       console.error('❌ Failed to create game session:', error);
       console.error('📊 Session data that failed:', sessionData);
     }
   };

   const updateGameSession = async (additionalData = {}) => {
     console.log('🔄 UPDATING GAME SESSION');
     
     if (!currentSessionDbId) {
       console.warn('⚠️ No current session DB ID - cannot update session');
       return;
     }
     
     const now = new Date();
     const progress = (found.length / total) * 100;
     
     const updateData = {
       targetsFound: found.length,
       currentProgress: Math.round(progress),
       lastActivity: now,
       ...additionalData
     };

     console.log('📊 Session Update Data:', JSON.stringify(updateData, null, 2));
     console.log('🔑 Updating Session DB ID:', currentSessionDbId);

     try {
       console.log('💾 POSTING update to gameSessions table...');
       const result = await db.transact(db.tx.gameSessions[currentSessionDbId].update(updateData));
       console.log('✅ Game session updated successfully!');
       console.log('📝 DB Update Response:', result);
     } catch (error) {
       console.error('❌ Failed to update game session:', error);
       console.error('📊 Update data that failed:', updateData);
       console.error('🔑 Session ID that failed:', currentSessionDbId);
     }
   };

   const completeGameSession = async (qrContent) => {
     console.log('🏁 COMPLETING GAME SESSION');
     
     if (!currentSessionDbId || !gameStartTime) {
       console.warn('⚠️ Cannot complete session - missing session ID or start time');
       return;
     }
     
     const now = new Date();
     const sessionDuration = Math.round((now - gameStartTime) / 1000); // in seconds
     console.log('⏱️ Session duration:', sessionDuration, 'seconds');
     
     try {
       // Update the session with completion data
       const completionUpdateData = {
         isCompleted: true,
         currentProgress: 100,
         lastActivity: now,
         completionTime: now,
         qrContent: qrContent
         // Note: sessionDuration not in existing schema, but we track it in playerStats
       };
       
       console.log('📊 Session completion update:', JSON.stringify(completionUpdateData, null, 2));
       console.log('💾 POSTING session completion update...');
       
       await db.transact(db.tx.gameSessions[currentSessionDbId].update(completionUpdateData));
       console.log('✅ Session completed and updated!');
       
       // Update player stats for completion
       console.log('📈 Updating player stats for completion...');
       await updatePlayerStats('gameCompleted', sessionDuration);
       
     } catch (error) {
       console.error('❌ Failed to complete game session:', error);
       console.error('🔑 Session ID that failed:', currentSessionDbId);
       console.error('📊 Completion data that failed:', {
         qrContent,
         sessionDuration,
         completionTime: now
       });
     }
   };

   const updatePlayerStats = async (action, completionTime = null) => {
     console.log('📈 UPDATING PLAYER STATS');
     console.log('🎮 Action:', action);
     console.log('⏱️ Completion Time:', completionTime);
     console.log('👤 Player Name:', playerName);
     
     try {
       // Query existing player stats (skip if table doesn't exist)
       console.log('🔍 Querying existing player stats...');
       let existingStats = null;
       let playerStatsArray = [];
       
       try {
         const statsQuery = await db.queryOnce({ playerStats: { $: { where: { playerName } } } });
         console.log('📝 Stats Query Result:', statsQuery);
         
         // Handle case where playerStats table doesn't exist or no data found
         playerStatsArray = statsQuery?.data?.playerStats || statsQuery?.playerStats || [];
         existingStats = playerStatsArray[0] || null;
         console.log('📊 Player Stats Array:', playerStatsArray);
         console.log('📊 Existing Stats:', existingStats);
       } catch (statsError) {
         console.log('⚠️ Player stats table does not exist or query failed:', statsError.message);
         console.log('📊 Continuing without player stats...');
         // Continue without player stats - this is optional functionality
       }
       
       const now = new Date();
       let statsData;
       
       if (existingStats) {
         console.log('🔄 Updating existing player stats...');
         // Update existing stats
         const currentTotalGames = existingStats.totalGamesPlayed || 0;
         const currentTotalCompleted = existingStats.totalGamesCompleted || 0;
         const currentTotalTargets = existingStats.totalTargetsFound || 0;
         const currentBestTime = existingStats.bestCompletionTime;
         
         statsData = {
           totalGamesPlayed: action === 'gameStarted' ? currentTotalGames + 1 : currentTotalGames,
           totalGamesCompleted: action === 'gameCompleted' ? currentTotalCompleted + 1 : currentTotalCompleted,
           totalTargetsFound: currentTotalTargets + found.length,
           lastPlayed: now
         };
         
         if (action === 'gameCompleted') {
           // Update average
           const newTotalCompleted = currentTotalCompleted + 1;
           const newTotalTargets = currentTotalTargets + found.length;
           statsData.averageTargetsPerGame = newTotalTargets / newTotalCompleted;
           
           // Update best completion time
           if (completionTime && (!currentBestTime || completionTime < currentBestTime)) {
             statsData.bestCompletionTime = completionTime;
           }
         }
         
         console.log('📊 Stats Data to Update:', JSON.stringify(statsData, null, 2));
         try {
           console.log('💾 POSTING update to playerStats table...');
           const updateResult = await db.transact(db.tx.playerStats[existingStats.id].update(statsData));
           console.log('✅ Player stats updated successfully!');
           console.log('📝 DB Response:', updateResult);
         } catch (updateError) {
           console.log('⚠️ Failed to update player stats:', updateError.message);
         }
       } else {
         console.log('✨ Creating new player stats...');
         // Create new stats
         statsData = {
           playerName,
           totalGamesPlayed: 1,
           totalGamesCompleted: action === 'gameCompleted' ? 1 : 0,
           totalTargetsFound: found.length,
           averageTargetsPerGame: action === 'gameCompleted' ? found.length : 0,
           lastPlayed: now,
           createdAt: now
         };
         
         if (action === 'gameCompleted' && completionTime) {
           statsData.bestCompletionTime = completionTime;
         }
         
         console.log('📊 New Stats Data to Create:', JSON.stringify(statsData, null, 2));
         try {
           const newStatsId = id();
           console.log('🔑 Generated Stats DB ID:', newStatsId);
           console.log('💾 POSTING new stats to playerStats table...');
           const createResult = await db.transact(db.tx.playerStats[newStatsId].update(statsData));
           console.log('✅ New player stats created successfully!');
           console.log('📝 DB Response:', createResult);
         } catch (createError) {
           console.log('⚠️ Failed to create player stats:', createError.message);
         }
       }
       
       console.log('🎉 Player stats operation completed:', statsData);
     } catch (error) {
       console.error('Failed to update player stats:', error);
     }
   };

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

  const showCongrats = async () => {
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

     // Complete the game session with enhanced tracking
     await completeGameSession(qrContent);

     // Display player name
     playerNameDisplay.innerText = `Congratulations, ${playerName}!`;

     hud.classList.add('hidden');
     congrats.classList.remove('hidden');
  };

  let countdownStarted = false; // Track if countdown has been started

   const updateFound = async (targetId, targetIndex) => {
     if (!found.includes(targetId)) {
       found.push(targetId);
       foundCountEl.innerText = found.length;

       // Save discovery to InstantDB with enhanced tracking
       console.log('🎯 TARGET DISCOVERED!');
       const foundAt = new Date();
       const timeSinceStart = gameStartTime ? Math.round((foundAt - gameStartTime) / 1000) : 0;
       const sequenceNumber = found.length;
       
       const discoveryData = {
         sessionId: currentSessionId,
         playerName,
         targetIndex,
         targetDescription: descriptions[targetIndex],
         foundAt,
         timeSinceStart,
         sequenceNumber
       };
       
       console.log('📊 Discovery Data to Record:', JSON.stringify(discoveryData, null, 2));
       
       try {
         const discoveryDbId = id();
         console.log('🔑 Generated Discovery DB ID:', discoveryDbId);
         console.log('💾 POSTING to discoveries table...');
         
         const result = await db.transact(db.tx.discoveries[discoveryDbId].update(discoveryData));
         console.log('✅ Discovery recorded successfully!');
         console.log('📝 DB Response:', result);
       } catch (error) {
         console.error('❌ Failed to record discovery:', error);
         console.error('📊 Discovery data that failed:', discoveryData);
       }
       
       // Update the game session progress
       console.log('🔄 Updating session progress...');
       await updateGameSession();

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
    console.log('🎯 SETTING UP TARGETS');
    targets = sceneEl.querySelectorAll('[mindar-image-target]');
    total = targets.length;
    console.log('📊 Total targets found:', total);
    console.log('🎯 Target elements:', targets);
    
    // Log detailed target information
    targets.forEach((target, index) => {
      console.log(`🎯 Target ${index}:`, {
        id: target.id,
        tagName: target.tagName,
        attributes: Array.from(target.attributes).map(attr => `${attr.name}="${attr.value}"`),
        hasMindarAttribute: target.hasAttribute('mindar-image-target')
      });
    });
    
    totalCountEl.innerText = total;

    targets.forEach((target, index) => {
      // Fix target index parsing - it's an attribute string, not a property
      const targetIndexAttr = target.getAttribute('mindar-image-target');
      const targetIndex = targetIndexAttr ? parseInt(targetIndexAttr.split('targetIndex:')[1]?.trim()) : index;
      
      console.log(`🎯 Setting up target ${index}:`, {
        id: target.id,
        targetIndexAttr,
        parsedTargetIndex: targetIndex,
        isValid: !isNaN(targetIndex)
      });
      
      if (isNaN(targetIndex)) {
        console.error(`❌ Invalid target index for ${target.id}, using array index ${index}`);
      }
      
      // Use the array index as fallback if parsing fails
      const finalTargetIndex = !isNaN(targetIndex) ? targetIndex : index;
      
      // Add multiple event listeners to catch different events
      target.addEventListener('targetFound', () => {
        console.log(`🎆 TARGET FOUND EVENT triggered for ${target.id} (index: ${finalTargetIndex})`);
        updateFound(target.id, finalTargetIndex);
      });
      
      target.addEventListener('targetLost', () => {
        console.log(`🔍 Target lost event for ${target.id}`);
      });
      
      // Add a test button to manually trigger detection for testing
      if (index === 0) {
        console.log('🧪 Adding manual test trigger for first target...');
        setTimeout(() => {
          console.log('🧪 You can manually test target detection by running:');
          console.log(`testTarget('${target.id}', ${finalTargetIndex})`);
          
          // Make test function globally available
          window.testTarget = (targetId, targetIdx) => {
            console.log(`🧪 MANUAL TEST: Triggering target ${targetId} with index ${targetIdx}`);
            updateFound(targetId, targetIdx);
          };
        }, 2000);
      }
    });
    
    console.log('✅ Target setup completed. Total targets:', total);
    
    // Check if the targets.mind file is accessible
    const targetsSrc = sceneEl.getAttribute('mindar-image').split(';')[0].split(':')[1].trim();
    console.log('📷 Targets file path:', targetsSrc);
    
    // Try to fetch the targets file to see if it's accessible
    fetch(targetsSrc)
      .then(response => {
        console.log('📷 Targets file response:', response.status, response.statusText);
        if (!response.ok) {
          console.error('❌ Targets file not found or not accessible');
        } else {
          console.log('✅ Targets file loaded successfully');
        }
      })
      .catch(error => {
        console.error('❌ Failed to fetch targets file:', error);
      });
  };

  const stopAR = () => {
    console.log('🛑 STOPPING AR SYSTEM');
    const mindarSystem = sceneEl.systems['mindar-image-system'];
    if (mindarSystem) {
      mindarSystem.stop();
      console.log('✅ AR system stopped');
    } else {
      console.error('❌ No MindAR system found to stop');
    }
  };

  const startAR = () => {
    console.log('▶️ STARTING AR SYSTEM');
    console.log('🎯 Scene element:', sceneEl);
    console.log('🎯 Available systems:', Object.keys(sceneEl.systems || {}));
    
    const mindarSystem = sceneEl.systems['mindar-image-system'];
    if (mindarSystem) {
      console.log('📷 MindAR system found, starting...');
      mindarSystem.start();
      console.log('✅ AR system started');
    } else {
      console.error('❌ No MindAR system found! Available systems:', Object.keys(sceneEl.systems || {}));
      console.error('🔍 Scene has mindar-image attribute?', sceneEl.hasAttribute('mindar-image'));
    }
  };

   const resetGame = () => {
     found = [];
     foundCountEl.innerText = 0;
     foundTextEl.innerText = ''; // Clear bottom text
     foundTextEl.classList.remove('show'); // Remove any show class
     playerName = ''; // Reset player name
     
     // Clear session data
     currentSessionId = '';
     gameStartTime = null;
     currentSessionDbId = null;
     
     // Clear any running countdown
     if (countdownInterval) {
       clearInterval(countdownInterval);
       countdownInterval = null;
     }
     countdown.classList.add('hidden');
     
     // Reset countdown flag
     countdownStarted = false;
   };

   startBtn.addEventListener('click', async () => {
     playerName = playerNameInput.value.trim();
     
     // Check if name is provided
     if (!playerName) {
       alert('Please enter your name to start the game.');
       playerNameInput.focus();
       return;
     }
     
     lastNotificationTime = Date.now(); // Reset for new session
     
     console.log('Starting game for player:', playerName);
     
     // Create the game session in the database
     await createGameSession();
     
     // Subscribe to discoveries for notifications
     db.subscribeQuery({ discoveries: {} }, (resp) => {
       if (resp.data) {
         const discoveries = resp.data.discoveries;
         const newDiscoveries = discoveries.filter(d =>
           new Date(d.foundAt).getTime() > lastNotificationTime &&
           d.playerName !== playerName
         );
         newDiscoveries.forEach(d => addNotification(d.playerName, d.targetIndex, d.sequenceNumber));
         if (newDiscoveries.length > 0) {
           lastNotificationTime = Math.max(...newDiscoveries.map(d => new Date(d.foundAt).getTime()));
         }
       }
     });
     
     menu.classList.add('hidden');
     hud.classList.remove('hidden');
     
     // Activate the game - AR should already be running
     gameActive = true;
     console.log('✅ Game activated - targets now responsive');
   });

   quitBtn.addEventListener('click', () => {
     gameActive = false;
     resetGame();
     playerNameInput.value = ''; // Clear the name field
     hud.classList.add('hidden');
     menu.classList.remove('hidden');
     console.log('🚨 Game deactivated');
   });

   restartBtn.addEventListener('click', () => {
     congrats.classList.add('hidden');
     hud.classList.remove('hidden');
     resetGame();
     playerNameInput.value = ''; // Clear the name field
     gameActive = true; // Reactivate the game
     console.log('✅ Game reactivated after restart');
   });

  // Start AR immediately when scene loads
  console.log('🎯 Adding scene loaded event listener...');
  sceneEl.addEventListener('loaded', () => {
    console.log('🎆 SCENE LOADED EVENT TRIGGERED!');
    console.log('🎯 Scene ready state:', sceneEl.hasLoaded);
    console.log('📷 Available systems after load:', Object.keys(sceneEl.systems || {}));
    setupTargets();
    
    // Start AR immediately so camera is ready
    console.log('▶️ Starting AR system immediately after scene load');
    startAR();
  });
  
  // Also add event listeners for MindAR specific events
  sceneEl.addEventListener('arReady', () => {
    console.log('📷 AR READY EVENT - MindAR is initialized!');
    // Set up target event listeners after AR is ready
    setTimeout(() => {
      console.log('🔄 Setting up target event listeners after AR ready...');
      const targetsAfterAR = sceneEl.querySelectorAll('[mindar-image-target]');
      console.log('🎯 Targets after AR ready:', targetsAfterAR.length);
      
      targetsAfterAR.forEach((target, index) => {
        // Use the index from the target ID instead of parsing attributes
        const targetId = target.id;
        const targetIndexMatch = targetId.match(/target-(\d+)/);
        const finalTargetIndex = targetIndexMatch ? parseInt(targetIndexMatch[1]) : index;
        
        // Check overlay plane visibility and properties
        const overlayPlane = target.querySelector('a-plane');
        const overlayMaterial = overlayPlane?.getAttribute('material');
        
        console.log(`🎯 Re-setting up target ${index}:`, {
          id: target.id,
          targetIndex: finalTargetIndex,
          hasOverlayPlane: !!overlayPlane,
          overlayVisible: overlayPlane?.getAttribute('visible'),
          overlayMaterial: overlayMaterial,
          overlayPosition: overlayPlane?.getAttribute('position'),
          overlayScale: overlayPlane?.getAttribute('scale'),
          targetVisible: target.getAttribute('visible'),
          overlayOpacity: overlayPlane?.getAttribute('opacity')
        });
        
        // Log overlay properties for debugging
        if (overlayPlane) {
          console.log(`🖼️ Overlay plane properties for ${targetId}:`, {
            src: overlayPlane.getAttribute('src'),
            position: overlayPlane.getAttribute('position'),
            width: overlayPlane.getAttribute('width'),
            height: overlayPlane.getAttribute('height'),
            rotation: overlayPlane.getAttribute('rotation')
          });
        }
        
        // Remove any existing listeners first
        target.removeEventListener('targetFound', target._targetFoundHandler);
        target.removeEventListener('targetLost', target._targetLostHandler);
        
        // Create and store handlers
        target._targetFoundHandler = () => {
          console.log(`🎆 TARGET FOUND EVENT (after AR ready) for ${target.id} (index: ${finalTargetIndex})`);
          if (!gameActive) {
            console.log('🚧 Target found but game not active yet - ignoring');
            return;
          }
          updateFound(target.id, finalTargetIndex);
        };
        
        target._targetLostHandler = () => {
          console.log(`🔍 Target lost event (after AR ready) for ${target.id}`);
        };
        
        // Add the event listeners
        target.addEventListener('targetFound', target._targetFoundHandler);
        target.addEventListener('targetLost', target._targetLostHandler);
      });
      
      // Verify assets are loaded
      const assets = sceneEl.querySelector('a-assets');
      if (assets) {
        const images = assets.querySelectorAll('img');
        console.log('🖼️ Asset images found:', images.length);
        images.forEach((img, idx) => {
          console.log(`🖼️ Asset ${idx}:`, {
            id: img.id,
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth
          });
        });
      }
      
      console.log('✅ Target event listeners set up after AR ready');
    }, 1000);
  });
  
  sceneEl.addEventListener('arError', (event) => {
    console.error('❌ AR ERROR EVENT:', event.detail);
  });
  
  // Add global event listener for debugging only (don't call updateFound to avoid duplicates)
  sceneEl.addEventListener('targetFound', (event) => {
    console.log('🎆 GLOBAL TARGET FOUND EVENT:', event.target.id, event.detail);
    
    // Just log for debugging - don't call updateFound since individual listeners handle it
    const targetId = event.target.id;
    const overlayPlane = event.target.querySelector('a-plane');
    if (overlayPlane) {
      console.log('🖼️ GLOBAL: Overlay material check:', overlayPlane.getAttribute('material'));
    }
  });
  
  sceneEl.addEventListener('targetLost', (event) => {
    console.log('🔍 GLOBAL TARGET LOST EVENT:', event.target.id, event.detail);
  });
};

// Wait for both DOM and InstantDB to be ready
let domReady = false;
let instantDBReady = false;

const checkAndInit = () => {
  console.log('checkAndInit called - domReady:', domReady, 'instantDBReady:', instantDBReady);
  if (domReady && instantDBReady) {
    console.log('Both ready, initializing app');
    initializeApp();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  domReady = true;
  checkAndInit();
});

window.addEventListener('instantdb-ready', () => {
  console.log('InstantDB Ready event received');
  instantDBReady = true;
  checkAndInit();
});
