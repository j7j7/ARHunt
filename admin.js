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
  let playersData = []; // Store original player data for sorting
  let currentSort = { column: null, direction: 'asc' };

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

  const addButtonListeners = (players) => {
    // No buttons to add listeners to since we're using row clicks
  };

  const populateTable = (players) => {
    playersBody.innerHTML = '';
    players.forEach(player => {
      const row = playersBody.insertRow();
      row.innerHTML = `
        <td>${player.playerName}</td>
        <td>${player.totalGamesPlayed || 0}</td>
        <td>${player.totalGamesCompleted || 0}</td>
        <td>${player.totalTargetsFound || 0}</td>
        <td>${player.bestCompletionTime ? formatTime(player.bestCompletionTime) : 'N/A'}</td>
        <td>${new Date(player.lastPlayed).toLocaleDateString()}</td>
      `;
      row.dataset.playerId = player.id;
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        console.log('Row clicked for player:', player.playerName, player.id);
        openEditModal(player.id, playersData);
      });
    });
    addButtonListeners(players); // Call to satisfy any references
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
      playersData = result?.data?.playerStats || result?.playerStats || [];
      console.log('Players loaded:', playersData);

      // Clear existing rows
      playersBody.innerHTML = '';

      if (playersData.length === 0) {
        const row = playersBody.insertRow();
        row.innerHTML = '<td colspan="6">No players found.</td>';
        return;
      }

      // Populate table
      populateTable(playersData);
      
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
    console.log('Opening edit modal for playerId:', playerId);
    const player = players.find(p => p.id === playerId);
    if (!player) {
      console.error('Player not found for id:', playerId);
      return;
    }
    
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

  // Delete button in modal
  const deletePlayerBtn = document.getElementById('deletePlayer');
  deletePlayerBtn.addEventListener('click', () => {
    if (currentEditId && confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      deletePlayer(currentEditId);
      closeEditModal();
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  const sortTable = (columnIndex, direction) => {
    const sortedPlayers = [...playersData].sort((a, b) => {
      let aVal, bVal, result;
      switch (columnIndex) {
        case 0: // Player
          aVal = a.playerName;
          bVal = b.playerName;
          result = aVal.localeCompare(bVal);
          break;
        case 1: // Games
          aVal = a.totalGamesPlayed || 0;
          bVal = b.totalGamesPlayed || 0;
          result = aVal - bVal;
          break;
        case 2: // Completed
          aVal = a.totalGamesCompleted || 0;
          bVal = b.totalGamesCompleted || 0;
          result = aVal - bVal;
          break;
        case 3: // Targets
          aVal = a.totalTargetsFound || 0;
          bVal = b.totalTargetsFound || 0;
          result = aVal - bVal;
          break;
        case 4: // Best Time
          aVal = a.bestCompletionTime || Infinity;
          bVal = b.bestCompletionTime || Infinity;
          result = aVal - bVal;
          break;
        case 5: // Last Play
          aVal = new Date(a.lastPlayed);
          bVal = new Date(b.lastPlayed);
          result = aVal - bVal;
          break;
        default:
          result = 0;
      }
      return direction === 'desc' ? -result : result;
    });
    populateTable(sortedPlayers);
  };

  // Add sort functionality to table headers
  document.querySelectorAll('#playersList th').forEach((th, index) => {
    if (index < 6) { // Only sortable columns (exclude Actions)
      th.style.cursor = 'pointer';
      th.style.userSelect = 'none';
      th.addEventListener('click', () => {
        if (currentSort.column === index) {
          currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.column = index;
          currentSort.direction = 'asc';
        }
        sortTable(index, currentSort.direction);
        // Update sort indicators
        document.querySelectorAll('#playersList th').forEach(t => {
          t.textContent = t.textContent.replace(/ [↑↓]$/, '');
        });
        th.textContent += currentSort.direction === 'asc' ? ' ↑' : ' ↓';
      });
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