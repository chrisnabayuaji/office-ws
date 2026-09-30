const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Office state
const players = {};
const whiteboardElements = []; // Store strokes & sticky notes
const chatHistory = [];

// Spawn area (Lobby)
const SPAWN_POINTS = [
  { x: 380, y: 350 },
  { x: 430, y: 350 },
  { x: 480, y: 350 },
  { x: 530, y: 350 },
  { x: 380, y: 400 },
  { x: 430, y: 400 },
  { x: 480, y: 400 },
  { x: 530, y: 400 }
];

function getRandomSpawn() {
  const p = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
  return {
    x: p.x + (Math.random() * 40 - 20),
    y: p.y + (Math.random() * 40 - 20)
  };
}

io.on('connection', (socket) => {
  console.log(`[+] New connection: ${socket.id}`);

  // When player joins with username & avatar
  socket.on('join', (data) => {
    const spawn = getRandomSpawn();
    const username = (data.username || 'Coworker').trim().substring(0, 16);
    
    players[socket.id] = {
      id: socket.id,
      username: username,
      avatarColor: data.avatarColor || '#3b82f6',
      avatarSkin: data.avatarSkin || '#ffd1a4',
      avatarHair: data.avatarHair || '#4a3728',
      avatarOutfit: data.avatarOutfit || 'suit', // suit, casual, hoodie, developer, dress
      x: spawn.x,
      y: spawn.y,
      targetX: spawn.x,
      targetY: spawn.y,
      direction: 'down',
      isMoving: false,
      status: data.status || 'Available',
      statusEmoji: data.statusEmoji || '🟢',
      zone: 'Lobby',
      isSitting: false,
      coffeeCount: 0,
      joinedAt: Date.now()
    };

    // Send current game state to joining player
    socket.emit('init', {
      selfId: socket.id,
      players: players,
      whiteboard: whiteboardElements,
      chatHistory: chatHistory.slice(-50)
    });

    // Notify other players
    socket.broadcast.emit('playerJoined', players[socket.id]);

    // Send system announcement
    const joinMsg = {
      id: 'sys_' + Date.now(),
      sender: 'System',
      senderId: 'system',
      text: `${username} joined the office! 👋`,
      timestamp: Date.now(),
      isSystem: true
    };
    chatHistory.push(joinMsg);
    io.emit('chatMessage', joinMsg);
  });

  // Handle player movement
  socket.on('move', (data) => {
    const player = players[socket.id];
    if (!player) return;

    player.x = data.x !== undefined ? data.x : player.x;
    player.y = data.y !== undefined ? data.y : player.y;
    player.x3d = data.x3d !== undefined ? data.x3d : player.x3d;
    player.z3d = data.z3d !== undefined ? data.z3d : player.z3d;
    player.rotY = data.rotY !== undefined ? data.rotY : player.rotY;
    player.direction = data.direction || player.direction;
    player.isMoving = data.isMoving;
    player.zone = data.zone || player.zone;
    player.isSitting = data.isSitting || false;
    player.isSleeping = data.isSleeping || false;

    // Broadcast to other players
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      x: player.x,
      y: player.y,
      x3d: player.x3d,
      z3d: player.z3d,
      rotY: player.rotY,
      direction: player.direction,
      isMoving: player.isMoving,
      zone: player.zone,
      isSitting: player.isSitting,
      isSleeping: player.isSleeping
    });
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    const player = players[socket.id];
    if (!player) return;

    const text = (data.text || '').trim();
    if (!text) return;

    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      sender: player.username,
      senderId: socket.id,
      avatarColor: player.avatarColor,
      text: text.substring(0, 300),
      timestamp: Date.now(),
      zone: player.zone,
      isProximity: data.isProximity || false,
      senderX: player.x,
      senderY: player.y
    };

    chatHistory.push(msg);
    if (chatHistory.length > 200) chatHistory.shift();

    // Broadcast chat & speech bubble
    io.emit('chatMessage', msg);
    io.emit('playerSpeech', {
      id: socket.id,
      text: msg.text,
      timestamp: Date.now()
    });
  });

  // Handle emote
  socket.on('emote', (data) => {
    const player = players[socket.id];
    if (!player) return;

    io.emit('playerEmote', {
      id: socket.id,
      emote: data.emote,
      timestamp: Date.now()
    });
  });

  // Handle status update
  socket.on('updateStatus', (data) => {
    const player = players[socket.id];
    if (!player) return;

    player.status = data.status || 'Available';
    player.statusEmoji = data.statusEmoji || '🟢';

    io.emit('playerUpdatedStatus', {
      id: socket.id,
      status: player.status,
      statusEmoji: player.statusEmoji
    });
  });

  // Handle coffee drink
  socket.on('drinkCoffee', () => {
    const player = players[socket.id];
    if (!player) return;

    player.coffeeCount = (player.coffeeCount || 0) + 1;
    io.emit('playerDrankCoffee', {
      id: socket.id,
      coffeeCount: player.coffeeCount
    });
  });

  // Handle whiteboard actions (draw stroke / add sticky note / clear)
  socket.on('whiteboardDraw', (strokeData) => {
    whiteboardElements.push({
      type: 'stroke',
      data: strokeData,
      author: players[socket.id]?.username || 'Anonymous',
      id: Date.now() + '_' + Math.random()
    });
    if (whiteboardElements.length > 1000) whiteboardElements.shift();
    socket.broadcast.emit('whiteboardDraw', strokeData);
  });

  socket.on('whiteboardSticky', (stickyData) => {
    const item = {
      type: 'sticky',
      data: stickyData,
      author: players[socket.id]?.username || 'Anonymous',
      id: 'sticky_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    };
    whiteboardElements.push(item);
    io.emit('whiteboardSticky', item);
  });

  socket.on('whiteboardClear', () => {
    whiteboardElements.length = 0;
    io.emit('whiteboardClear');
  });

  // Disconnection
  socket.on('disconnect', () => {
    const player = players[socket.id];
    if (player) {
      console.log(`[-] ${player.username} disconnected`);
      const leaveMsg = {
        id: 'sys_' + Date.now(),
        sender: 'System',
        senderId: 'system',
        text: `${player.username} left the office.`,
        timestamp: Date.now(),
        isSystem: true
      };
      chatHistory.push(leaveMsg);
      io.emit('chatMessage', leaveMsg);
      io.emit('playerLeft', socket.id);
      delete players[socket.id];
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🏢 VIRTUAL OFFICE SERVER RUNNING!`);
  console.log(`🌐 Local URL:  http://localhost:${PORT}`);
  console.log(`👥 Invite your friends on the same WiFi/Network!`);
  console.log(`=============================================`);
});
