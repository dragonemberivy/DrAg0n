/* 3D FORTZONE ENGINE */
const container = document.getElementById('dr-container'); // The parent
const gameContainer = document.getElementById('dragon-royale-3d'); // The 3D box
let scene, camera, renderer, controls;
let drGameLoopId;
let drIsDeploying = false;

// Config
const MAP_SIZE = 2000;
const DRAGON_EMOJIS = ['🐲', '🦖', '🦕', '🐉', '🐊'];
const PLAYER_SPEED = 6;
const BOT_SPEED = 2; // Nerfed

// State
let drState = 'playing'; // bus, playing, over
let drEntities = []; // Index 0 is player
let drProjectiles = [];
let drWalls = [];
let drChests = [];
let drStorm = { radius: MAP_SIZE/1.5, shrinkRate: 0.15 };
let frameCount = 0;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let velocity;
let direction;

// We attach event listeners globally, but they only trigger actions if drState is active
window.addEventListener('keydown', e => { 
  const k = e.key.toLowerCase();
  if(["w","a","s","d","e"].includes(k)) keys[k] = true; 
  if(e.code === 'Space') keys.space = true;
});
window.addEventListener('keyup', e => { 
  const k = e.key.toLowerCase();
  if(["w","a","s","d","e"].includes(k)) keys[k] = false; 
  if(e.code === 'Space') keys.space = false;
});

let keys = { w: false, a: false, s: false, d: false, e: false, space: false };
let mousePos = { x: 300, y: 200 };
let cam = { x: 0, y: 0 };

