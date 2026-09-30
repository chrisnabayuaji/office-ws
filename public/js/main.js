// Main Application Controller & Network Manager (3D Harvest Moon Edition)

class NetworkManager {
  constructor() {
    this.socket = io();
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to 3D Virtual Office server!');
    });

    this.socket.on('init', (data) => {
      window.game.setSelf(data.selfId, data.players);
      if (window.whiteboardInstance) {
        window.whiteboardInstance.loadState(data.whiteboard);
      }
      if (data.chatHistory) {
        data.chatHistory.forEach(msg => this.renderChatMessage(msg));
      }
      this.updateCoworkersList(data.players);
      this.updateTopHUD();
    });

    this.socket.on('playerJoined', (player) => {
      window.game.updatePlayer(player);
      if (window.soundFX) window.soundFX.playJoin();
      this.updateCoworkersList(window.game.players);
    });

    this.socket.on('playerMoved', (data) => {
      window.game.updatePlayer(data);
    });

    this.socket.on('playerLeft', (id) => {
      window.game.removePlayer(id);
      this.updateCoworkersList(window.game.players);
    });

    this.socket.on('playerSpeech', (data) => {
      window.game.showSpeech(data.id, data.text);
    });

    this.socket.on('playerEmote', (data) => {
      window.game.showEmote(data.id, data.emote);
    });

    this.socket.on('playerUpdatedStatus', (data) => {
      const p = window.game.players[data.id];
      if (p) {
        p.data.status = data.status;
        p.data.statusEmoji = data.statusEmoji;
        p.model.updateNametag(data.status, data.statusEmoji);
        this.updateCoworkersList(window.game.players);
        if (data.id === window.game.selfId) {
          this.updateTopHUD();
        }
      }
    });

    this.socket.on('chatMessage', (msg) => {
      this.renderChatMessage(msg);
    });

    this.socket.on('whiteboardDraw', (strokeData) => {
      if (window.whiteboardInstance) {
        window.whiteboardInstance.renderStroke(strokeData);
      }
    });

    this.socket.on('whiteboardSticky', (sticky) => {
      if (window.whiteboardInstance) {
        window.whiteboardInstance.addStickyNote({
          ...sticky.data,
          author: sticky.author
        });
      }
    });

    this.socket.on('whiteboardClear', () => {
      if (window.whiteboardInstance) {
        window.whiteboardInstance.clear();
      }
    });
  }

  join(username, avatarConfig) {
    this.socket.emit('join', {
      username: username,
      ...avatarConfig
    });
  }

  sendMove(data) {
    this.socket.emit('move', data);
  }

  sendChat(text, isProximity = false) {
    this.socket.emit('chatMessage', { text, isProximity });
  }

  sendEmote(emote) {
    this.socket.emit('emote', { emote });
  }

  sendStatus(status, statusEmoji) {
    this.socket.emit('updateStatus', { status, statusEmoji });
  }

  drinkCoffee() {
    this.socket.emit('drinkCoffee');
  }

  sendWhiteboardStroke(strokeData) {
    this.socket.emit('whiteboardDraw', strokeData);
  }

  sendWhiteboardSticky(data) {
    this.socket.emit('whiteboardSticky', data);
  }

  sendWhiteboardClear() {
    this.socket.emit('whiteboardClear');
  }

  renderChatMessage(msg) {
    const list = document.getElementById('chat-messages-list');
    if (!list) return;

    const div = document.createElement('div');
    div.className = 'chat-bubble-item' + (msg.isSystem ? ' system' : '');

    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msg.isSystem) {
      div.innerHTML = `<div class="chat-bubble-text">${msg.text}</div>`;
    } else {
      div.innerHTML = `
        <div class="chat-sender-info">
          <span class="sender-name" style="color:${msg.avatarColor || '#60a5fa'}">${msg.sender}</span>
          <span class="chat-time">${timeStr}</span>
          ${msg.zone ? `<span class="zone-tag">(${msg.zone})</span>` : ''}
        </div>
        <div class="chat-bubble-text">${msg.text}</div>
      `;
    }

    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  updateCoworkersList(players) {
    const list = document.getElementById('coworkers-list-el');
    const countBadge = document.getElementById('coworker-count-badge');
    if (!list) return;

    const playerList = Object.values(players || {}).map(p => p.data || p);
    if (countBadge) countBadge.innerText = playerList.length;

    list.innerHTML = '';
    playerList.forEach(p => {
      const item = document.createElement('div');
      item.className = 'coworker-item';
      const isMe = p.id === window.game.selfId;

      item.innerHTML = `
        <div class="coworker-info">
          <div class="coworker-avatar-tag" style="background-color: ${p.avatarColor || '#3b82f6'}">
            ${p.username ? p.username.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div class="coworker-name">${p.username} ${isMe ? '<small>(You)</small>' : ''}</div>
            <div class="coworker-location">${p.statusEmoji || '🟢'} ${p.status || 'Available'} • ${p.zone || 'Lobby'}</div>
          </div>
        </div>
        ${!isMe ? `<button class="teleport-btn" onclick="window.teleportTo('${p.id}')">Jump To</button>` : ''}
      `;
      list.appendChild(item);
    });
  }

  updateTopHUD() {
    const me = window.game.players[window.game.selfId];
    if (!me) return;

    const zoneEl = document.getElementById('hud-zone-text');
    if (zoneEl) zoneEl.innerText = me.data.zone || 'Lobby';

    const statusEl = document.getElementById('hud-status-text');
    if (statusEl) statusEl.innerText = `${me.data.statusEmoji || '🟢'} ${me.data.status || 'Available'}`;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  window.game = new Game3D(container);
  window.appNetwork = new NetworkManager();

  // Whiteboard setup
  const wbCanvas = document.getElementById('whiteboard-canvas');
  const stickyLayer = document.getElementById('sticky-notes-layer');
  window.whiteboardInstance = new Whiteboard(wbCanvas, stickyLayer);

  // Avatar Customization in Login Modal
  const avatarState = {
    color: '#3b82f6',
    skin: '#ffd1a4',
    hair: '#4a3728'
  };

  const previewCanvas = document.getElementById('avatar-preview-canvas');
  const pCtx = previewCanvas.getContext('2d');

  function renderPreview() {
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Torso 3D style
    pCtx.fillStyle = avatarState.color;
    pCtx.beginPath();
    pCtx.roundRect(16, 26, 32, 26, 6);
    pCtx.fill();

    // Collar
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(29, 26, 6, 8);
    pCtx.fillStyle = '#ef4444';
    pCtx.fillRect(30.5, 30, 3, 7);

    // Head
    pCtx.fillStyle = avatarState.skin;
    pCtx.beginPath();
    pCtx.arc(32, 20, 14, 0, Math.PI * 2);
    pCtx.fill();

    // Hair
    pCtx.fillStyle = avatarState.hair;
    pCtx.beginPath();
    pCtx.arc(32, 16, 14, Math.PI, Math.PI * 2);
    pCtx.fill();
    pCtx.fillRect(18, 16, 28, 6);

    // Eyes
    pCtx.fillStyle = '#1e293b';
    pCtx.fillRect(26, 20, 3, 4);
    pCtx.fillRect(35, 20, 3, 4);

    // Blush
    pCtx.fillStyle = '#f43f5e';
    pCtx.fillRect(24, 24, 4, 2);
    pCtx.fillRect(36, 24, 4, 2);
  }
  renderPreview();

  // Color picker event listeners
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      const color = e.target.dataset.color;
      avatarState[type] = color;

      e.target.parentElement.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');

      renderPreview();
    });
  });

  // Login Form Submit
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username-input');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim() || 'Coworker_' + Math.floor(Math.random() * 1000);
    
    // Join game
    window.appNetwork.join(username, {
      avatarColor: avatarState.color,
      avatarSkin: avatarState.skin,
      avatarHair: avatarState.hair
    });

    document.getElementById('login-modal').classList.add('hidden');
    if (window.soundFX) window.soundFX.init();
  });

  // HUD & Sidebar Buttons
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const coworkersToggleBtn = document.getElementById('coworkers-toggle-btn');
  const emoteToggleBtn = document.getElementById('emote-toggle-btn');
  const userStatusPill = document.getElementById('user-status-pill');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');

  const chatSidebar = document.getElementById('chat-sidebar');
  const coworkersSidebar = document.getElementById('coworkers-sidebar');
  const emotePopup = document.getElementById('emote-popup');
  const statusPopup = document.getElementById('status-popup');

  chatToggleBtn.addEventListener('click', () => {
    chatSidebar.classList.toggle('open');
    coworkersSidebar.classList.remove('open');
  });

  coworkersToggleBtn.addEventListener('click', () => {
    coworkersSidebar.classList.toggle('open');
    chatSidebar.classList.remove('open');
  });

  emoteToggleBtn.addEventListener('click', () => {
    emotePopup.classList.toggle('open');
  });

  userStatusPill.addEventListener('click', () => {
    statusPopup.classList.toggle('open');
  });

  soundToggleBtn.addEventListener('click', () => {
    const enabled = window.soundFX.toggle();
    soundToggleBtn.classList.toggle('active', enabled);
    soundToggleBtn.querySelector('.btn-label').innerText = enabled ? 'Sound ON' : 'Sound OFF';
  });

  // Close sidebars
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chatSidebar.classList.remove('open');
      coworkersSidebar.classList.remove('open');
      document.getElementById('whiteboard-modal').classList.remove('open');
    });
  });

  // Emote selection
  document.querySelectorAll('.emote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const emote = e.currentTarget.dataset.emote;
      window.appNetwork.sendEmote(emote);
      window.game.showEmote(window.game.selfId, emote);
      emotePopup.classList.remove('open');
    });
  });

  // Status selection
  document.querySelectorAll('.status-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const status = e.currentTarget.dataset.status;
      const emoji = e.currentTarget.dataset.emoji;
      window.appNetwork.sendStatus(status, emoji);
      statusPopup.classList.remove('open');
    });
  });

  // Chat Input
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input-text');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    window.appNetwork.sendChat(text);
    chatInput.value = '';
  });

  // Whiteboard Modal triggers & toolbar
  window.openWhiteboard = () => {
    const modal = document.getElementById('whiteboard-modal');
    modal.classList.add('open');
    setTimeout(() => {
      window.whiteboardInstance.initCanvasSize();
    }, 100);
  };

  document.getElementById('wb-tool-pen').addEventListener('click', (e) => {
    window.whiteboardInstance.mode = 'pen';
    document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });

  document.getElementById('wb-tool-eraser').addEventListener('click', (e) => {
    window.whiteboardInstance.mode = 'eraser';
    document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });

  document.querySelectorAll('.wb-color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      window.whiteboardInstance.currentColor = e.target.dataset.color;
      document.querySelectorAll('.wb-color-dot').forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  document.getElementById('wb-add-sticky-btn').addEventListener('click', () => {
    const text = prompt('Ketik catatan sticky note:');
    if (!text || !text.trim()) return;

    const colors = ['#fef08a', '#bbf7d0', '#fed7aa', '#e9d5ff', '#bae6fd'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    window.appNetwork.sendWhiteboardSticky({
      text: text.trim(),
      color: randomColor,
      x: 0.2 + Math.random() * 0.5,
      y: 0.2 + Math.random() * 0.5
    });
  });

  document.getElementById('wb-clear-btn').addEventListener('click', () => {
    if (confirm('Bersihkan seluruh whiteboard rapat?')) {
      window.appNetwork.sendWhiteboardClear();
    }
  });

  // Teleport helper in 3D
  window.teleportTo = (targetId) => {
    const target = window.game.players[targetId];
    const me = window.game.players[window.game.selfId];
    if (target && me) {
      me.model.group.position.x = target.model.group.position.x + 2;
      me.model.group.position.z = target.model.group.position.z;
      me.model.isSitting = false;
      me.model.isSleeping = false;
      if (window.soundFX) window.soundFX.playPop();
    }
  };

  // Periodic Zone update
  setInterval(() => {
    if (window.appNetwork) {
      window.appNetwork.updateTopHUD();
    }
  }, 1000);
});
