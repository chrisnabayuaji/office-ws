// Harvest Moon / Chibi Style 3D Character Model for Three.js

class Character3D {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.config = {
      username: config.username || 'Coworker',
      color: config.avatarColor || '#3b82f6',
      skin: config.avatarSkin || '#ffd1a4',
      hair: config.avatarHair || '#4a3728',
      status: config.status || 'Online',
      statusEmoji: config.statusEmoji || '🟢'
    };

    this.group = new THREE.Group();
    this.walkCycle = 0;
    this.isMoving = false;
    this.isSitting = false;
    this.isSleeping = false;

    // Sub-parts for animation
    this.head = null;
    this.hairMesh = null;
    this.torso = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;

    // 3D Billboard tags
    this.nametagSprite = null;
    this.speechSprite = null;
    this.emoteSprite = null;

    this.speechTimer = 0;
    this.emoteTimer = 0;

    this.buildModel();
    this.createNametag();
    this.scene.add(this.group);
  }

  buildModel() {
    // 1. Torso / Body (Chibi rounded box)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.75, 0.45);
    const torsoMat = new THREE.MeshLambertMaterial({ color: this.config.color });
    this.torso = new THREE.Mesh(torsoGeo, torsoMat);
    this.torso.position.y = 0.85;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.group.add(this.torso);

    // Collar & Red Tie Detail
    const collarGeo = new THREE.BoxGeometry(0.2, 0.15, 0.05);
    const collarMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 0.28, 0.23);
    this.torso.add(collar);

    const tieGeo = new THREE.BoxGeometry(0.08, 0.25, 0.05);
    const tieMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.1, 0.24);
    this.torso.add(tie);

    // 2. Chibi Head (Cute large head)
    const headGeo = new THREE.BoxGeometry(0.85, 0.8, 0.75);
    const headMat = new THREE.MeshLambertMaterial({ color: this.config.skin });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 1.55;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Chibi Hair (Top, sides, bangs)
    const hairGeo = new THREE.BoxGeometry(0.9, 0.45, 0.82);
    const hairMat = new THREE.MeshLambertMaterial({ color: this.config.hair });
    this.hairMesh = new THREE.Mesh(hairGeo, hairMat);
    this.hairMesh.position.set(0, 0.25, 0);
    this.head.add(this.hairMesh);

    // Bangs
    const bangsGeo = new THREE.BoxGeometry(0.85, 0.2, 0.1);
    const bangs = new THREE.Mesh(bangsGeo, hairMat);
    bangs.position.set(0, 0.12, 0.4);
    this.head.add(bangs);

    // Eyes (Cute dark rectangles with white shine)
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.14, 0.05);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.2, -0.05, 0.38);
    this.head.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.2, -0.05, 0.38);
    this.head.add(this.rightEye);

    // Cute blush cheeks
    const blushGeo = new THREE.BoxGeometry(0.12, 0.06, 0.05);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.25, -0.18, 0.38);
    this.head.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.25, -0.18, 0.38);
    this.head.add(rightBlush);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.55, 0.22);
    const armMat = new THREE.MeshLambertMaterial({ color: this.config.color });

    // Left Arm (pivot at top shoulder)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 1.15, 0);
    const lArmMesh = new THREE.Mesh(armGeo, armMat);
    lArmMesh.position.y = -0.22;
    lArmMesh.castShadow = true;
    this.leftArm.add(lArmMesh);
    this.group.add(this.leftArm);

    // Right Arm (pivot at top shoulder)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 1.15, 0);
    const rArmMesh = new THREE.Mesh(armGeo, armMat);
    rArmMesh.position.y = -0.22;
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);
    this.group.add(this.rightArm);

    // 4. Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.5, 0.26);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.5, 0);
    const lLegMesh = new THREE.Mesh(legGeo, legMat);
    lLegMesh.position.y = -0.25;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    this.group.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.5, 0);
    const rLegMesh = new THREE.Mesh(legGeo, legMat);
    rLegMesh.position.y = -0.25;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    this.group.add(this.rightLeg);

    // 5. Soft Ground Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.02;
    this.group.add(this.shadowDisc);
  }

  createNametag() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    // Rounded background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    this.roundRect(ctx, 12, 12, 360, 72, 36, true, false);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 4;
    this.roundRect(ctx, 12, 12, 360, 72, 36, false, true);

    // Text: Status emoji + Username
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.config.statusEmoji} ${this.config.username}`, 192, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.nametagSprite = new THREE.Sprite(spriteMat);
    this.nametagSprite.scale.set(2.4, 0.6, 1);
    this.nametagSprite.position.y = 2.45;
    this.group.add(this.nametagSprite);
  }

  updateNametag(status, statusEmoji) {
    this.config.status = status;
    this.config.statusEmoji = statusEmoji;
    if (this.nametagSprite) {
      this.group.remove(this.nametagSprite);
    }
    this.createNametag();
  }

  showEmote(emote) {
    if (this.emoteSprite) {
      this.group.remove(this.emoteSprite);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emote, 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.emoteSprite = new THREE.Sprite(spriteMat);
    this.emoteSprite.scale.set(1.1, 1.1, 1);
    this.emoteSprite.position.y = 3.2;
    this.group.add(this.emoteSprite);

    this.emoteTimer = performance.now();
  }

  showSpeech(text) {
    if (this.speechSprite) {
      this.group.remove(this.speechSprite);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Speech bubble card
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, 16, 16, 480, 110, 24, true, false);

    // Tip
    ctx.beginPath();
    ctx.moveTo(240, 126);
    ctx.lineTo(272, 126);
    ctx.lineTo(256, 146);
    ctx.fill();

    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.substring(0, 24), 256, 70);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.speechSprite = new THREE.Sprite(spriteMat);
    this.speechSprite.scale.set(3.0, 0.9, 1);
    this.speechSprite.position.y = 3.3;
    this.group.add(this.speechSprite);

    this.speechTimer = performance.now();
  }

  update(delta) {
    // 1. Sleeping State (Horizontal on 3D bed)
    if (this.isSleeping) {
      this.group.rotation.x = -Math.PI / 2; // Lie down flat
      this.group.position.y = 0.55;
      this.torso.position.y = 0.85;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      if (this.nametagSprite) this.nametagSprite.position.set(0, 0.5, 2.3);
      return;
    }

    this.group.rotation.x = 0;
    this.group.position.y = 0;
    if (this.nametagSprite) this.nametagSprite.position.set(0, 2.45, 0);

    // 2. Sitting State (On 3D chair)
    if (this.isSitting) {
      this.torso.position.y = 0.65;
      this.head.position.y = 1.35;
      this.leftLeg.rotation.x = -Math.PI / 2; // Legs bent forward
      this.rightLeg.rotation.x = -Math.PI / 2;
      this.leftArm.rotation.x = -Math.PI / 3;
      this.rightArm.rotation.x = -Math.PI / 3;
      return;
    }

    // 3. Normal / Walking State (Harvest Moon cute bobbing animation)
    if (this.isMoving) {
      this.walkCycle += delta * 0.012;
      const swing = Math.sin(this.walkCycle);

      // Arm & Leg swing
      this.leftArm.rotation.x = swing * 0.7;
      this.rightArm.rotation.x = -swing * 0.7;
      this.leftLeg.rotation.x = -swing * 0.75;
      this.rightLeg.rotation.x = swing * 0.75;

      // Cute head & body bob
      this.torso.position.y = 0.85 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.08;
      this.head.position.y = 1.55 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.08;
    } else {
      // Idle pose
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.2);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.2);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.2);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.2);
      this.torso.position.y = 0.85;
      this.head.position.y = 1.55;
    }

    // Check timers for speech and emotes
    if (this.speechSprite && performance.now() - this.speechTimer > 4000) {
      this.group.remove(this.speechSprite);
      this.speechSprite = null;
    }

    if (this.emoteSprite) {
      const elapsed = performance.now() - this.emoteTimer;
      if (elapsed > 2500) {
        this.group.remove(this.emoteSprite);
        this.emoteSprite = null;
      } else {
        this.emoteSprite.position.y = 3.2 + (elapsed / 2500) * 0.5;
      }
    }
  }

  destroy() {
    this.scene.remove(this.group);
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

window.Character3D = Character3D;