function init3D() {
  if (!gameContainer) return;
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  scene.fog = new THREE.Fog(0x87CEEB, 0, MAP_SIZE/2);

  const aspect = gameContainer.clientWidth / gameContainer.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 1, MAP_SIZE);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
  gameContainer.innerHTML = '';
  gameContainer.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(100, 200, 50);
  scene.add(dirLight);

  // Ground
  const floorGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Controls
  controls = new THREE.PointerLockControls(camera, document.body);
  
  window.addEventListener('resize', () => {
    if(gameContainer && camera && renderer) {
      camera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
    }
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('mousedown', onMouseDown);
}

function onKeyDown(e) {
  if (!drIsDeploying || drState !== 'playing') return;
  switch (e.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyD': moveRight = true; break;
    case 'KeyE': build3DWall(); break;
  }
}

function onKeyUp(e) {
  if (!drIsDeploying || drState !== 'playing') return;
  switch (e.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyD': moveRight = false; break;
  }
}

function build3DWall() {
  const p = drEntities[0];
  if (p.mats > 0 && p.buildCooldown <= 0 && controls.isLocked) {
     p.mats--; p.buildCooldown = 30;
     const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
     dir.y = 0; dir.normalize();
     
     const spawnPos = camera.position.clone().add(dir.multiplyScalar(30));
     spawnPos.y = 15; // half height
     
     const wallGeo = new THREE.BoxGeometry(30, 30, 5);
     const wallMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
     const wallMesh = new THREE.Mesh(wallGeo, wallMat);
     wallMesh.position.copy(spawnPos);
     wallMesh.lookAt(camera.position.clone().setY(15));
     scene.add(wallMesh);
     
     drWalls.push({ mesh: wallMesh, hp: 100 });
  }
}

function createEmojiSprite(emoji, size) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const cx = canvas.getContext('2d');
  cx.font = '200px Arial';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(emoji, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  // Need to set texture needsUpdate in newer threejs but usually automatic
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

function spawn3DGameObjects() {
  while(scene.children.length > 0){ scene.remove(scene.children[0]); }
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); dirLight.position.set(100, 200, 50); scene.add(dirLight);
  
  const floorGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
  const floor = new THREE.Mesh(floorGeo, floorMat); floor.rotation.x = -Math.PI / 2; scene.add(floor);

  drEntities = []; drProjectiles = []; drWalls = []; drChests = [];
  drStorm = { radius: MAP_SIZE, x: 0, z: 0, shrinkRate: 0.15 };
  frameCount = 0; drState = 'playing';
  
  camera.position.set((Math.random()-0.5)*MAP_SIZE*0.8, 10, (Math.random()-0.5)*MAP_SIZE*0.8);
  drEntities.push({
    id: 0, isPlayer: true,
    hp: 100, maxHp: 100, shield: 0, maxShield: 100,
    cooldown: 0, buildCooldown: 0, weaponLvl: 0, mats: 20, isDead: false
  });
  
  // Bots
  for(let i=1; i<=49; i++) {
    const rx = (Math.random()-0.5)*MAP_SIZE*0.9;
    const rz = (Math.random()-0.5)*MAP_SIZE*0.9;
    const emoji = DRAGON_EMOJIS[Math.floor(Math.random() * DRAGON_EMOJIS.length)];
    const sprite = createEmojiSprite(emoji, 25);
    sprite.position.set(rx, 12.5, rz);
    scene.add(sprite);
    
    drEntities.push({
      id: i, isPlayer: false, mesh: sprite,
      hp: 100, maxHp: 100, shield: 0, maxShield: 100, weaponLvl: 0, mats: 10,
      cooldown: 0, buildCooldown: 0, isDead: false,
      state: 'roam', targetX: undefined, targetZ: undefined
    });
  }
  
  // Chests
  for(let i=0; i<30; i++) {
    const chest = createEmojiSprite('🧰', 15);
    chest.position.set((Math.random()-0.5)*MAP_SIZE*0.9, 7.5, (Math.random()-0.5)*MAP_SIZE*0.9);
    scene.add(chest);
    drChests.push({ mesh: chest });
  }
  
  // Storm
  const stormGeo = new THREE.CylinderGeometry(MAP_SIZE, MAP_SIZE, 500, 32, 1, true);
  const stormMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  drStorm.mesh = new THREE.Mesh(stormGeo, stormMat);
  drStorm.mesh.position.set(0,0,0);
  scene.add(drStorm.mesh);
}

window.startDragonRoyale = function() {
  if (!scene) init3D();
  document.getElementById('dr-overlay').style.display = 'none';
  document.getElementById('dr-score-hud').style.display = 'block';
  document.getElementById('dr-crosshair').style.display = 'block';
  document.getElementById('dr-score').textContent = 50;
  
  drIsDeploying = true;
  spawn3DGameObjects();
  
  if (drGameLoopId) cancelAnimationFrame(drGameLoopId);
  velocity.set(0,0,0);
  direction.set(0,0,0);
  
  moveForward = false; moveBackward = false; moveLeft = false; moveRight = false;
  controls.lock();
  
  drUpdate3D();
};

window.toggleFullscreenDR = function() {
  if (!document.fullscreenElement) {
    parentContainer.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

function drEndGame(placed) {
  drState = 'over';
  document.getElementById('dr-overlay').style.display = 'flex';
  const title = document.getElementById('dr-title');
  const finalScore = document.getElementById('dr-score-display');
  finalScore.style.display = 'block';
  
  if (placed === 1 && !drEntities[0].isDead) { 
    title.textContent = 'VICTORY ROYALE 👑';
    title.style.color = '#fbbf24';
    finalScore.textContent = 'You are the last dragon standing!';
  } else {
    title.textContent = 'ELIMINATED 💀';
    title.style.color = '#ef4444';
    finalScore.textContent = 'Placed: #' + placed;
  }
}

function onMouseDown(e) {
  if (!drIsDeploying || drState !== 'playing' || !controls.isLocked) return;
  if (e.button === 2) return; 

  const p = drEntities[0];
  if (p.cooldown > 0) return;

  const fbGeo = new THREE.SphereGeometry(2 + p.weaponLvl, 8, 8);
  const fbMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const fb = new THREE.Mesh(fbGeo, fbMat);
  
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  fb.position.copy(camera.position).add(dir.clone().multiplyScalar(10));
  scene.add(fb);
  
  drProjectiles.push({
    ownerId: 0, mesh: fb,
    velocity: dir.multiplyScalar(8 + p.weaponLvl),
    dmg: 25 + (p.weaponLvl*5)
  });
  p.cooldown = Math.max(10, 30 - p.weaponLvl*2);
}

function doDamage(e, amt) {
   if (e.shield > 0) {
     e.shield -= amt;
     if (e.shield < 0) { e.hp += e.shield; e.shield = 0; }
   } else { e.hp -= amt; }
}

function drUpdate3D() {
  if (!drIsDeploying) return;
  drGameLoopId = requestAnimationFrame(drUpdate3D);
  frameCount++;
  
  let aliveCount = 0;
  
  // PLAYER MOVEMENT
  const p = drEntities[0];
  if (!p.isDead && controls.isLocked) {
    aliveCount++;
    if (p.cooldown > 0) p.cooldown--;
    if (p.buildCooldown > 0) p.buildCooldown--;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); 
    
    if (moveForward || moveBackward) velocity.z -= direction.z * 1.5;
    if (moveLeft || moveRight) velocity.x -= direction.x * 1.5;
    
    controls.moveRight(-velocity.x);
    controls.moveForward(-velocity.z);
    
    velocity.x *= 0.8; velocity.z *= 0.8;
    
    camera.position.x = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, camera.position.x));
    camera.position.z = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, camera.position.z));
    camera.position.y = 10;
  }
  
  // BOT AI 
  for (let i = 1; i < drEntities.length; i++) {
    let b = drEntities[i];
    if (b.isDead) continue;
    aliveCount++;
    
    if (b.cooldown > 0) b.cooldown--;
    if (b.buildCooldown > 0) b.buildCooldown--;
    
    const bx = b.mesh.position.x; const bz = b.mesh.position.z;
    
    const distToCenter = Math.hypot(bx, bz);
    if (distToCenter > drStorm.radius - 100) {
      b.state = 'run_storm'; b.targetX = 0; b.targetZ = 0;
    } else if (b.state === 'run_storm') { b.state = 'roam'; }
    
    let closestEnemyDist = 500; let closestEnemy = null;
    
    if (frameCount % 60 === 0 && b.state !== 'run_storm') {
      for (let other of drEntities) {
        if (other.id === b.id || other.isDead) continue;
        let ox, oz;
        if (other.isPlayer) { ox = camera.position.x; oz = camera.position.z; }
        else { ox = other.mesh.position.x; oz = other.mesh.position.z; }
        
        const dist = Math.hypot(bx - ox, bz - oz);
        if (dist < closestEnemyDist) { closestEnemyDist = dist; closestEnemy = other; }
      }
      
      if (closestEnemy) { b.state = 'fight'; b.targetEnemy = closestEnemy; }
      else { b.state = 'roam'; }
      
      if (b.targetEnemy && b.mats > 0 && b.buildCooldown <= 0 && Math.random() < 0.1) {
         b.mats--; b.buildCooldown = 120;
         const wx = bx + (Math.random()-0.5)*40; const wz = bz + (Math.random()-0.5)*40;
         const wallGeo = new THREE.BoxGeometry(30, 30, 5);
         const wallMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
         const wallMesh = new THREE.Mesh(wallGeo, wallMat);
         wallMesh.position.set(wx, 15, wz); wallMesh.lookAt(camera.position);
         scene.add(wallMesh); drWalls.push({ mesh: wallMesh, hp: 100 });
      }
    }
    
    if (b.state === 'fight' && b.targetEnemy && !b.targetEnemy.isDead) {
      let ox, oz;
      if (b.targetEnemy.isPlayer) { ox = camera.position.x; oz = camera.position.z; }
      else { ox = b.targetEnemy.mesh.position.x; oz = b.targetEnemy.mesh.position.z; }
      
      if (closestEnemyDist > 200) { b.targetX = ox; b.targetZ = oz; }
      else { b.targetX = bx; b.targetZ = bz; } 
      
      if (b.cooldown <= 0 && closestEnemyDist < 500) {
        const sprayX = (Math.random() - 0.5) * 100;
        const sprayZ = (Math.random() - 0.5) * 100;
        const dir = new THREE.Vector3(ox + sprayX - bx, 0, oz + sprayZ - bz).normalize();
        
        const fbGeo = new THREE.SphereGeometry(2 + b.weaponLvl, 8, 8);
        const fbMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const fb = new THREE.Mesh(fbGeo, fbMat);
        fb.position.set(bx, 10, bz).add(dir.clone().multiplyScalar(10));
        scene.add(fb);
        
        drProjectiles.push({
          ownerId: b.id, mesh: fb,
          velocity: dir.multiplyScalar(6 + b.weaponLvl), 
          dmg: 10 + b.weaponLvl*5
        });
        b.cooldown = 90; 
      }
    }
    
    if (b.state === 'roam' && frameCount % 120 === 0) {
      if(Math.random() < 0.3 && drChests.length > 0) {
        // try to find chest
        const c = drChests[Math.floor(Math.random() * drChests.length)];
        b.targetX = c.mesh.position.x; b.targetZ = c.mesh.position.z;
      } else {
        b.targetX = bx + (Math.random() - 0.5) * 600;
        b.targetZ = bz + (Math.random() - 0.5) * 600;
      }
    }
    
    if (b.targetX !== undefined && b.targetZ !== undefined) {
      const dirX = b.targetX - bx; const dirZ = b.targetZ - bz;
      const dist = Math.hypot(dirX, dirZ);
      if (dist > 5) {
        b.mesh.position.x += (dirX/dist) * BOT_SPEED;
        b.mesh.position.z += (dirZ/dist) * BOT_SPEED;
      }
    }
    
    b.mesh.position.x = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, b.mesh.position.x));
    b.mesh.position.z = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, b.mesh.position.z));
    b.mesh.lookAt(camera.position); 
    
    // Storm Damage
    if (Math.hypot(b.mesh.position.x, b.mesh.position.z) > drStorm.radius) {
      doDamage(b, 0.5);
    }
    if (b.hp <= 0 && !b.isDead) {
      b.isDead = true; scene.remove(b.mesh);
    }
  }
  
  // PLAYER STORM/HP/WIN
  if (!p.isDead) {
    if (Math.hypot(camera.position.x, camera.position.z) > drStorm.radius) { doDamage(p, 0.5); }
    if (p.hp <= 0) { p.isDead = true; drEndGame(aliveCount); controls.unlock(); }
  }
  
  document.getElementById('dr-score').textContent = aliveCount;
  
  // PROJECTILES
  for (let i = drProjectiles.length - 1; i >= 0; i--) {
    let pr = drProjectiles[i];
    pr.mesh.position.add(pr.velocity);
    
    if (Math.abs(pr.mesh.position.x) > MAP_SIZE/2 || Math.abs(pr.mesh.position.z) > MAP_SIZE/2) {
      scene.remove(pr.mesh); drProjectiles.splice(i, 1); continue;
    }
    
    let hit = false;
    for (let e of drEntities) {
      if (e.isDead || e.id === pr.ownerId) continue;
      let ex, ez;
      if (e.isPlayer) { ex = camera.position.x; ez = camera.position.z; }
      else { ex = e.mesh.position.x; ez = e.mesh.position.z; }
      
      if (Math.hypot(pr.mesh.position.x - ex, pr.mesh.position.z - ez) < 20) {
        doDamage(e, pr.dmg); hit = true; break;
      }
    }
    if (!hit) {
      for (let w of drWalls) {
         if (w.mesh.position.distanceTo(pr.mesh.position) < 30) {
            w.hp -= pr.dmg; hit = true; break;
         }
      }
    }
    if (hit) { scene.remove(pr.mesh); drProjectiles.splice(i, 1); }
  }
  
  // WALLS
  drWalls = drWalls.filter(w => {
    if (w.hp <= 0) { scene.remove(w.mesh); return false; }
    return true;
  });
  
  // CHESTS
  for (let i = drChests.length - 1; i >= 0; i--) {
    let c = drChests[i];
    if (p.isDead) continue;
    
    if (Math.hypot(c.mesh.position.x - camera.position.x, c.mesh.position.z - camera.position.z) < 25) {
      scene.remove(c.mesh); drChests.splice(i, 1);
      if (Math.random() > 0.4) { p.shield = Math.min(p.maxShield, p.shield + 50); }
      else { p.weaponLvl++; }
      p.mats += 10;
    }
    c.mesh.lookAt(camera.position); 
  }
  
  // STORM
  drStorm.radius -= drStorm.shrinkRate;
  if(drStorm.radius < 50) drStorm.radius = 50;
  drStorm.mesh.scale.set(drStorm.radius/MAP_SIZE, 1, drStorm.radius/MAP_SIZE);
  
  // HUD
  if (!p.isDead) {
    document.getElementById('dr-score-display').style.display = 'block';
    document.getElementById('dr-score-display').innerHTML = `
       ❤️ HP: ${Math.floor(p.hp)} | 🛡️ SHIELD: ${Math.floor(p.shield)}<br>
       🧱 MATS: ${p.mats} | 🔥 LVL: ${p.weaponLvl}
    `;
    document.getElementById('dr-score-display').style.color = '#fff';
    document.getElementById('dr-score-display').style.textShadow = '1px 1px 0 #000';
  }
  
  // WIN
  if (aliveCount <= 1 && !p.isDead) { drEndGame(1); controls.unlock(); }

  renderer.render(scene, camera);
}
