// Expanded 2D Virtual Office Map Engine (3400 x 2200)

class OfficeMap {
  constructor() {
    this.width = 3400;
    this.height = 2200;

    // Room boundaries for Zone detection
    this.zones = [
      { id: 'lobby', name: 'Lobby & Reception', x: 200, y: 150, w: 550, h: 480, color: '#1e293b' },
      { id: 'workspace', name: 'Open Workspace (Tech Hub)', x: 800, y: 150, w: 900, h: 750, color: '#0f172a' },
      { id: 'meeting_alpha', name: 'Meeting Room Alpha', x: 1750, y: 150, w: 650, h: 520, color: '#0f292c' },
      { id: 'meeting_beta', name: 'Meeting Room Beta (Brainstorm)', x: 2450, y: 150, w: 750, h: 520, color: '#113536' },
      { id: 'pantry', name: 'Pantry & Café Lounge', x: 200, y: 680, w: 550, h: 680, color: '#241e38' },
      { id: 'focus', name: 'Focus & Silent Pods', x: 1750, y: 720, w: 650, h: 640, color: '#261633' },
      { id: 'billiard', name: 'Ruang Billiard & Lounge Bar', x: 2450, y: 720, w: 750, h: 640, color: '#1b2a4a' },
      { id: 'garden', name: 'Zen Balcony & Garden', x: 800, y: 950, w: 900, h: 410, color: '#0f382a' },
      { id: 'nap_room', name: 'Ruang Tidur & Nap Room', x: 200, y: 1410, w: 750, h: 650, color: '#2e1c3b' },
      { id: 'game_room', name: 'Ruang Game & Esports Arena', x: 1000, y: 1410, w: 1100, h: 650, color: '#131b2e' },
      { id: 'gym', name: 'Gym & Fitness Center', x: 2150, y: 1410, w: 1050, h: 650, color: '#281a1a' }
    ];

    // Solid collision boxes
    this.colliders = [];
    this.setupColliders();

    // Interactive objects (coffee, whiteboard, billiards, arcade, beds, gym, etc.)
    this.interactiveObjects = [];
    this.setupInteractiveObjects();

    // Chairs & Beds
    this.chairs = [];
    this.beds = [];
    this.setupChairsAndBeds();
  }

