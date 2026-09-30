// Virtual Office Game Client Engine (With Sleeping, Billiards, Gaming & Gym)

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.map = new OfficeMap();
    this.selfId = null;
    this.players = {};

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      zoom: 1
    };

    // Input state
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
    };

    // Local player movement speed
    this.speed = 3.6;
    this.isSitting = false;
    this.isSleeping = false;
    this.targetPos = null; // Click to move destination

    // Nearby interaction
    this.currentInteractive = null;

    // Emote floaters: { id, emote, x, y, startTime, duration }
    this.activeEmotes = [];
    // Speech bubbles: { id, text, startTime, duration }
    this.speechBubbles = {};

    this.initCanvasSize();
    this.bindInputs();

    // Start rendering loop
    this.lastFrameTime = performance.now();
    this.stepTimer = 0;
    this.sleepEmoteTimer = 0;
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initCanvasSize() {
    const resize = () => {
      this.canvas.width = window.innerWidth * window.devicePixelRatio;
      this.canvas.height = window.innerHeight * window.devicePixelRatio;
      this.ctx.imageSmoothingEnabled = false;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.key in this.keys) {
        this.keys[e.key] = true;
        this.targetPos = null;
        if (this.isSitting) this.isSitting = false;
        if (this.isSleeping) this.isSleeping = false;
      }

      // Interaction key [E] or Space
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        this.triggerInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key in this.keys) {
        this.keys[e.key] = false;
      }
    });

    // Click / Tap to move
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.target !== this.canvas) return;
      if (document.querySelector('.sidebar-panel.open')) return;
      if (document.querySelector('.whiteboard-modal.open')) return;

      const rect = this.canvas.getBoundingClientRect();
      const clickScreenX = (e.clientX - rect.left) * window.devicePixelRatio;
      const clickScreenY = (e.clientY - rect.top) * window.devicePixelRatio;

      // Convert Screen coords to World coords
      const worldX = clickScreenX - (this.canvas.width / 2 - this.camera.x);
      const worldY = clickScreenY - (this.canvas.height / 2 - this.camera.y);

      this.targetPos = { x: worldX, y: worldY };
      this.isSitting = false;
      this.isSleeping = false;
    });
  }

  setSelf(selfId, initialPlayers) {
    this.selfId = selfId;
    this.players = initialPlayers || {};
    const me = this.players[selfId];
    if (me) {
      this.camera.x = me.x;
      this.camera.y = me.y;
    }
  }

  updatePlayer(data) {
    if (!this.players[data.id]) {
      this.players[data.id] = data;
    } else {
      const p = this.players[data.id];
      p.targetX = data.x;
      p.targetY = data.y;
      p.direction = data.direction || p.direction;
      p.isMoving = data.isMoving;
      p.zone = data.zone || p.zone;
      p.isSitting = data.isSitting;
      p.isSleeping = data.isSleeping;
    }
  }

  removePlayer(id) {
    delete this.players[id];
  }

  showEmote(playerId, emote) {
    const p = this.players[playerId];
    if (!p) return;
    this.activeEmotes.push({
      playerId,
      emote,
      x: p.x,
      y: p.y - 45,
      startTime: performance.now(),
      duration: 2500
    });
  }

  showSpeech(playerId, text) {
    this.speechBubbles[playerId] = {
      text,
      startTime: performance.now(),
      duration: Math.max(3500, text.length * 100)
    };
    if (window.soundFX) window.soundFX.playMessage();
  }

  triggerInteraction() {
    if (!this.currentInteractive) return;

    const me = this.players[this.selfId];
    if (!me) return;

    const type = this.currentInteractive.type;

    // 1. Bed / Sleeping
    if (type === 'bed') {
      this.isSleeping = !this.isSleeping;
      this.isSitting = false;
      if (this.isSleeping) {
        me.x = this.currentInteractive.bedX;
        me.y = this.currentInteractive.bedY;
        this.targetPos = null;
        if (window.soundFX) window.soundFX.playSleep();
        this.showEmote(this.selfId, '💤');
        if (window.appNetwork) window.appNetwork.sendEmote('💤');
      }
    }
    // 2. Billiard
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
    // 4. Game Console / PS5
    else if (type === 'game_console') {
      if (window.soundFX) window.soundFX.playGaming();
      const gameEmotes = ['🎮', '🏆', '🔥', '⚡'];
      const pick = gameEmotes[Math.floor(Math.random() * gameEmotes.length)];
      this.showEmote(this.selfId, pick);
      if (window.appNetwork) window.appNetwork.sendEmote(pick);
    }
    // 5. Esports PC
    else if (type === 'esports') {
      if (window.soundFX) window.soundFX.playGaming();
      const pcEmotes = ['👾', '🚀', '💻', '⚡'];
      const pick = pcEmotes[Math.floor(Math.random() * pcEmotes.length)];
      this.showEmote(this.selfId, pick);
      if (window.appNetwork) window.appNetwork.sendEmote(pick);
    }
    // 6. Retro Arcade
    else if (type === 'arcade') {
      if (window.soundFX) window.soundFX.playGaming();
      this.showEmote(this.selfId, '🕹️');
      if (window.appNetwork) window.appNetwork.sendEmote('🕹️');
    }
    // 7. Ping Pong
    else if (type === 'pingpong') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '🏓');
      if (window.appNetwork) window.appNetwork.sendEmote('🏓');
    }
    // 8. Gym / Fitness / Boxing
    else if (type === 'gym') {
      if (window.soundFX) window.soundFX.playPop();
      this.showEmote(this.selfId, '💪');
      if (window.appNetwork) window.appNetwork.sendEmote('💪');
    } else if (type === 'punch') {
      if (window.soundFX) window.soundFX.playBilliardHit();
      this.showEmote(this.selfId, '🥊');
      if (window.appNetwork) window.appNetwork.sendEmote('🥊');
    }
    // 9. Coffee & Water
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
    // 10. Whiteboard
    else if (type === 'whiteboard') {
      if (window.openWhiteboard) window.openWhiteboard();
    }
    // 11. Chair (Sitting)
    else if (type === 'chair') {
      this.isSitting = true;
      this.isSleeping = false;
      me.x = this.currentInteractive.chairX;
      me.y = this.currentInteractive.chairY;
      me.direction = this.currentInteractive.facing;
      this.targetPos = null;
    }
  }

  update(delta) {
    const me = this.players[this.selfId];
    if (!me) return;

    let moveX = 0;
    let moveY = 0;

    // Keyboard inputs
    if (this.keys.w || this.keys.ArrowUp) moveY -= 1;
    if (this.keys.s || this.keys.ArrowDown) moveY += 1;
    if (this.keys.a || this.keys.ArrowLeft) moveX -= 1;
    if (this.keys.d || this.keys.ArrowRight) moveX += 1;

    let isMoving = false;

    // Normal movement via keys
    if (moveX !== 0 || moveY !== 0) {
      this.isSitting = false;
      this.isSleeping = false;
      isMoving = true;
      const len = Math.hypot(moveX, moveY);
      moveX = (moveX / len) * this.speed;
      moveY = (moveY / len) * this.speed;

      if (Math.abs(moveX) > Math.abs(moveY)) {
        me.direction = moveX > 0 ? 'right' : 'left';
      } else {
        me.direction = moveY > 0 ? 'down' : 'up';
      }
    } else if (this.targetPos && !this.isSitting && !this.isSleeping) {
      // Click / Tap to move
      const dx = this.targetPos.x - me.x;
      const dy = this.targetPos.y - me.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        isMoving = true;
        moveX = (dx / dist) * Math.min(this.speed, dist);
        moveY = (dy / dist) * Math.min(this.speed, dist);

        if (Math.abs(dx) > Math.abs(dy)) {
          me.direction = dx > 0 ? 'right' : 'left';
        } else {
          me.direction = dy > 0 ? 'down' : 'up';
        }
      } else {
        this.targetPos = null;
      }
    }

    // Apply movement with collision check
    if (isMoving) {
      const nextX = me.x + moveX;
      const nextY = me.y + moveY;

      if (!this.map.isColliding(nextX, me.y, 14)) {
        me.x = nextX;
      }
      if (!this.map.isColliding(me.x, nextY, 14)) {
        me.y = nextY;
      }

      this.stepTimer += delta;
      if (this.stepTimer > 280) {
        if (window.soundFX) window.soundFX.playStep();
        this.stepTimer = 0;
      }
    }

    // Periodic sleep bubbles if sleeping
    if (this.isSleeping) {
      this.sleepEmoteTimer += delta;
      if (this.sleepEmoteTimer > 3000) {
        this.showEmote(this.selfId, '💤');
        this.sleepEmoteTimer = 0;
      }
    }

    me.isMoving = isMoving;
    me.isSitting = this.isSitting;
    me.isSleeping = this.isSleeping;
    const currentZone = this.map.getZone(me.x, me.y);
    me.zone = currentZone;

    // Check nearby interactive
    this.currentInteractive = this.map.getNearbyInteractive(me.x, me.y);
    this.updateInteractionUI(this.currentInteractive);

    // Broadcast local player movement to server
    if (window.appNetwork) {
      window.appNetwork.sendMove({
        x: Math.round(me.x),
        y: Math.round(me.y),
        direction: me.direction,
        isMoving: me.isMoving,
        zone: me.zone,
        isSitting: me.isSitting,
        isSleeping: me.isSleeping
      });
    }

    // Interpolate remote players for silky 60fps rendering
    Object.values(this.players).forEach(p => {
      if (p.id === this.selfId) return;

      if (p.targetX !== undefined && p.targetY !== undefined) {
        p.x += (p.targetX - p.x) * 0.25;
        p.y += (p.targetY - p.y) * 0.25;
      }

      if (p.isMoving) {
        p.animTick = (p.animTick || 0) + delta * 0.012;
      }
    });

    if (me.isMoving) {
      me.animTick = (me.animTick || 0) + delta * 0.012;
    }

    // Smooth Camera Follow
    const targetCamX = me.x;
    const targetCamY = me.y;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;
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

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Center camera
    ctx.translate(Math.floor(width / 2 - this.camera.x), Math.floor(height / 2 - this.camera.y));

    // 1. Render Map
    this.map.render(ctx, this.camera);

    // 2. Render Players
    const sortedPlayers = Object.values(this.players).sort((a, b) => a.y - b.y);
    sortedPlayers.forEach(p => {
      this.renderPlayer(ctx, p);
    });

    // 3. Render Speech Bubbles & Emotes
    sortedPlayers.forEach(p => {
      this.renderPlayerOverlays(ctx, p);
    });

    ctx.restore();
  }

  renderPlayer(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    const isSelf = p.id === this.selfId;
    const animTick = p.animTick || 0;
    const walkBob = p.isMoving ? Math.sin(animTick * 2) * 2 : 0;
    const legOffset = p.isMoving ? Math.sin(animTick * 2) * 5 : 0;

    // 1. Sleeping Avatar (Lying on bed)
    if (p.isSleeping) {
      this.renderSleepingAvatar(ctx, p);
      ctx.restore();
      return;
    }

    // 2. Soft Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Self Indicator Ring
    if (isSelf) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sitting Avatar
    if (p.isSitting) {
      this.renderSeatedAvatar(ctx, p);
      ctx.restore();
      return;
    }

    // 3. Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -6 + legOffset, 4, 10);
    ctx.fillRect(2, -6 - legOffset, 4, 10);

    // 4. Body / Clothes
    ctx.fillStyle = p.avatarColor || '#3b82f6';
    this.map.roundRect(ctx, -10, -22 + walkBob, 20, 16, 4, true, false);

    // Collar detail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -22 + walkBob, 4, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-1.5, -19 + walkBob, 3, 5);

    // 5. Head & Skin
    ctx.fillStyle = p.avatarSkin || '#ffd1a4';
    ctx.beginPath();
    ctx.arc(0, -28 + walkBob, 10, 0, Math.PI * 2);
    ctx.fill();

    // 6. Hair
    ctx.fillStyle = p.avatarHair || '#4a3728';
    ctx.beginPath();
    ctx.arc(0, -32 + walkBob, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -32 + walkBob, 20, 4);

    // 7. Face / Eyes
    ctx.fillStyle = '#1e293b';
    if (p.direction === 'down') {
      ctx.fillRect(-4, -28 + walkBob, 2.5, 3);
      ctx.fillRect(2, -28 + walkBob, 2.5, 3);
    } else if (p.direction === 'up') {
      ctx.fillStyle = p.avatarHair || '#4a3728';
      ctx.beginPath();
      ctx.arc(0, -28 + walkBob, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.direction === 'left') {
      ctx.fillRect(-6, -28 + walkBob, 2.5, 3);
    } else if (p.direction === 'right') {
      ctx.fillRect(4, -28 + walkBob, 2.5, 3);
    }

    ctx.restore();
  }

  renderSeatedAvatar(ctx, p) {
    ctx.fillStyle = p.avatarColor || '#3b82f6';
    this.map.roundRect(ctx, -9, -16, 18, 14, 4, true, false);

    ctx.fillStyle = p.avatarSkin || '#ffd1a4';
    ctx.beginPath();
    ctx.arc(0, -22, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.avatarHair || '#4a3728';
    ctx.beginPath();
    ctx.arc(0, -25, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, -25, 18, 3);

    ctx.fillStyle = '#1e293b';
    if (p.direction !== 'up') {
      ctx.fillRect(-3, -22, 2, 2.5);
      ctx.fillRect(2, -22, 2, 2.5);
    }
  }

  renderSleepingAvatar(ctx, p) {
    // Character tucked horizontally on bed pillow
    ctx.save();
    // Head on pillow
    ctx.fillStyle = p.avatarSkin || '#ffd1a4';
    ctx.beginPath();
    ctx.arc(0, -50, 11, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = p.avatarHair || '#4a3728';
    ctx.beginPath();
    ctx.arc(0, -53, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    // Closed sleepy eyes (- -)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -50); ctx.lineTo(-2, -50);
    ctx.moveTo(2, -50); ctx.lineTo(5, -50);
    ctx.stroke();

    ctx.restore();
  }

  renderPlayerOverlays(ctx, p) {
    const isSelf = p.id === this.selfId;
    const topY = p.y - (p.isSleeping ? 65 : p.isSitting ? 35 : 44);

    // 1. Name Tag
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const tagText = `${p.isSleeping ? '💤' : p.statusEmoji || '🟢'} ${p.username || 'Coworker'}`;
    const textWidth = ctx.measureText(tagText).width;

    ctx.fillStyle = isSelf ? 'rgba(30, 58, 138, 0.85)' : 'rgba(15, 23, 42, 0.85)';
    this.map.roundRect(ctx, p.x - textWidth / 2 - 8, topY - 14, textWidth + 16, 18, 8, true, false);

    ctx.fillStyle = isSelf ? '#93c5fd' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, p.x, topY);

    // 2. Speech Bubble
    const bubble = this.speechBubbles[p.id];
    if (bubble) {
      const elapsed = performance.now() - bubble.startTime;
      if (elapsed < bubble.duration) {
        ctx.font = '12px "Plus Jakarta Sans", sans-serif';
        const msgWidth = Math.min(220, ctx.measureText(bubble.text).width + 20);
        const bubbleY = topY - 26;

        ctx.fillStyle = '#ffffff';
        this.map.roundRect(ctx, p.x - msgWidth / 2, bubbleY - 20, msgWidth, 24, 8, true, false);

        ctx.beginPath();
        ctx.moveTo(p.x - 4, bubbleY + 4);
        ctx.lineTo(p.x + 4, bubbleY + 4);
        ctx.lineTo(p.x, bubbleY + 8);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(bubble.text.substring(0, 30), p.x, bubbleY - 4);
      } else {
        delete this.speechBubbles[p.id];
      }
    }

    // 3. Floating Emotes
    for (let i = this.activeEmotes.length - 1; i >= 0; i--) {
      const e = this.activeEmotes[i];
      if (e.playerId === p.id) {
        const elapsed = performance.now() - e.startTime;
        if (elapsed < e.duration) {
          const progress = elapsed / e.duration;
          const floatY = topY - 24 - progress * 40;
          const alpha = 1 - progress * progress;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(e.emote, p.x, floatY);
          ctx.restore();
        } else {
          this.activeEmotes.splice(i, 1);
        }
      }
    }
  }

  loop(timestamp) {
    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.update(delta);
    this.render();

    requestAnimationFrame(this.loop);
  }
}

window.Game = Game;
