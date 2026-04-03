// ------------------------------------
// DRAGON FORTZONE BATTLE ROYALE
// ------------------------------------
const canvas = document.getElementById('dragon-royale');
const ctx = canvas ? canvas.getContext('2d') : null;
let drGameLoop;
let drIsDeploying = false;

const MAP_SIZE = 2000;
const DRAGON_EMOJIS = ['🐲', '🦖', '🦕', '🐉', '🐊'];
const PLAYER_SPEED = 4;
const BOT_SPEED = 2.5;

let drState = 'playing'; 
let drBus = { x: 0, y: 0, angle: 0 };
let drEntities = []; 
let drProjectiles = [];
let drWalls = [];
let drChests = [];
let drStorm = { radius: MAP_SIZE, x: MAP_SIZE/2, y: MAP_SIZE/2, shrinkRate: 0.15 };
let keys = { w: false, a: false, s: false, d: false, e: false, space: false };
let mousePos = { x: 300, y: 200 };
let cam = { x: 0, y: 0 };
let frameCount = 0;

if(canvas) {
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
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mousePos.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (drState !== 'playing' || drEntities.length === 0 || drEntities[0].isDead) return;
    const p = drEntities[0];
    if (p.mats > 0 && p.buildCooldown <= 0) {
       buildWall(p);
       p.mats--;
       p.buildCooldown = 20;
    }
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 2) return;
    if (drState !== 'playing' || drEntities.length === 0 || drEntities[0].isDead) return;
    
    const p = drEntities[0];
    if (p.cooldown > 0) return;
    
    const worldMouseX = mousePos.x + cam.x;
    const worldMouseY = mousePos.y + cam.y;
    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    
    drProjectiles.push({
      ownerId: p.id,
      x: p.x, y: p.y,
      vx: Math.cos(angle) * (10 + p.weaponLvl), 
      vy: Math.sin(angle) * (10 + p.weaponLvl),
      radius: 8 + p.weaponLvl,
      dmg: 20 + (p.weaponLvl * 10)
    });
    p.cooldown = Math.max(5, 20 - p.weaponLvl * 2); 
  });
}

function buildWall(entity) {
  let angle = 0;
  if (entity.isPlayer) {
    angle = Math.atan2((mousePos.y + cam.y) - entity.y, (mousePos.x + cam.x) - entity.x);
  } else if (entity.targetEnemy) {
    angle = Math.atan2(entity.targetEnemy.y - entity.y, entity.targetEnemy.x - entity.x);
  }
  drWalls.push({
    x: entity.x + Math.cos(angle)*40,
    y: entity.y + Math.sin(angle)*40,
    hp: 100, maxHp: 100, radius: 25
  });
}

function spawnGameObjects() {
  drEntities = [];
  drWalls = [];
  drChests = [];
  drProjectiles = [];
  drStorm = { radius: MAP_SIZE, x: MAP_SIZE/2, y: MAP_SIZE/2, shrinkRate: 0.15 };
  frameCount = 0;
  
  drState = 'bus';
  drBus = { x: -100, y: -100, angle: Math.PI/4, speed: 5 };
  
  drEntities.push({
    id: 0, isPlayer: true,
    x: -100, y: -100,
    emoji: '🐉', hp: 100, maxHp: 100, shield: 0, maxShield: 100,
    radius: 15, cooldown: 0, buildCooldown: 0, weaponLvl: 0, mats: 10,
    isDead: false, dropped: false
  });
  
  for(let i = 1; i <= 49; i++) {
    drEntities.push({
      id: i, isPlayer: false,
      x: -100, y: -100,
      emoji: DRAGON_EMOJIS[Math.floor(Math.random() * DRAGON_EMOJIS.length)],
      hp: 100, maxHp: 100, shield: 0, maxShield: 100,
      radius: 15, cooldown: 0, buildCooldown: 0, weaponLvl: 0, mats: 10,
      isDead: false, dropped: false,
      targetX: 0, targetY: 0, state: 'roam',
      dropTime: 60 + Math.random() * 400
    });
  }
  
  for(let i=0; i<100; i++) {
    drChests.push({
      x: 50 + Math.random()*(MAP_SIZE-100),
      y: 50 + Math.random()*(MAP_SIZE-100),
      radius: 15
    });
  }
}