  setupColliders() {
    // Outer boundary walls
    this.colliders.push({ x: 0, y: 0, w: this.width, h: 100 }); // Top
    this.colliders.push({ x: 0, y: this.height - 50, w: this.width, h: 50 }); // Bottom
    this.colliders.push({ x: 0, y: 0, w: 150, h: this.height }); // Left
    this.colliders.push({ x: this.width - 100, y: 0, w: 100, h: this.height }); // Right

    // Vertical Divider Walls with Door Openings
    // Wall 1: Left column (Lobby/Pantry/Nap) -> Middle (x: 750)
    this.colliders.push({ x: 750, y: 100, w: 30, h: 320 });
    this.colliders.push({ x: 750, y: 560, w: 30, h: 420 });
    this.colliders.push({ x: 750, y: 1120, w: 30, h: 240 });
    this.colliders.push({ x: 750, y: 1500, w: 30, h: 560 });

    // Wall 2: Middle -> Right Column (x: 1700)
    this.colliders.push({ x: 1700, y: 100, w: 30, h: 320 });
    this.colliders.push({ x: 1700, y: 560, w: 30, h: 420 });
    this.colliders.push({ x: 1700, y: 1120, w: 30, h: 240 });

    // Wall 3: Between Meeting Alpha & Beta / Focus & Billiard (x: 2400)
    this.colliders.push({ x: 2400, y: 100, w: 30, h: 340 });
    this.colliders.push({ x: 2400, y: 580, w: 30, h: 360 });
    this.colliders.push({ x: 2400, y: 1080, w: 30, h: 280 });

    // Wall 4: Between Game Room & Gym (x: 2100 in bottom row)
    this.colliders.push({ x: 2100, y: 1410, w: 30, h: 400 });

    // Horizontal Divider Walls
    // Between Lobby and Pantry
    this.colliders.push({ x: 150, y: 640, w: 420, h: 30 });
    // Between Pantry and Nap Room
    this.colliders.push({ x: 150, y: 1370, w: 450, h: 30 });
    // Between Meeting Alpha and Focus Pods
    this.colliders.push({ x: 1730, y: 680, w: 500, h: 30 });
    // Between Meeting Beta and Billiard Room
    this.colliders.push({ x: 2430, y: 680, w: 600, h: 30 });
    // Horizontal separator above Nap, Game Room, Gym
    this.colliders.push({ x: 780, y: 1370, w: 2400, h: 30 });

    // Reception desk
    this.colliders.push({ x: 420, y: 260, w: 200, h: 50 });

    // Workspace Desks (8 Clusters of 4)
    const deskRows = [
      { x: 880, y: 260 }, { x: 1320, y: 260 },
      { x: 880, y: 440 }, { x: 1320, y: 440 },
      { x: 880, y: 620 }, { x: 1320, y: 620 },
      { x: 880, y: 800 }, { x: 1320, y: 800 }
    ];
    deskRows.forEach(d => {
      this.colliders.push({ x: d.x, y: d.y, w: 280, h: 90 });
    });

    // Meeting Alpha Conference Table
    this.colliders.push({ x: 1900, y: 280, w: 340, h: 160 });

    // Meeting Beta Round Discussion Table
    this.colliders.push({ x: 2750, y: 300, w: 180, h: 180 });

    // Pantry Counter & Dining
    this.colliders.push({ x: 200, y: 720, w: 520, h: 50 });
    this.colliders.push({ x: 340, y: 900, w: 280, h: 80 });

    // Focus Pod Desks
    const podDesks = [
      { x: 1820, y: 820 }, { x: 2160, y: 820 },
      { x: 1820, y: 1040 }, { x: 2160, y: 1040 },
      { x: 1820, y: 1240 }, { x: 2160, y: 1240 }
    ];
    podDesks.forEach(p => {
      this.colliders.push({ x: p.x, y: p.y, w: 140, h: 60 });
    });

    // Ruang Billiard: 2 Billiard Tables
    this.colliders.push({ x: 2580, y: 850, w: 220, h: 140 }); // Table 1 (Green)
    this.colliders.push({ x: 2880, y: 850, w: 220, h: 140 }); // Table 2 (Blue)
    // Billiard Bar Counter
    this.colliders.push({ x: 2580, y: 1180, w: 520, h: 50 });

    // Ruang Tidur: 6 Kasur / Beds (solid collision so character aligns on bed)
    const beds = [
      { x: 280, y: 1520 }, { x: 480, y: 1520 }, { x: 680, y: 1520 },
      { x: 280, y: 1780 }, { x: 480, y: 1780 }, { x: 680, y: 1780 }
    ];
    beds.forEach(b => {
      this.colliders.push({ x: b.x, y: b.y, w: 130, h: 170 });
    });

    // Ruang Game: OLED TV console + Couch, Esports PC table, Arcade
    this.colliders.push({ x: 1100, y: 1500, w: 260, h: 40 }); // TV stand
    this.colliders.push({ x: 1100, y: 1650, w: 260, h: 70 }); // Gaming Couch
    this.colliders.push({ x: 1480, y: 1520, w: 500, h: 80 }); // Esports 4-PC Desk
    this.colliders.push({ x: 1520, y: 1800, w: 240, h: 140 }); // Ping Pong Table

    // Gym: Treadmills & Workout benches
    this.colliders.push({ x: 2300, y: 1520, w: 180, h: 80 });
    this.colliders.push({ x: 2600, y: 1520, w: 180, h: 80 });
    this.colliders.push({ x: 2900, y: 1520, w: 180, h: 80 });

    // Zen Fountain
    this.colliders.push({ x: 1200, y: 1100, w: 140, h: 120 });
  }

