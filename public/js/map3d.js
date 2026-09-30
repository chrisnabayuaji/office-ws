// 3D Office Architecture & Furniture Builder (Harvest Moon / Isometric Style)

class OfficeMap3D {
  constructor(scene) {
    this.scene = scene;
    this.width = 160;
    this.depth = 110;

    // Room boundaries (in 3D coordinates, center at 0,0)
    // Offset so coordinates map naturally
    this.zones = [
      { id: 'lobby', name: 'Lobby & Reception', xMin: -70, xMax: -35, zMin: -50, zMax: -20, color: 0x1e293b },
      { id: 'workspace', name: 'Open Workspace (Tech Hub)', xMin: -30, xMax: 20, zMin: -50, zMax: -10, color: 0x182234 },
      { id: 'meeting_alpha', name: 'Meeting Room Alpha', xMin: 25, xMax: 68, zMin: -50, zMax: -20, color: 0x0f292c },
      { id: 'meeting_beta', name: 'Meeting Room Beta', xMin: 25, xMax: 68, zMin: -18, zMax: 8, color: 0x113536 },
      { id: 'pantry', name: 'Pantry & Café Lounge', xMin: -70, xMax: -35, zMin: -15, zMax: 18, color: 0x241e38 },
      { id: 'garden', name: 'Zen Balcony & Garden', xMin: -30, xMax: 20, zMin: -5, zMax: 20, color: 0x0f382a },
      { id: 'billiard', name: 'Ruang Billiard & Lounge', xMin: 25, xMax: 68, zMin: 12, zMax: 48, color: 0x1b2a4a },
      { id: 'nap_room', name: 'Ruang Tidur & Nap Room', xMin: -70, xMax: -35, zMin: 22, zMax: 48, color: 0x2e1c3b },
      { id: 'game_room', name: 'Ruang Game & Esports', xMin: -30, xMax: 0, zMin: 24, zMax: 48, color: 0x131b2e },
      { id: 'gym', name: 'Gym & Fitness Center', xMin: 2, xMax: 22, zMin: 24, zMax: 48, color: 0x281a1a }
    ];

    // Colliders for 3D navigation (bounding boxes: minX, maxX, minZ, maxZ)
    this.colliders = [];
    this.interactiveObjects = [];
    this.chairs = [];
    this.beds = [];

    this.buildGround();
    this.buildWalls();
    this.buildFurniture();
    this.buildBilliardRoom();
    this.buildNapRoom();
    this.buildGameRoom();
    this.buildGym();
    this.buildGarden();
  }

  buildGround() {
    // Outer base plate
    const baseGeo = new THREE.BoxGeometry(164, 2, 114);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x090d16 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1;
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // Floor tiles for each zone
    this.zones.forEach(z => {
      const w = z.xMax - z.xMin;
      const d = z.zMax - z.zMin;
      const floorGeo = new THREE.PlaneGeometry(w, d);
      const floorMat = new THREE.MeshLambertMaterial({ color: z.color });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set((z.xMin + z.xMax) / 2, 0.01, (z.zMin + z.zMax) / 2);
      floor.receiveShadow = true;
      this.scene.add(floor);
    });

    // Outer Hallways Floor
    const hwMat = new THREE.MeshLambertMaterial({ color: 0x101626 });
    const hwGeo = new THREE.PlaneGeometry(156, 106);
    const hw = new THREE.Mesh(hwGeo, hwMat);
    hw.rotation.x = -Math.PI / 2;
    hw.position.set(0, 0, 0);
    hw.receiveShadow = true;
    this.scene.add(hw);
  }

