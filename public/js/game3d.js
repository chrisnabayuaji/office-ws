// 3D Game Client Engine (Three.js Harvest Moon / Isometric Perspective)

class Game3D {
  constructor(container) {
    this.container = container;
    this.selfId = null;
    this.players = {}; // { id: { data, model: Character3D } }

    // 1. Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.008);

    // 2. Isometric Perspective Camera (Harvest Moon 45-degree angle)
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.cameraOffset = new THREE.Vector3(0, 24, 24);

    // 3. WebGL Renderer with Soft Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup (Warm Sunlight + Soft Ambient)
    this.setupLighting();

    // 5. 3D Office Map
    this.map = new OfficeMap3D(this.scene);

    // 6. Raycaster for Click-to-Move on 3D Ground
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.targetPos = null;

    // Click Marker ring
    const markerGeo = new THREE.RingGeometry(0.5, 0.8, 24);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    this.targetMarker = new THREE.Mesh(markerGeo, markerMat);
    this.targetMarker.rotation.x = -Math.PI / 2;
    this.targetMarker.position.y = 0.05;
    this.targetMarker.visible = false;
    this.scene.add(this.targetMarker);

    // Controls
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
    };
    this.speed = 0.22;
    this.currentInteractive = null;

    this.bindInputs();
    this.initResize();

    this.lastTime = performance.now();
    this.stepTimer = 0;
    this.sleepTimer = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient Light (Cozy warm room fill)
    const ambientLight = new THREE.AmbientLight(0xe0e7ff, 0.85);
    this.scene.add(ambientLight);