  setupInteractiveObjects() {
    this.interactiveObjects = [
      // Coffee & Water
      { id: 'coffee_machine', name: 'Espresso Coffee Machine', type: 'coffee', x: 340, y: 720, w: 60, h: 50, prompt: 'Press [E] to Grab Coffee ☕' },
      { id: 'water_cooler', name: 'Water Dispenser', type: 'water', x: 650, y: 720, w: 40, h: 40, prompt: 'Press [E] to Drink Water 💧' },

      // Meeting Whiteboards
      { id: 'whiteboard_alpha', name: 'Meeting Whiteboard Alpha', type: 'whiteboard', x: 2000, y: 190, w: 140, h: 50, prompt: 'Press [E] for Whiteboard 📝' },
      { id: 'whiteboard_beta', name: 'Meeting Whiteboard Beta', type: 'whiteboard', x: 2750, y: 190, w: 140, h: 50, prompt: 'Press [E] for Brainstorm Board 💡' },

      // Billiard Tables (Interactive Shots!)
      { id: 'billiard_1', name: 'Billiard Table #1', type: 'billiard', x: 2580, y: 850, w: 220, h: 140, prompt: 'Press [E] to Shoot Billiard Ball 🎱' },
      { id: 'billiard_2', name: 'Billiard Table #2', type: 'billiard', x: 2880, y: 850, w: 220, h: 140, prompt: 'Press [E] to Shoot Billiard Ball 🎱' },
      { id: 'darts', name: 'Darts Board', type: 'darts', x: 3100, y: 750, w: 50, h: 50, prompt: 'Press [E] to Throw Darts 🎯' },

      // Ruang Game (Console, Esports, Arcade, Ping Pong)
      { id: 'console_tv', name: 'PlayStation 5 Console', type: 'game_console', x: 1200, y: 1510, w: 80, h: 40, prompt: 'Press [E] to Play PS5 / Xbox 🎮' },
      { id: 'esports_pc', name: 'Esports Battle-station', type: 'esports', x: 1680, y: 1530, w: 160, h: 60, prompt: 'Press [E] to Play Valorant / Dota 🏆' },
      { id: 'arcade_game', name: 'Retro Arcade Machine', type: 'arcade', x: 1040, y: 1820, w: 70, h: 80, prompt: 'Press [E] to Play Retro Arcade 🕹️' },
      { id: 'ping_pong', name: 'Ping Pong Table', type: 'pingpong', x: 1520, y: 1800, w: 240, h: 140, prompt: 'Press [E] to Play Ping Pong 🏓' },

      // Gym Equipment
      { id: 'gym_treadmill', name: 'Treadmill Runner', type: 'gym', x: 2350, y: 1530, w: 80, h: 70, prompt: 'Press [E] to Run Treadmill 🏃' },
      { id: 'gym_weights', name: 'Dumbbell Weights', type: 'gym', x: 2650, y: 1530, w: 80, h: 70, prompt: 'Press [E] to Lift Weights 💪' },
      { id: 'gym_punch', name: 'Boxing Bag', type: 'punch', x: 2950, y: 1530, w: 60, h: 70, prompt: 'Press [E] to Punch Bag 🥊' }
    ];
  }