  buildWalls() {
    // Cutaway low-poly stylized walls (height 2.5) so interior is fully visible!
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const wallCapMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });

    const createWall = (x, z, w, d) => {
      const geo = new THREE.BoxGeometry(w, 2.2, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, 1.1, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Top edge glow
      const capGeo = new THREE.BoxGeometry(w, 0.15, d);
      const cap = new THREE.Mesh(capGeo, wallCapMat);
      cap.position.set(x, 2.25, z);
      this.scene.add(cap);

      this.colliders.push({
        minX: x - w / 2, maxX: x + w / 2,
        minZ: z - d / 2, maxZ: z + d / 2
      });
    };

    // Outer boundaries
    createWall(0, -52, 160, 2); // Top wall
    createWall(0, 52, 160, 2);  // Bottom wall
    createWall(-75, 0, 2, 104); // Left wall
    createWall(75, 0, 2, 104);  // Right wall

    // Internal Dividers with doorways
    // Wall between Lobby/Pantry/Nap and Middle
    createWall(-33, -35, 1.5, 30);
    createWall(-33, 5, 1.5, 25);
    createWall(-33, 40, 1.5, 20);

    // Wall between Middle and Meeting/Billiard
    createWall(22, -35, 1.5, 30);
    createWall(22, 0, 1.5, 20);
    createWall(22, 35, 1.5, 25);

    // Horizontal Dividers
    createWall(-53, -17, 38, 1.5); // Lobby / Pantry
    createWall(-53, 20, 38, 1.5);  // Pantry / Nap Room
    createWall(46, -19, 46, 1.5);  // Meeting Alpha / Beta
    createWall(46, 10, 46, 1.5);   // Meeting Beta / Billiard
    createWall(1, 22, 42, 1.5);    // Workspace / Game & Gym
    createWall(1, 22, 42, 1.5);
  }

  buildFurniture() {
    // 1. Reception Desk
    this.createBox(-52, -35, 12, 3.5, 1.3, 0x475569);
    // Computer on desk
    this.createMonitor(-55, -35, 0);
    this.createMonitor(-49, -35, 0);
    // Couches in Lobby
    this.createCouch(-65, -42, 3, 8, 0x3b82f6);
    this.createCouch(-65, -28, 3, 8, 0x3b82f6);

    // 2. Open Workspace Desks (8 Clusters)
    const deskConfigs = [
      { x: -18, z: -40 }, { x: 5, z: -40 },
      { x: -18, z: -28 }, { x: 5, z: -28 },
      { x: -18, z: -16 }, { x: 5, z: -16 }
    ];

    deskConfigs.forEach(d => {
      // Wooden desk
      this.createBox(d.x, d.z, 14, 6, 1.2, 0x334155);
      // Center divider partition
      this.createBox(d.x, d.z, 13.5, 0.4, 1.8, 0x475569);

      // Monitors (4 per cluster)
      this.createMonitor(d.x - 3.5, d.z - 1.8, 0);
      this.createMonitor(d.x + 3.5, d.z - 1.8, 0);
      this.createMonitor(d.x - 3.5, d.z + 1.8, Math.PI);
      this.createMonitor(d.x + 3.5, d.z + 1.8, Math.PI);

      // Office Chairs
      this.addChair(d.x - 3.5, d.z - 4.2, 0);
      this.addChair(d.x + 3.5, d.z - 4.2, 0);
      this.addChair(d.x - 3.5, d.z + 4.2, Math.PI);
      this.addChair(d.x + 3.5, d.z + 4.2, Math.PI);
    });

    // 3. Meeting Room Alpha
    // Large Conference Table
    this.createBox(46, -35, 20, 10, 1.2, 0x1e293b, 0x14b8a6);
    // 3D Whiteboard on Wall
    const wbGeo = new THREE.BoxGeometry(16, 4.5, 0.3);
    const wbMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const wb = new THREE.Mesh(wbGeo, wbMat);
    wb.position.set(46, 3.2, -50.8);
    this.scene.add(wb);

    this.interactiveObjects.push({
      id: 'whiteboard_alpha',
      type: 'whiteboard',
      x: 46, z: -46,
      prompt: 'Tekan [E] untuk Buka Whiteboard Rapat 📝'
    });

    // Meeting Chairs
    for (let i = 0; i < 4; i++) {
      this.addChair(38 + i * 5, -42, 0);
      this.addChair(38 + i * 5, -28, Math.PI);
    }

    // 4. Pantry Counter & Coffee
    this.createBox(-53, -14, 30, 3.5, 1.3, 0x334155);

    // Coffee Machine (Red 3D model)
    const coffeeGeo = new THREE.BoxGeometry(2, 2, 2.2);
    const coffeeMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.set(-58, 2.3, -14);
    coffee.castShadow = true;
    this.scene.add(coffee);

    this.interactiveObjects.push({
      id: 'coffee_machine',
      type: 'coffee',
      x: -58, z: -11,
      prompt: 'Tekan [E] untuk Ambil Kopi Hangat ☕'
    });

    // Water Dispenser
    const waterGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.8, 16);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(-40, 2.2, -14);
    this.scene.add(water);

    this.interactiveObjects.push({
      id: 'water_cooler',
      type: 'water',
      x: -40, z: -11,
      prompt: 'Tekan [E] untuk Minum Air Segar 💧'
    });
  }

  buildBilliardRoom() {
    // 2 3D Billiard Tables (Green Felt & Blue Felt)
    this.createBilliardTable(38, 26, 0x15803d, 'billiard_1', 'Meja Billiard #1 🎱');
    this.createBilliardTable(55, 26, 0x1d4ed8, 'billiard_2', 'Meja Billiard #2 🎱');

    // Dartboard on Wall
    const dartGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 24);
    const dartMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const dart = new THREE.Mesh(dartGeo, dartMat);
    dart.rotation.x = Math.PI / 2;
    dart.position.set(68, 3.5, 20);
    this.scene.add(dart);

    this.interactiveObjects.push({
      id: 'darts',
      type: 'darts',
      x: 65, z: 20,
      prompt: 'Tekan [E] untuk Lempar Dart 🎯'
    });

    // Billiard Bar Counter & Stools
    this.createBox(46, 44, 34, 3, 1.4, 0x475569);
    for (let i = 0; i < 5; i++) {
      this.addChair(34 + i * 6, 40, 0);
    }
  }

  createBilliardTable(x, z, feltColor, id, name) {
    // Table Wood Base
    const baseGeo = new THREE.BoxGeometry(11, 1.3, 7);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x582f0e });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.65, z);
    base.castShadow = true;
    this.scene.add(base);

    // Felt Bed
    const feltGeo = new THREE.BoxGeometry(9.6, 0.2, 5.6);
    const feltMat = new THREE.MeshLambertMaterial({ color: feltColor });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.position.set(x, 1.35, z);
    this.scene.add(felt);

    // 3D Billiard Balls
    const ballGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });

    const cueBall = new THREE.Mesh(ballGeo, whiteMat);
    cueBall.position.set(x - 2.5, 1.55, z);
    this.scene.add(cueBall);

    const b1 = new THREE.Mesh(ballGeo, redMat);
    b1.position.set(x + 2, 1.55, z);
    this.scene.add(b1);

    const b2 = new THREE.Mesh(ballGeo, yellowMat);
    b2.position.set(x + 2.4, 1.55, z - 0.25);
    this.scene.add(b2);

    this.colliders.push({
      minX: x - 5.5, maxX: x + 5.5,
      minZ: z - 3.5, maxZ: z + 3.5
    });

    this.interactiveObjects.push({
      id: id,
      type: 'billiard',
      x: x, z: z,
      prompt: `Tekan [E] untuk Main ${name}`
    });
  }

  buildNapRoom() {
    // 6 3D Cozy Beds with Frame, Mattress, Pillow & Blanket
    const bedLocations = [
      { x: -62, z: 28, num: 1 }, { x: -50, z: 28, num: 2 }, { x: -38, z: 28, num: 3 },
      { x: -62, z: 42, num: 4 }, { x: -50, z: 42, num: 5 }, { x: -38, z: 42, num: 6 }
    ];

    bedLocations.forEach(b => {
      // Wood Frame
      this.createBox(b.x, b.z, 7, 10, 0.8, 0x451a03);

      // Mattress
      const matGeo = new THREE.BoxGeometry(6.2, 0.8, 9.2);
      const matMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
      const mattress = new THREE.Mesh(matGeo, matMat);
      mattress.position.set(b.x, 0.9, b.z);
      this.scene.add(mattress);

      // Blanket (Indigo / Purple)
      const blkGeo = new THREE.BoxGeometry(6.2, 0.82, 6.5);
      const blkMat = new THREE.MeshLambertMaterial({ color: 0x6366f1 });
      const blanket = new THREE.Mesh(blkGeo, blkMat);
      blanket.position.set(b.x, 0.92, b.z + 1.3);
      this.scene.add(blanket);

      // Pillow
      const pilGeo = new THREE.BoxGeometry(4.5, 0.4, 1.8);
      const pilMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const pillow = new THREE.Mesh(pilGeo, pilMat);
      pillow.position.set(b.x, 1.4, b.z - 3.2);
      this.scene.add(pillow);

      this.colliders.push({
        minX: b.x - 3.5, maxX: b.x + 3.5,
        minZ: b.z - 5, maxZ: b.z + 5
      });

      this.beds.push({
        id: 'bed_' + b.num,
        x: b.x,
        z: b.z - 0.5,
        prompt: `Tekan [E] untuk Tidur di Kasur #${b.num} 🛏️💤`
      });
    });
  }

  buildGameRoom() {
    // 1. 85" 3D OLED TV Screen
    const tvGeo = new THREE.BoxGeometry(14, 6, 0.5);
    const tvMat = new THREE.MeshLambertMaterial({ color: 0x020617 });
    const tv = new THREE.Mesh(tvGeo, tvMat);
    tv.position.set(-15, 4.2, 24);
    this.scene.add(tv);

    // Glowing TV Screen Display
    const screenGeo = new THREE.PlaneGeometry(13.2, 5.2);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-15, 4.2, 24.3);
    this.scene.add(screen);

    // Plush Violet Gaming Couch
    this.createCouch(-15, 33, 14, 4, 0x7e22ce);
    this.addChair(-18, 33, 0);
    this.addChair(-15, 33, 0);
    this.addChair(-12, 33, 0);

    this.interactiveObjects.push({
      id: 'game_console',
      type: 'game_console',
      x: -15, z: 30,
      prompt: 'Tekan [E] untuk Main PS5 / Xbox Console 🎮'
    });

    // 2. Retro Arcade Cabinets
    const arcadeColors = [0xf43f5e, 0x8b5cf6, 0xeab308];
    arcadeColors.forEach((color, i) => {
      const ax = -26 + i * 3.5;
      const arcGeo = new THREE.BoxGeometry(2.4, 4.5, 2.5);
      const arcMat = new THREE.MeshLambertMaterial({ color: color });
      const arcade = new THREE.Mesh(arcGeo, arcMat);
      arcade.position.set(ax, 2.25, 46);
      arcade.castShadow = true;
      this.scene.add(arcade);

      this.interactiveObjects.push({
        id: 'arcade_' + i,
        type: 'arcade',
        x: ax, z: 42,
        prompt: 'Tekan [E] untuk Main Retro Arcade 🕹️'
      });
    });

    // 3. 3D Ping Pong Table
    this.createBox(-15, 44, 10, 6, 1.2, 0x047857, 0xffffff);
    this.interactiveObjects.push({
      id: 'ping_pong',
      type: 'pingpong',
      x: -15, z: 44,
      prompt: 'Tekan [E] untuk Main Tenis Meja Ping Pong 🏓'
    });
  }

  buildGym() {
    // 3 3D Treadmills
    [6, 12, 18].forEach((tx, idx) => {
      const tmGeo = new THREE.BoxGeometry(3, 1.2, 6);
      const tmMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const tm = new THREE.Mesh(tmGeo, tmMat);
      tm.position.set(tx, 0.6, 29);
      this.scene.add(tm);

      this.interactiveObjects.push({
        id: 'treadmill_' + idx,
        type: 'gym',
        x: tx, z: 33,
        prompt: `Tekan [E] untuk Lari di Treadmill #${idx + 1} 🏃`
      });
    });

    // Red Hanging Punching Bag
    const bagGeo = new THREE.CylinderGeometry(1, 1, 3.5, 16);
    const bagMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.set(12, 3.5, 42);
    bag.castShadow = true;
    this.scene.add(bag);

    this.interactiveObjects.push({
      id: 'punch_bag',
      type: 'punch',
      x: 12, z: 42,
      prompt: 'Tekan [E] untuk Pukul Sansak Tinju 🥊'
    });
  }

  buildGarden() {
    // Balcony / Zen Garden with 3-tier 3D Fountain
    const fountainBaseGeo = new THREE.CylinderGeometry(4.5, 4.5, 1, 24);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const fBase = new THREE.Mesh(fountainBaseGeo, waterMat);
    fBase.position.set(-5, 0.5, 7);
    this.scene.add(fBase);

    const fMidGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.2, 24);
    const fMid = new THREE.Mesh(fMidGeo, waterMat);
    fMid.position.set(-5, 1.4, 7);
    this.scene.add(fMid);

    this.colliders.push({
      minX: -9.5, maxX: -0.5,
      minZ: 2.5, maxZ: 11.5
    });

    // Potted Bonsai Plants
    [
      [-24, -48], [15, -48], [65, -48],
      [-24, 15], [15, 15], [-24, 48], [18, 48]
    ].forEach(p => {
      // Pot
      const potGeo = new THREE.CylinderGeometry(1, 0.7, 1.4, 12);
      const potMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(p[0], 0.7, p[1]);
      this.scene.add(pot);

      // Leaves Sphere
      const leafGeo = new THREE.SphereGeometry(1.4, 12, 12);
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x10b981 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(p[0], 2.2, p[1]);
      leaf.castShadow = true;
      this.scene.add(leaf);
    });
  }

  createBox(x, z, w, d, h, color, edgeColor = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.colliders.push({
      minX: x - w / 2, maxX: x + w / 2,
      minZ: z - d / 2, maxZ: z + d / 2
    });
    return mesh;
  }

  createMonitor(x, z, rotation) {
    const monGeo = new THREE.BoxGeometry(2.4, 1.4, 0.2);
    const monMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const mon = new THREE.Mesh(monGeo, monMat);
    mon.position.set(x, 1.9, z);
    mon.rotation.y = rotation;
    this.scene.add(mon);

    // Screen Glow
    const scrGeo = new THREE.PlaneGeometry(2.2, 1.2);
    const scrMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.position.set(x, 1.9, z + (rotation === 0 ? 0.12 : -0.12));
    scr.rotation.y = rotation;
    this.scene.add(scr);
  }

  createCouch(x, z, w, d, color) {
    const cGeo = new THREE.BoxGeometry(w, 1.4, d);
    const cMat = new THREE.MeshLambertMaterial({ color });
    const couch = new THREE.Mesh(cGeo, cMat);
    couch.position.set(x, 0.7, z);
    couch.castShadow = true;
    this.scene.add(couch);

    this.colliders.push({
      minX: x - w / 2, maxX: x + w / 2,
      minZ: z - d / 2, maxZ: z + d / 2
    });
  }

  addChair(x, z, rotation) {
    const chairGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.7, 12);
    const chairMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const chair = new THREE.Mesh(chairGeo, chairMat);
    chair.position.set(x, 0.35, z);
    chair.castShadow = true;
    this.scene.add(chair);

    this.chairs.push({ x, z, rotation });
  }

  getZone(x, z) {
    for (const zZone of this.zones) {
      if (x >= zZone.xMin && x <= zZone.xMax && z >= zZone.zMin && z <= zZone.zMax) {
        return zZone.name;
      }
    }
    return 'Office Hallway';
  }

  isColliding(x, z, radius = 0.8) {
    for (const c of this.colliders) {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  getNearbyInteractive(x, z, range = 3.8) {
    // 1. Beds (Sleep)
    for (const bed of this.beds) {
      const dist = Math.hypot(bed.x - x, bed.z - z);
      if (dist < 4.2) {
        return {
          id: bed.id,
          type: 'bed',
          name: 'Cozy Bed',
          bedX: bed.x,
          bedZ: bed.z,
          prompt: bed.prompt
        };
      }
    }

    // 2. Interactive Objects
    for (const obj of this.interactiveObjects) {
      const dist = Math.hypot(obj.x - x, obj.z - z);
      if (dist < range) {
        return obj;
      }
    }

    // 3. Chairs
    for (const chair of this.chairs) {
      const dist = Math.hypot(chair.x - x, chair.z - z);
      if (dist < 2.5) {
        return {
          id: 'chair_' + chair.x + '_' + chair.z,
          type: 'chair',
          name: 'Office Chair',
          chairX: chair.x,
          chairZ: chair.z,
          rotation: chair.rotation,
          prompt: 'Tekan [E] untuk Duduk Santai 🪑'
        };
      }
    }
    return null;
  }
}

window.OfficeMap3D = OfficeMap3D;