window.startDragonRoyale = function() {
  document.getElementById('dr-overlay').style.display = 'none';
  document.getElementById('dr-score-hud').style.display = 'block';
  document.getElementById('dr-score').textContent = 50;
  
  drIsDeploying = true;
  spawnGameObjects();
  
  if (drGameLoop) cancelAnimationFrame(drGameLoop);
  keys = { w: false, a: false, s: false, d: false, e: false, space: false };
  drUpdate();
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

function doDamage(entity, amt) {
   if (entity.shield > 0) {
     entity.shield -= amt;
     if (entity.shield < 0) {
       entity.hp += entity.shield;
       entity.shield = 0;
     }
   } else {
     entity.hp -= amt;
   }
}

function drUpdate() {
  if (!drIsDeploying) return;
  drGameLoop = requestAnimationFrame(drUpdate);
  frameCount++;
  
  if (drState === 'bus') {
    drBus.x += Math.cos(drBus.angle) * drBus.speed;
    drBus.y += Math.sin(drBus.angle) * drBus.speed;
    
    let allDropped = true;
    let p = drEntities[0];
    if (!p.dropped) {
      allDropped = false;
      p.x = drBus.x; p.y = drBus.y;
      if (keys.space && drBus.x > 0 && drBus.y > 0) p.dropped = true;
    }
    
    for (let i = 1; i < drEntities.length; i++) {
      let b = drEntities[i];
      if (!b.dropped) {
        allDropped = false;
        b.x = drBus.x; b.y = drBus.y;
        if (frameCount > b.dropTime && drBus.x > 0) {
          b.dropped = true;
          b.x += (Math.random() - 0.5) * 50;
          b.y += (Math.random() - 0.5) * 50;
        }
      }
    }
    
    if (drBus.x > MAP_SIZE + 100 || allDropped) {
      drState = 'playing';
      if (!p.dropped) { p.dropped = true; p.x = Math.max(0, Math.min(MAP_SIZE, p.x)); p.y = Math.max(0, Math.min(MAP_SIZE, p.y)); }
      for(let b of drEntities) { if(!b.dropped) { b.dropped = true; b.x = MAP_SIZE/2; b.y = MAP_SIZE/2; } }
    }
  }
  
  let aliveCount = 0;
  for (let i = 0; i < drEntities.length; i++) {
    let e = drEntities[i];
    if (e.isDead || !e.dropped) continue;
    aliveCount++;
    
    if (e.cooldown > 0) e.cooldown--;
    if (e.buildCooldown > 0) e.buildCooldown--;
    
    if (e.isPlayer && drState === 'playing') {
      if (keys.w) e.y -= PLAYER_SPEED;
      if (keys.s) e.y += PLAYER_SPEED;
      if (keys.a) e.x -= PLAYER_SPEED;
      if (keys.d) e.x += PLAYER_SPEED;
      
      if (keys.e && e.mats > 0 && e.buildCooldown <= 0) { buildWall(e); e.mats--; e.buildCooldown = 20; }
    } else if (!e.isPlayer && drState === 'playing') {
      const distToStormCenter = Math.hypot(e.x - drStorm.x, e.y - drStorm.y);
      if (distToStormCenter > drStorm.radius - 100) {
        e.state = 'run_storm';
        e.targetX = drStorm.x; e.targetY = drStorm.y;
      } else if (e.state === 'run_storm') { e.state = 'roam'; }
      
      let closestEnemyDist = 500; let closestEnemy = null;
      if (frameCount % 30 === 0 && e.state !== 'run_storm') {
        for (let other of drEntities) {
          if (other.id === e.id || other.isDead || !other.dropped) continue;
          const dist = Math.hypot(e.x - other.x, e.y - other.y);
          if (dist < closestEnemyDist) { closestEnemyDist = dist; closestEnemy = other; }
        }
        if (closestEnemy) { e.state = 'fight'; e.targetEnemy = closestEnemy; } 
        else { e.state = 'roam'; }
        
        if (e.targetEnemy && e.mats > 0 && e.buildCooldown <= 0 && Math.random() < 0.3) {
           buildWall(e); e.mats--; e.buildCooldown = 60;
        }
      }
      
      if (e.state === 'fight' && e.targetEnemy && !e.targetEnemy.isDead) {
        if (closestEnemyDist > 200) { e.targetX = e.targetEnemy.x; e.targetY = e.targetEnemy.y; } 
        else { e.targetX = e.x; e.targetY = e.y; }
        
        if (e.cooldown <= 0 && closestEnemyDist < 500) {
          const aim = Math.atan2(e.targetEnemy.y - e.y, e.targetEnemy.x - e.x) + (Math.random()-0.5)*0.2;
          drProjectiles.push({
            ownerId: e.id, x: e.x, y: e.y,
            vx: Math.cos(aim) * (8 + e.weaponLvl), vy: Math.sin(aim) * (8 + e.weaponLvl),
            radius: 8 + e.weaponLvl, dmg: 15 + e.weaponLvl*10
          });
          e.cooldown = 40;
        }
      }
      
      if (e.state === 'roam' && frameCount % 60 === 0) {
         let closestChestDist = 300; let closestChest = null;
         for (let c of drChests) {
           const dist = Math.hypot(e.x - c.x, e.y - c.y);
           if (dist < closestChestDist) { closestChestDist = dist; closestChest = c; }
         }
         if (closestChest) { e.targetX = closestChest.x; e.targetY = closestChest.y; } 
         else { e.targetX = e.x + (Math.random()-0.5)*400; e.targetY = e.y + (Math.random()-0.5)*400; }
      }
      
      if (e.targetX && e.targetY) {
        const angle = Math.atan2(e.targetY - e.y, e.targetX - e.x);
        if (Math.hypot(e.targetX-e.x, e.targetY-e.y) > 5) {
          e.x += Math.cos(angle) * BOT_SPEED; e.y += Math.sin(angle) * BOT_SPEED;
        }
      }
    }
    
    e.x = Math.max(e.radius, Math.min(MAP_SIZE-e.radius, e.x));
    e.y = Math.max(e.radius, Math.min(MAP_SIZE-e.radius, e.y));
    
    for (let w of drWalls) {
       const dx = e.x - w.x; const dy = e.y - w.y;
       if (Math.hypot(dx, dy) < e.radius + w.radius) {
          const angle = Math.atan2(dy, dx);
          e.x = w.x + Math.cos(angle) * (e.radius + w.radius);
          e.y = w.y + Math.sin(angle) * (e.radius + w.radius);
       }
    }
    
    for (let j = drChests.length - 1; j >= 0; j--) {
       const c = drChests[j];
       if (Math.hypot(e.x - c.x, e.y - c.y) < e.radius + c.radius) {
          drChests.splice(j, 1);
          if (Math.random() > 0.3) { e.shield = Math.min(e.maxShield, e.shield + 50); }
          else { e.weaponLvl++; }
          e.mats += 10;
       }
    }
    
    if (Math.hypot(e.x - drStorm.x, e.y - drStorm.y) > drStorm.radius && drState === 'playing') {
      doDamage(e, 0.5); 
    }
    
    if (e.hp <= 0 && !e.isDead) { e.isDead = true; if (e.isPlayer) drEndGame(aliveCount); }
  }
  
  document.getElementById('dr-score').textContent = drState === 'bus' ? 50 : aliveCount;
  
  for (let i = drProjectiles.length - 1; i >= 0; i--) {
    let p = drProjectiles[i];
    p.x += p.vx; p.y += p.vy;
    
    if (p.x < 0 || p.x > MAP_SIZE || p.y < 0 || p.y > MAP_SIZE) { drProjectiles.splice(i, 1); continue; }
    
    let hit = false;
    for (let e of drEntities) {
      if (e.isDead || e.id === p.ownerId || !e.dropped) continue;
      if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) { doDamage(e, p.dmg); hit = true; break; }
    }
    if (!hit) {
       for (let w of drWalls) {
         if (Math.hypot(p.x - w.x, p.y - w.y) < p.radius + w.radius) { w.hp -= p.dmg; hit = true; break; }
       }
    }
    if (hit) drProjectiles.splice(i, 1);
  }
  
  drWalls = drWalls.filter(w => w.hp > 0);
  
  if (drState === 'playing' && aliveCount <= 1 && !drEntities[0].isDead) drEndGame(1);
  
  if (drState === 'playing') { drStorm.radius -= drStorm.shrinkRate; if (drStorm.radius < 50) drStorm.radius = 50; }
  drRender();
}