  setupChairsAndBeds() {
    // Workspace Chairs
    const deskRows = [
      { x: 880, y: 260 }, { x: 1320, y: 260 },
      { x: 880, y: 440 }, { x: 1320, y: 440 },
      { x: 880, y: 620 }, { x: 1320, y: 620 },
      { x: 880, y: 800 }, { x: 1320, y: 800 }
    ];
    deskRows.forEach(d => {
      // 2 Top chairs, 2 Bottom chairs
      this.chairs.push({ x: d.x + 60, y: d.y - 25, facing: 'down' });
      this.chairs.push({ x: d.x + 200, y: d.y - 25, facing: 'down' });
      this.chairs.push({ x: d.x + 60, y: d.y + 105, facing: 'up' });
      this.chairs.push({ x: d.x + 200, y: d.y + 105, facing: 'up' });
    });

    // Meeting Alpha Chairs (10 chairs)
    const mt = { x: 1900, y: 280, w: 340, h: 160 };
    for (let i = 0; i < 4; i++) {
      this.chairs.push({ x: mt.x + 45 + i * 80, y: mt.y - 28, facing: 'down' });
      this.chairs.push({ x: mt.x + 45 + i * 80, y: mt.y + mt.h + 10, facing: 'up' });
    }
    this.chairs.push({ x: mt.x - 28, y: mt.y + 75, facing: 'right' });
    this.chairs.push({ x: mt.x + mt.w + 12, y: mt.y + 75, facing: 'left' });

    // Focus Pod Chairs
    const podDesks = [
      { x: 1820, y: 820 }, { x: 2160, y: 820 },
      { x: 1820, y: 1040 }, { x: 2160, y: 1040 },
      { x: 1820, y: 1240 }, { x: 2160, y: 1240 }
    ];
    podDesks.forEach(p => {
      this.chairs.push({ x: p.x + 70, y: p.y + 75, facing: 'up' });
    });

    // Gaming Couch Seats
    this.chairs.push({ x: 1150, y: 1680, facing: 'up' });
    this.chairs.push({ x: 1230, y: 1680, facing: 'up' });
    this.chairs.push({ x: 1310, y: 1680, facing: 'up' });

    // Billiard Bar Stools
    for (let i = 0; i < 6; i++) {
      this.chairs.push({ x: 2620 + i * 80, y: 1145, facing: 'down' });
    }

    // Kasur / Beds in Ruang Tidur (Interactive Sleep Spots)
    const bedLocations = [
      { x: 280, y: 1520 }, { x: 480, y: 1520 }, { x: 680, y: 1520 },
      { x: 280, y: 1780 }, { x: 480, y: 1780 }, { x: 680, y: 1780 }
    ];
    bedLocations.forEach((b, idx) => {
      this.beds.push({
        id: 'bed_' + (idx + 1),
        x: b.x + 65,
        y: b.y + 80,
        boxX: b.x,
        boxY: b.y,
        prompt: `Press [E] to Sleep on Bed #${idx + 1} 🛏️💤`
      });
    });
  }