    // Directional Sunlight (Casts soft 3D shadows)
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.1);
    sunLight.position.set(40, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -90;
    sunLight.shadow.camera.right = 90;
    sunLight.shadow.camera.top = 70;
    sunLight.shadow.camera.bottom = -70;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Subtle colored point lights for atmosphere
    // Arcade / TV Neon glow
    const neonLight = new THREE.PointLight(0xa855f7, 1.5, 35);
    neonLight.position.set(-15, 6, 30);
    this.scene.add(neonLight);

    // Billiard Warm Light
    const billLight = new THREE.PointLight(0xf59e0b, 1.2, 35);
    billLight.position.set(46, 7, 28);
    this.scene.add(billLight);

    // Zen Fountain Blue glow
    const waterLight = new THREE.PointLight(0x38bdf8, 1.2, 25);
    waterLight.position.set(-5, 4, 7);
    this.scene.add(waterLight);
  }

  initResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.key in this.keys) {
        this.keys[e.key] = true;
        this.targetPos = null;
        this.targetMarker.visible = false;
        const me = this.players[this.selfId];
        if (me) {
          me.model.isSitting = false;
          me.model.isSleeping = false;
        }
      }

      // [E] or Space for interaction
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        this.triggerInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key in this.keys) {
        this.keys[e.key] = false;
      }
    });

    // Click / Tap to move on 3D Ground
    window.addEventListener('pointerdown', (e) => {
      if (e.target !== this.renderer.domElement) return;
      if (document.querySelector('.sidebar-panel.open')) return;
      if (document.querySelector('.whiteboard-modal.open')) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const target = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.groundPlane, target);

      if (target) {
        this.targetPos = new THREE.Vector2(target.x, target.z);
        this.targetMarker.position.set(target.x, 0.05, target.z);
        this.targetMarker.visible = true;

        const me = this.players[this.selfId];
        if (me) {
          me.model.isSitting = false;
          me.model.isSleeping = false;
        }
      }
    });
  }

  setSelf(selfId, initialPlayers) {
    this.selfId = selfId;

    // Clear old
    Object.values(this.players).forEach(p => p.model.destroy());
    this.players = {};

    Object.entries(initialPlayers || {}).forEach(([id, data]) => {
      this.addPlayer(id, data);
    });

    const me = this.players[selfId];
    if (me) {
      this.camera.position.copy(me.model.group.position).add(this.cameraOffset);
      this.camera.lookAt(me.model.group.position);
    }
  }

  addPlayer(id, data) {
    // 3D coordinates: data.x, data.y (which is z in 3D world)
    const model = new Character3D(this.scene, {
      username: data.username,
      avatarColor: data.avatarColor,
      avatarSkin: data.avatarSkin,
      avatarHair: data.avatarHair,
      status: data.status,
      statusEmoji: data.statusEmoji
    });

    // Map 2D coordinate range to 3D world
    const posX = data.x3d !== undefined ? data.x3d : (data.x - 1700) * 0.045;
    const posZ = data.z3d !== undefined ? data.z3d : (data.y - 1100) * 0.045;

    model.group.position.set(posX, 0, posZ);
    model.isSitting = data.isSitting || false;
    model.isSleeping = data.isSleeping || false;

    this.players[id] = {
      data,
      model,
      targetX: posX,
      targetZ: posZ,
      targetRotY: 0
    };
  }

  updatePlayer(data) {
    if (!this.players[data.id]) {
      this.addPlayer(data.id, data);
    } else {
      const p = this.players[data.id];
      if (data.x3d !== undefined && data.z3d !== undefined) {
        p.targetX = data.x3d;
        p.targetZ = data.z3d;
      }
      p.model.isMoving = data.isMoving;
      p.model.isSitting = data.isSitting;
      p.model.isSleeping = data.isSleeping;
      if (data.rotY !== undefined) {
        p.targetRotY = data.rotY;
      }
    }
  }

  removePlayer(id) {
    if (this.players[id]) {
      this.players[id].model.destroy();
      delete this.players[id];
    }
  }

  showEmote(id, emote) {
    const p = this.players[id];
    if (p) {
      p.model.showEmote(emote);
    }
  }

  showSpeech(id, text) {
    const p = this.players[id];
    if (p) {
      p.model.showSpeech(text);
    }
  }

  triggerInteraction() {
    if (!this.currentInteractive) return;

    const me = this.players[this.selfId];
    if (!me) return;

    const type = this.currentInteractive.type;

    // 1. Bed / Sleeping
    if (type === 'bed') {
      me.model.isSleeping = !me.model.isSleeping;
      me.model.isSitting = false;
      if (me.model.isSleeping) {
        me.model.group.position.set(this.currentInteractive.bedX, 0, this.currentInteractive.bedZ);
        this.targetPos = null;
        this.targetMarker.visible = false;
        if (window.soundFX) window.soundFX.playSleep();
        this.showEmote(this.selfId, '💤');
        if (window.appNetwork) window.appNetwork.sendEmote('💤');
      }
    }
    // 2. Billiards
    else if (type === 'billiard') {
      if (window.soundFX) window.soundFX.playBilliardHit();
      const ballEmotes = ['🎱', '🟢', '🟡', '🔴', '🏆'];
      const pick = ballEmotes[Math.floor(Math.random() * ballEmotes.length)];
      this.showEmote(this.selfId, pick);
      if (window.appNetwork) window.appNetwork.sendEmote(pick);
    }
    // 3. Darts
    else if (type === 'darts') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '🎯');
      if (window.appNetwork) window.appNetwork.sendEmote('🎯');
    }
    // 4. PS5 / Console
    else if (type === 'game_console') {
      if (window.soundFX) window.soundFX.playGaming();
      const gameEmotes = ['🎮', '🏆', '🔥', '⚡'];
      const pick = gameEmotes[Math.floor(Math.random() * gameEmotes.length)];
      this.showEmote(this.selfId, pick);
      if (window.appNetwork) window.appNetwork.sendEmote(pick);
    }
    // 5. Retro Arcade
    else if (type === 'arcade') {
      if (window.soundFX) window.soundFX.playGaming();
      this.showEmote(this.selfId, '🕹️');
      if (window.appNetwork) window.appNetwork.sendEmote('🕹️');
    }
    // 6. Ping Pong
    else if (type === 'pingpong') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '🏓');
      if (window.appNetwork) window.appNetwork.sendEmote('🏓');
    }
    // 7. Gym Treadmill & Punching Bag
    else if (type === 'gym') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '💪');
      if (window.appNetwork) window.appNetwork.sendEmote('💪');
    } else if (type === 'punch') {
      if (window.soundFX) window.soundFX.playBilliardHit();
      this.showEmote(this.selfId, '🥊');
      if (window.appNetwork) window.appNetwork.sendEmote('🥊');
    }
    // 8. Coffee & Water
    else if (type === 'coffee') {
      if (window.soundFX) window.soundFX.playCoffee();
      if (window.appNetwork) window.appNetwork.drinkCoffee();
      this.showEmote(this.selfId, '☕');
      if (window.appNetwork) window.appNetwork.sendEmote('☕');
    } else if (type === 'water') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '💧');
      if (window.appNetwork) window.appNetwork.sendEmote('💧');
    }
    // 9. Whiteboard
    else if (type === 'whiteboard') {
      if (window.openWhiteboard) window.openWhiteboard();
    }
    // 10. Chair
    else if (type === 'chair') {
      me.model.isSitting = true;
      me.model.isSleeping = false;
      me.model.group.position.set(this.currentInteractive.chairX, 0, this.currentInteractive.chairZ);
      me.model.group.rotation.y = this.currentInteractive.rotation;
      this.targetPos = null;
      this.targetMarker.visible = false;
    }
  }

  update(delta) {
    const me = this.players[this.selfId];
    if (!me) return;

    let moveX = 0;
    let moveZ = 0;

    // Keyboard Inputs
    if (this.keys.w || this.keys.ArrowUp) moveZ -= 1;
    if (this.keys.s || this.keys.ArrowDown) moveZ += 1;
    if (this.keys.a || this.keys.ArrowLeft) moveX -= 1;
    if (this.keys.d || this.keys.ArrowRight) moveX += 1;

    let isMoving = false;

    if (moveX !== 0 || moveZ !== 0) {
      me.model.isSitting = false;
      me.model.isSleeping = false;
      isMoving = true;

      // Normalize diagonal
      const len = Math.hypot(moveX, moveZ);
      moveX = (moveX / len) * this.speed;
      moveZ = (moveZ / len) * this.speed;

      // Rotate character towards movement direction
      const targetAngle = Math.atan2(moveX, moveZ);
      me.model.group.rotation.y = targetAngle;
    } else if (this.targetPos && !me.model.isSitting && !me.model.isSleeping) {
      // Click to move
      const dx = this.targetPos.x - me.model.group.position.x;
      const dz = this.targetPos.y - me.model.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.4) {
        isMoving = true;
        moveX = (dx / dist) * Math.min(this.speed, dist);
        moveZ = (dz / dist) * Math.min(this.speed, dist);
        const targetAngle = Math.atan2(dx, dz);
        me.model.group.rotation.y = targetAngle;
      } else {
        this.targetPos = null;
        this.targetMarker.visible = false;
      }
    }

    // Apply movement with 3D collision check
    if (isMoving) {
      const curX = me.model.group.position.x;
      const curZ = me.model.group.position.z;

      const nextX = curX + moveX;
      const nextZ = curZ + moveZ;

      if (!this.map.isColliding(nextX, curZ, 0.8)) {
        me.model.group.position.x = nextX;
      }
      if (!this.map.isColliding(curX, nextZ, 0.8)) {
        me.model.group.position.z = nextZ;
      }

      this.stepTimer += delta;
      if (this.stepTimer > 280) {
        if (window.soundFX) window.soundFX.playStep();
        this.stepTimer = 0;
      }
    }

    // Sleeping periodic Zzz
    if (me.model.isSleeping) {
      this.sleepTimer += delta;
      if (this.sleepTimer > 3000) {
        this.showEmote(this.selfId, '💤');
        this.sleepTimer = 0;
      }
    }

    me.model.isMoving = isMoving;
    const currentZone = this.map.getZone(me.model.group.position.x, me.model.group.position.z);
    me.data.zone = currentZone;

    // Check nearby interactive
    this.currentInteractive = this.map.getNearbyInteractive(
      me.model.group.position.x,
      me.model.group.position.z
    );
    this.updateInteractionUI(this.currentInteractive);

    // Broadcast 3D player position over network
    if (window.appNetwork) {
      window.appNetwork.sendMove({
        x3d: Math.round(me.model.group.position.x * 100) / 100,
        z3d: Math.round(me.model.group.position.z * 100) / 100,
        rotY: Math.round(me.model.group.rotation.y * 100) / 100,
        isMoving: me.model.isMoving,
        isSitting: me.model.isSitting,
        isSleeping: me.model.isSleeping,
        zone: me.data.zone
      });
    }

    // Interpolate remote players
    Object.entries(this.players).forEach(([id, p]) => {
      if (id === this.selfId) {
        p.model.update(delta);
        return;
      }

      p.model.group.position.x += (p.targetX - p.model.group.position.x) * 0.25;
      p.model.group.position.z += (p.targetZ - p.model.group.position.z) * 0.25;
      p.model.group.rotation.y = THREE.MathUtils.lerp(p.model.group.rotation.y, p.targetRotY, 0.25);
      p.model.update(delta);
    });

    // Smooth Camera Follow (Harvest Moon 45-degree angle)
    const targetCamPos = me.model.group.position.clone().add(this.cameraOffset);
    this.camera.position.lerp(targetCamPos, 0.08);
    this.camera.lookAt(
      me.model.group.position.x,
      me.model.group.position.y + 1,
      me.model.group.position.z
    );
  }

  updateInteractionUI(obj) {
    const promptEl = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');
    if (!promptEl || !promptText) return;

    if (obj) {
      promptText.innerText = obj.prompt;
      promptEl.classList.add('show');
    } else {
      promptEl.classList.remove('show');
    }
  }

  animate(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate);
  }
}

window.Game3D = Game3D;