function drRender() {
  const p = drEntities[0];
  
  if (!p.isDead && p.dropped) { cam.x = p.x - canvas.width / 2; cam.y = p.y - canvas.height / 2; } 
  else if (drState === 'bus' && !p.dropped) { cam.x = drBus.x - canvas.width / 2; cam.y = drBus.y - canvas.height / 2; }
  
  cam.x = Math.max(0, Math.min(MAP_SIZE - canvas.width, cam.x));
  cam.y = Math.max(0, Math.min(MAP_SIZE - canvas.height, cam.y));
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(-cam.x, -cam.y);
  
  ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
  
  ctx.beginPath(); ctx.arc(drStorm.x, drStorm.y, drStorm.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e'; ctx.fill();
  
  ctx.beginPath(); ctx.rect(0, 0, MAP_SIZE, MAP_SIZE);
  ctx.arc(drStorm.x, drStorm.y, drStorm.radius, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'; ctx.fill();
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.stroke();

  ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  drChests.forEach(c => ctx.fillText('🧰', c.x, c.y));
  
  drWalls.forEach(w => {
     ctx.font = '36px Arial'; ctx.globalAlpha = w.hp / 100;
     ctx.fillText('🧱', w.x, w.y); ctx.globalAlpha = 1;
  });

  for (let e of drEntities) {
    if (!e.dropped) continue;
    if (e.isDead) { ctx.font = '20px Arial'; ctx.fillText('🦴', e.x, e.y); continue; }
    
    ctx.save(); ctx.translate(e.x, e.y);
    let pAngle = 0;
    if (e.isPlayer && drState === 'playing') { pAngle = Math.atan2((mousePos.y + cam.y) - e.y, (mousePos.x + cam.x) - e.x); }
    else if (e.state === 'fight' && e.targetEnemy) { pAngle = Math.atan2(e.targetEnemy.y - e.y, e.targetEnemy.x - e.x); }
    else if (e.targetX) { pAngle = Math.atan2(e.targetY - e.y, e.targetX - e.x); }
    
    if (Math.abs(pAngle) > Math.PI / 2) { ctx.scale(-1, 1); }
    ctx.font = '30px Arial'; ctx.fillText(e.emoji, 0, 0); ctx.restore();
    
    const hw = 15;
    if (e.shield > 0) {
       ctx.fillStyle = '#0ea5e9'; ctx.fillRect(e.x - hw, e.y - 25, 30 * (e.shield / e.maxShield), 4);
       ctx.fillStyle = 'red'; ctx.fillRect(e.x - hw, e.y - 20, 30, 4);
       ctx.fillStyle = '#4ade80'; ctx.fillRect(e.x - hw, e.y - 20, 30 * (e.hp / e.maxHp), 4);
    } else {
       ctx.fillStyle = 'red'; ctx.fillRect(e.x - hw, e.y - 25, 30, 4);
       ctx.fillStyle = '#4ade80'; ctx.fillRect(e.x - hw, e.y - 25, 30 * (e.hp / e.maxHp), 4);
    }
  }
  
  ctx.fillStyle = '#fbbf24';
  drProjectiles.forEach(pr => { ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI*2); ctx.fill(); });
  
  if (drState === 'bus') {
    ctx.save(); ctx.translate(drBus.x, drBus.y);
    if (drBus.angle > Math.PI/2) ctx.scale(-1, 1);
    ctx.font = '50px Arial'; ctx.fillText('🚌', 0, 0); ctx.restore();
    
    ctx.restore();
    ctx.font = '20px Arial'; ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 3;
    ctx.strokeText('Press SPACE to eject into Fortzone!', canvas.width/2, 50);
    ctx.fillText('Press SPACE to eject into Fortzone!', canvas.width/2, 50);
    ctx.save(); ctx.translate(-cam.x, -cam.y);
  }
  ctx.restore();
  
  if (p && p.dropped && !p.isDead) {
     ctx.font = '16px Arial'; ctx.fillStyle = 'white'; ctx.textAlign = 'left';
     ctx.fillText('🧱 Mats: ' + p.mats, 10, canvas.height - 20);
     ctx.fillText('🔥 Lvl: ' + p.weaponLvl, 10, canvas.height - 40);
  }
}