  getZone(x, y) {
    for (const z of this.zones) {
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        return z.name;
      }
    }
    return 'Hallway Walkway';
  }

  isColliding(x, y, radius = 16) {
    const box = {
      x: x - radius,
      y: y - radius,
      w: radius * 2,
      h: radius * 2
    };

    for (const c of this.colliders) {
      if (
        box.x < c.x + c.w &&
        box.x + box.w > c.x &&
        box.y < c.y + c.h &&
        box.y + box.h > c.y
      ) {
        return true;
      }
    }
    return false;
  }

  getNearbyInteractive(x, y, range = 55) {
    // 1. Check beds first (for sleeping)
    for (const bed of this.beds) {
      const dist = Math.hypot(bed.x - x, bed.y - y);
      if (dist < 60) {
        return {
          id: bed.id,
          type: 'bed',
          name: 'Cozy Bed',
          bedX: bed.x,
          bedY: bed.y,
          prompt: bed.prompt
        };
      }
    }

    // 2. Check interactive objects
    for (const obj of this.interactiveObjects) {
      const centerX = obj.x + obj.w / 2;
      const centerY = obj.y + obj.h / 2;
      const dist = Math.hypot(centerX - x, centerY - y);
      if (dist < range + Math.max(obj.w, obj.h) / 2) {
        return obj;
      }
    }

    // 3. Check chairs (for sitting)
    for (const chair of this.chairs) {
      const dist = Math.hypot(chair.x - x, chair.y - y);
      if (dist < 38) {
        return {
          id: 'chair_' + chair.x + '_' + chair.y,
          type: 'chair',
          name: 'Office Chair',
          chairX: chair.x,
          chairY: chair.y,
          facing: chair.facing,
          prompt: 'Press [E] to Sit Down 🪑'
        };
      }
    }
    return null;
  }

  render(ctx, camera) {
    // Outer void background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, this.width, this.height);

    // Floor surfaces
    this.renderFloors(ctx);

    // Floor grids
    this.renderGrid(ctx);

    // Solid walls
    this.renderWalls(ctx);

    // Decor & Furniture
    this.renderFurniture(ctx);

    // New Fun Rooms (Billiard, Gaming, Sleeping, Gym)
    this.renderBilliardRoom(ctx);
    this.renderNapRoom(ctx);
    this.renderGameRoom(ctx);
    this.renderGymRoom(ctx);

    // Garden & Balcony
    this.renderGarden(ctx);

    // Chairs
    this.renderChairs(ctx);
  }

  renderFloors(ctx) {
    this.zones.forEach(zone => {
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

      // Zone Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(zone.name.toUpperCase(), zone.x + 24, zone.y + 42);
    });

    // Hallways
    ctx.fillStyle = '#101626';
    // Top hallway
    ctx.fillRect(150, 100, 3150, 50);
    // Mid hallway
    ctx.fillRect(150, 1370, 3150, 40);
    // Doorways
    ctx.fillRect(750, 420, 30, 140);
    ctx.fillRect(750, 980, 30, 140);
    ctx.fillRect(1700, 420, 30, 140);
    ctx.fillRect(1700, 980, 30, 140);
    ctx.fillRect(2400, 440, 30, 140);
    ctx.fillRect(2400, 940, 30, 140);
    ctx.fillRect(2100, 1810, 30, 140);
  }

  renderGrid(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const step = 40;

    for (let x = 150; x < this.width - 100; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x, this.height - 50);
      ctx.stroke();
    }
    for (let y = 100; y < this.height - 50; y += step) {
      ctx.beginPath();
      ctx.moveTo(150, y);
      ctx.lineTo(this.width - 100, y);
      ctx.stroke();
    }
  }

  renderWalls(ctx) {
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;

    this.colliders.forEach(c => {
      if (c.w <= 40 || c.h <= 40 || c.x === 0 || c.x > this.width - 120 || c.y < 100 || c.y > this.height - 60) {
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeRect(c.x, c.y, c.w, c.h);
      }
    });

    // Wall Top Highlights
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(750, 100, 30, 6);
    ctx.fillRect(1700, 100, 30, 6);
    ctx.fillRect(2400, 100, 30, 6);
  }

  renderFurniture(ctx) {
    // 1. Reception
    ctx.fillStyle = '#475569';
    this.roundRect(ctx, 420, 260, 200, 50, 10, true, true);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('🏢 RECEPTION', 475, 290);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    this.roundRect(ctx, 390, 350, 260, 140, 16, true, false);

    // 2. Open Workspace Desks
    const deskRows = [
      { x: 880, y: 260 }, { x: 1320, y: 260 },
      { x: 880, y: 440 }, { x: 1320, y: 440 },
      { x: 880, y: 620 }, { x: 1320, y: 620 },
      { x: 880, y: 800 }, { x: 1320, y: 800 }
    ];
    deskRows.forEach(d => {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      this.roundRect(ctx, d.x, d.y, 280, 90, 8, true, true);
      // Divider
      ctx.fillStyle = '#475569';
      ctx.fillRect(d.x + 5, d.y + 42, 270, 6);
      // Monitors (top & bottom)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(d.x + 40, d.y + 10, 45, 6);
      ctx.fillRect(d.x + 180, d.y + 10, 45, 6);
      ctx.fillRect(d.x + 40, d.y + 74, 45, 6);
      ctx.fillRect(d.x + 180, d.y + 74, 45, 6);
    });

    // 3. Meeting Room Alpha
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    this.roundRect(ctx, 1920, 160, 280, 18, 4, true, true);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText('📊 Q3 TECH ALL-HANDS PRESENTATION', 1945, 173);

    // Alpha Table
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 1900, 280, 340, 160, 36, true, true);

    // 4. Meeting Room Beta (Brainstorming)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(2840, 390, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.font = '12px sans-serif';
    ctx.fillText('💡 IDEAS HUB', 2805, 395);

    // 5. Pantry Counter & Cafe
    ctx.fillStyle = '#334155';
    ctx.fillRect(200, 720, 520, 50);
    // Coffee Machine
    ctx.fillStyle = '#dc2626';
    this.roundRect(ctx, 340, 720, 60, 46, 6, true, true);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('☕', 358, 752);
    // Water
    ctx.fillStyle = '#0284c7';
    this.roundRect(ctx, 650, 725, 40, 40, 6, true, true);
    ctx.fillText('💧', 658, 752);
  }

  renderBilliardRoom(ctx) {
    // Ruang Billiard / Pool Hall
    // Table 1 (Green felt)
    ctx.fillStyle = '#78350f'; // Wood border
    this.roundRect(ctx, 2580, 850, 220, 140, 12, true, true);
    ctx.fillStyle = '#15803d'; // Green felt
    this.roundRect(ctx, 2595, 865, 190, 110, 8, true, false);

    // 6 Pockets
    ctx.fillStyle = '#0f172a';
    [
      [2595, 865], [2690, 862], [2785, 865],
      [2595, 975], [2690, 978], [2785, 975]
    ].forEach(p => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Billiard balls triangle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(2660, 920, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(2670, 915, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2670, 925, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; // Cue ball
    ctx.beginPath(); ctx.arc(2730, 920, 5, 0, Math.PI * 2); ctx.fill();

    // Table 2 (Blue felt)
    ctx.fillStyle = '#78350f';
    this.roundRect(ctx, 2880, 850, 220, 140, 12, true, true);
    ctx.fillStyle = '#1d4ed8'; // Blue felt
    this.roundRect(ctx, 2895, 865, 190, 110, 8, true, false);
    // Pockets
    ctx.fillStyle = '#0f172a';
    [
      [2895, 865], [2990, 862], [3085, 865],
      [2895, 975], [2990, 978], [3085, 975]
    ].forEach(p => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dartboard on wall
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(3130, 770, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(3130, 770, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(3130, 770, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(3130, 770, 4, 0, Math.PI * 2); ctx.fill();

    // Billiard Bar Counter
    ctx.fillStyle = '#475569';
    this.roundRect(ctx, 2580, 1180, 520, 50, 10, true, true);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText('🍸 BILLIARD & LOUNGE BAR', 2740, 1210);
  }

  renderNapRoom(ctx) {
    // Ruang Tidur / Nap Room (6 Kasur Mewah)
    const bedLocations = [
      { x: 280, y: 1520, num: 1 }, { x: 480, y: 1520, num: 2 }, { x: 680, y: 1520, num: 3 },
      { x: 280, y: 1780, num: 4 }, { x: 480, y: 1780, num: 5 }, { x: 680, y: 1780, num: 6 }
    ];

    bedLocations.forEach(b => {
      // Bed wooden frame
      ctx.fillStyle = '#582f0e';
      this.roundRect(ctx, b.x, b.y, 130, 170, 12, true, true);

      // Mattress / Kasur (Soft Cyan / Indigo)
      ctx.fillStyle = '#e2e8f0';
      this.roundRect(ctx, b.x + 8, b.y + 8, 114, 154, 8, true, false);

      // Blanket / Selimut
      ctx.fillStyle = '#818cf8';
      this.roundRect(ctx, b.x + 8, b.y + 45, 114, 117, 8, true, false);

      // Pillow / Bantal
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, b.x + 22, b.y + 14, 86, 26, 6, true, true);

      // Bed Tag
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '10px sans-serif';
      ctx.fillText(`BED #${b.num} 💤`, b.x + 40, b.y + 160);
    });

    // Nightstand Lamp
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(245, 1550, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(245, 1810, 10, 0, Math.PI * 2); ctx.fill();
  }

  renderGameRoom(ctx) {
    // Ruang Game & Esports Arena
    // 1. Giant OLED TV
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 1100, 1500, 260, 35, 6, true, true);
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🎮 PS5 / XBOX OLED THEATER', 1130, 1522);

    // Gaming Couch
    ctx.fillStyle = '#6b21a8';
    ctx.strokeStyle = '#9333ea';
    this.roundRect(ctx, 1100, 1650, 260, 70, 14, true, true);

    // 2. Esports 4-PC Battle-station Desk
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 1480, 1520, 500, 80, 10, true, true);

    // 4 Glowing RGB Monitors & Towers
    for (let i = 0; i < 4; i++) {
      const pcX = 1510 + i * 120;
      // Dual monitors
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(pcX, 1530, 45, 6);
      ctx.fillRect(pcX + 48, 1530, 45, 6);
      // RGB Tower
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(pcX + 96, 1525, 14, 25);
    }

    // 3. Ping Pong Table
    ctx.fillStyle = '#047857';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 1520, 1800, 240, 140, 8, true, true);
    // Net
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(1640, 1795);
    ctx.lineTo(1640, 1945);
    ctx.stroke();

    // 4. Retro Arcade Cabinets
    const arcadeColors = ['#f43f5e', '#8b5cf6', '#eab308'];
    arcadeColors.forEach((color, i) => {
      const ax = 1040 + i * 65;
      ctx.fillStyle = color;
      this.roundRect(ctx, ax, 1820, 55, 80, 8, true, true);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.fillText('🕹️', ax + 18, 1865);
    });
  }

  renderGymRoom(ctx) {
    // Gym & Fitness Center
    // Treadmills
    [2300, 2600, 2900].forEach((tx, idx) => {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      this.roundRect(ctx, tx, 1520, 180, 80, 8, true, true);

      // Belt
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, tx + 20, tx > 0 ? 1535 : 0, 140, 50, 4, true, false);

      ctx.fillStyle = '#f87171';
      ctx.font = '11px sans-serif';
      ctx.fillText(`TREADMILL #${idx + 1} 🏃`, tx + 40, 1565);
    });

    // Workout Mats & Dumbbells
    ctx.fillStyle = '#3b82f6';
    this.roundRect(ctx, 2350, 1720, 200, 140, 10, true, false);
    ctx.fillStyle = '#10b981';
    this.roundRect(ctx, 2650, 1720, 200, 140, 10, true, false);

    // Punching bag
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(3000, 1780, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('🥊', 2992, 1785);
  }

  renderGarden(ctx) {
    // Balcony / Zen Garden
    ctx.fillStyle = '#065f46';
    this.roundRect(ctx, 800, 950, 900, 410, 16, true, false);

    // Large Center Fountain
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(1270, 1160, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(1270, 1160, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText('⛲', 1258, 1168);
  }

  renderChairs(ctx) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    this.chairs.forEach(chair => {
      ctx.beginPath();
      ctx.arc(chair.x, chair.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      if (chair.facing === 'down') {
        ctx.arc(chair.x, chair.y - 6, 9, Math.PI, Math.PI * 2, false);
      } else if (chair.facing === 'up') {
        ctx.arc(chair.x, chair.y + 6, 9, 0, Math.PI, false);
      } else if (chair.facing === 'left') {
        ctx.arc(chair.x + 6, chair.y, 9, -Math.PI / 2, Math.PI / 2, false);
      } else if (chair.facing === 'right') {
        ctx.arc(chair.x - 6, chair.y, 9, Math.PI / 2, (3 * Math.PI) / 2, false);
      }
      ctx.fill();
    });
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}

window.OfficeMap = OfficeMap;
