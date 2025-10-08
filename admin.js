// Admin page for ARHunt - Manage players and their statistics

const initializeAdmin = () => {
  console.log('Initializing admin page...');
  
  // Initialize InstantDB
  const { init, i, id } = window.InstantDB;
  const schema = i.schema({
    entities: {
      gameSessions: i.entity({
        playerName: i.string(),
        sessionId: i.string(),
        startedAt: i.date(),
        targetsFound: i.number(),
        totalTargets: i.number(),
        currentProgress: i.number(),
        isCompleted: i.boolean(),
        lastActivity: i.date(),
        expiresAt: i.date(),
      }),
      gameCompletions: i.entity({
        sessionId: i.string(),
        playerName: i.string(),
        completionTime: i.date(),
        qrContent: i.string(),
        sessionDuration: i.number(),
      }),
      discoveries: i.entity({
        sessionId: i.string(),
        playerName: i.string(),
        targetIndex: i.number(),
        targetDescription: i.string(),
        foundAt: i.date(),
        timeSinceStart: i.number(),
        sequenceNumber: i.number(),
      }),
      playerStats: i.entity({
        playerName: i.string(),
        totalGamesPlayed: i.number(),
        totalGamesCompleted: i.number(),
        bestCompletionTime: i.number().optional(),
        totalTargetsFound: i.number(),
        averageTargetsPerGame: i.number(),
        lastPlayed: i.date(),
        createdAt: i.date(),
      }),
    },
  });
  const db = init({ appId: '445c0fd0-115d-46b3-b421-c05f6d6e9f89', schema });

  let currentEditId = null;
  let lastNotificationTime = Date.now();

  const addNotification = (playerName, targetIndex, sequenceNumber, timeSinceStart = null) => {
    console.log('addNotification called for:', playerName, targetIndex, timeSinceStart);
    let message;
    const isVictory = (targetIndex === -1 && sequenceNumber === -1);
    if (isVictory) {
      // Victory notification
      const timeStr = formatTime(timeSinceStart);
      message = `Player: ${playerName} found all items in ${timeStr}!`;
    } else {
      const itemNumber = sequenceNumber || (targetIndex + 1);
      message = `Player: ${playerName} found item ${itemNumber}/8!`;
    }
    const duration = isVictory ? 10000 : 2000; // 10 seconds for victory, 2 for items
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    const container = document.querySelector('#notifications');
    if (container) {
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
      }, duration);
    } else {
      console.error('Notifications container not found');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // DOM elements
  const playersBody = document.getElementById('playersBody');
  const refreshBtn = document.getElementById('refreshBtn');
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');
  const closeModal = document.querySelector('.close');
  const cancelEdit = document.getElementById('cancelEdit');

  // Load players from database
  const loadPlayers = async () => {
    try {
      console.log('Loading players...');
      const result = await db.queryOnce({ playerStats: {} });
      const players = result?.data?.playerStats || result?.playerStats || [];
      console.log('Players loaded:', players);
      
      // Clear existing rows
      playersBody.innerHTML = '';
      
      if (players.length === 0) {
        const row = playersBody.insertRow();
        row.innerHTML = '<td colspan="7">No players found.</td>';
        return;
      }
      
      // Populate table
      players.forEach(player => {
        const row = playersBody.insertRow();
        row.innerHTML = `
          <td>${player.playerName}</td>
          <td>${player.totalGamesPlayed || 0}</td>
          <td>${player.totalGamesCompleted || 0}</td>
          <td>${player.totalTargetsFound || 0}</td>
          <td>${player.bestCompletionTime || 'N/A'}</td>
          <td>${new Date(player.lastPlayed).toLocaleDateString()}</td>
          <td>
            <button class="btn small edit-btn" data-id="${player.id}">Edit</button>
            <button class="btn small delete-btn" data-id="${player.id}">Delete</button>
          </td>
        `;
        console.log(`Added row for player: ${player.playerName} with buttons`);
      });
      
      // Add event listeners for edit and delete buttons
      const editButtons = document.querySelectorAll('.edit-btn');
      const deleteButtons = document.querySelectorAll('.delete-btn');
      console.log(`Found ${editButtons.length} edit buttons and ${deleteButtons.length} delete buttons`);
      
      editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const playerId = e.target.getAttribute('data-id');
          console.log(`Edit button clicked for player ID: ${playerId}`);
          openEditModal(playerId, players);
        });
      });
      
      deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const playerId = e.target.getAttribute('data-id');
          console.log(`Delete button clicked for player ID: ${playerId}`);
          if (confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
            deletePlayer(playerId);
          }
        });
      });
      
    } catch (error) {
      console.error('Error loading players:', error);
      playersBody.innerHTML = '<tr><td colspan="7">Error loading players. Check console for details.</td></tr>';
    }
  };

  // Open edit modal
  const openEditModal = (playerId, players) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    currentEditId = playerId;
    document.getElementById('editPlayerName').value = player.playerName;
    document.getElementById('editTotalGamesPlayed').value = player.totalGamesPlayed || 0;
    document.getElementById('editTotalGamesCompleted').value = player.totalGamesCompleted || 0;
    document.getElementById('editTotalTargetsFound').value = player.totalTargetsFound || 0;
    document.getElementById('editBestCompletionTime').value = player.bestCompletionTime || '';
    
    editModal.classList.remove('hidden');
  };

  // Close edit modal
  const closeEditModal = () => {
    editModal.classList.add('hidden');
    currentEditId = null;
  };

  // Save edited player
  const savePlayer = async (e) => {
    e.preventDefault();
    
    if (!currentEditId) return;
    
    const updatedData = {
      totalGamesPlayed: parseInt(document.getElementById('editTotalGamesPlayed').value) || 0,
      totalGamesCompleted: parseInt(document.getElementById('editTotalGamesCompleted').value) || 0,
      totalTargetsFound: parseInt(document.getElementById('editTotalTargetsFound').value) || 0,
      bestCompletionTime: parseFloat(document.getElementById('editBestCompletionTime').value) || null,
    };
    
    try {
      await db.transact(db.tx.playerStats[currentEditId].update(updatedData));
      console.log('Player updated successfully');
      closeEditModal();
      loadPlayers(); // Refresh the list
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player. Check console for details.');
    }
  };

  // Delete player
  const deletePlayer = async (playerId) => {
    try {
      await db.transact(db.tx.playerStats[playerId].delete());
      console.log('Player deleted successfully');
      loadPlayers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player. Check console for details.');
    }
  };

  // Event listeners
  refreshBtn.addEventListener('click', loadPlayers);
  editForm.addEventListener('submit', savePlayer);
  closeModal.addEventListener('click', closeEditModal);
  cancelEdit.addEventListener('click', closeEditModal);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  // Subscribe to discoveries for notifications
  db.subscribeQuery({ discoveries: {} }, (resp) => {
    console.log('Subscription callback triggered:', resp);
    if (resp.data) {
      const discoveries = resp.data.discoveries || [];
      console.log('Discoveries received:', discoveries.length);
      const newDiscoveries = discoveries.filter(d =>
        new Date(d.foundAt).getTime() > lastNotificationTime
      );
      console.log('New discoveries:', newDiscoveries.length);
      newDiscoveries.forEach(d => {
        console.log('Adding notification for:', d.playerName, d.targetIndex, d.timeSinceStart);
        addNotification(d.playerName, d.targetIndex, d.sequenceNumber, d.timeSinceStart);
      });
      if (newDiscoveries.length > 0) {
        lastNotificationTime = Math.max(...newDiscoveries.map(d => new Date(d.foundAt).getTime()));
      }
    }
  });

  // Initial load
  loadPlayers();

  // Test notifications after 1 second
  setTimeout(() => {
    console.log('Testing item notification');
    addNotification('TestPlayer', 0, 1);
  }, 1000);

  setTimeout(() => {
    console.log('Testing victory notification');
    addNotification('TestPlayer', -1, -1, 125); // 2:05
  }, 3000);
};

// Wait for DOM and InstantDB to be ready
let domReady = false;
let instantDBReady = false;

const checkAndInit = () => {
  if (domReady && instantDBReady) {
    initializeAdmin();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  domReady = true;
  checkAndInit();
});

window.addEventListener('instantdb-ready', () => {
  instantDBReady = true;
  checkAndInit();
});