/**
 * From Darkness to Light - Main Game Loop
 */
import { getRandomLore, getRandomChoices, applyChoiceOption } from './choices.js';
import { generateLevelMap } from './mapGenerator.js';
import { generateTerminalResponse } from './aiTerminal.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const narrativeTerminal = document.getElementById('narrative-terminal');
const narrativeText = document.getElementById('narrative-text');
const narrativeInput = document.getElementById('narrative-input');
const healthBar = document.getElementById('health-bar');
const lightEnergyBar = document.getElementById('light-energy');

// Game State
let lastTime = 0;
let width = window.innerWidth;
let height = window.innerHeight;

const state = {
  health: 100,
  maxHealth: 100,
  lightEnergy: 100,
  maxLightEnergy: 100,
  whisperTimer: 0,
  currentLevelIdx: 0,
  moral: 0,
  paused: false,
  shieldTimer: 0,
  flashTimer: 0,
  gatewayPos: null,
  relics: { boots: false, lens: false, core: false }
};

const choiceOverlay = document.getElementById('choice-overlay');
const choiceDesc = document.getElementById('choice-desc');
const choiceButtonsContainer = document.getElementById('choice-buttons-container');
let activeChoiceTile = null;

const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

// Map configuration
const tileSize = 100;
const levels = [
  {
    name: "Ruined Hollow",
    whisper: "Seek the golden gateway.",
    type: "maze"
  },
  {
    name: "Void Depths",
    whisper: "The darkness here is suffocating.",
    type: "void"
  },
  {
    name: "Sanctuary of Light",
    whisper: "You have found the truth. Peace at last.",
    type: "sanctuary"
  }
];

let mazeMap = [];
let mapRows = 0;
let mapCols = 0;
let mapWidth = 0;
let mapHeight = 0;

// World objects
const player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  speed: 250,
  radius: 12,
  baseLightRadius: 180,
  currentLightRadius: 180,
  targetLightRadius: 180,
};

const companion = {
  x: 0,
  y: 0,
  radius: 6,
  speed: 180,
  singTimer: 0
};

let fragments = [];
let monsters = [];
let projectiles = [];
let spawnTimer = 0;
let mouseX = width / 2;
let mouseY = height / 2;

const ambientParticles = [];
for (let i = 0; i < 150; i++) {
  ambientParticles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 40 - 20,
    radius: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.5 + 0.1
  });
}

// Render options
let camX = 0;
let camY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function loadLevel(index) {
  if (index >= levels.length) return; // beat the game conceptually
  state.currentLevelIdx = index;
  const level = levels[index];
  
  // 120x120 is roughly 50x larger area than the original 20x13
  mazeMap = generateLevelMap(level.type, 120, 120);
  
  mapRows = mazeMap.length;
  mapCols = mazeMap[0].length;
  mapWidth = mapCols * tileSize;
  mapHeight = mapRows * tileSize;
  
  state.gatewayPos = null;
  for(let r=0; r<mapRows; r++) {
    for(let c=0; c<mapCols; c++) {
      if(mazeMap[r][c] === 3) {
        state.gatewayPos = { x: c*tileSize + tileSize/2, y: r*tileSize + tileSize/2 };
        break;
      }
    }
  }

  // reset player
  player.x = 1.5 * tileSize;
  player.y = 1.5 * tileSize;
  companion.x = player.x + 50;
  companion.y = player.y;
  
  // reset entities
  fragments = [];
  monsters = [];
  spawnTimer = 0;
  
  // heal player slightly upon advancing
  state.health = Math.min(state.maxHealth, state.health + 30);
  state.lightEnergy = state.maxLightEnergy; // full light 

  triggerWhisper(level.whisper);
}

// Initialize canvas size
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// Input handling
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  
  if (!state.paused) {
    if (e.key === '1') {
      if (state.lightEnergy >= 20) {
        state.lightEnergy -= 20;
        const targetX = mouseX + camX;
        const targetY = mouseY + camY;
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
           const hasLens = state.relics.lens;
           projectiles.push({
             x: player.x,
             y: player.y,
             vx: dx / dist,
             vy: dy / dist,
             speed: hasLens ? 850 : 550,
             radius: 6,
             life: hasLens ? 4.0 : 2.0
           });
        }
      } else {
        triggerWhisper("Not enough light for Solar Flare.", true);
      }
    } else if (e.key === '2') {
      if (state.lightEnergy >= 40 && state.shieldTimer <= 0) {
        state.lightEnergy -= 40;
        state.shieldTimer = 7.0;
        triggerWhisper("Light shield activated.", true);
      } else if (state.lightEnergy < 40) {
        triggerWhisper("Not enough light.", true);
      }
    } else if (e.key === '3') {
      if (state.lightEnergy >= 90) {
        state.lightEnergy -= 90;
        state.flashTimer = 0.5;
        triggerWhisper("The Guardians wake.", true);
        for (let i = monsters.length - 1; i >= 0; i--) {
           const m = monsters[i];
           const dx = player.x - m.x;
           const dy = player.y - m.y;
           if (Math.sqrt(dx*dx + dy*dy) <= player.currentLightRadius * 1.5) {
             monsters.splice(i, 1);
           }
        }
      } else {
        triggerWhisper("Not enough light.", true);
      }
    } else if (e.key === '4') {
      if (state.lightEnergy >= 5) {
        state.lightEnergy -= 5;
        companion.singTimer = 1.5;
        
        let gx = -1, gy = -1;
        for (let r=0; r<mapRows; r++) {
         for (let c=0; c<mapCols; c++) {
           if (mazeMap[r][c] === 3) {
             gx = c * tileSize + tileSize/2;
             gy = r * tileSize + tileSize/2;
             break;
           }
         }
         if (gx !== -1) break;
        }

        if (gx !== -1) {
          const dx = gx - player.x;
          const dy = gy - player.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          let loudness = "very softly"; // > 6000
          if (dist < 1000) loudness = "deafeningly";
          else if (dist < 3000) loudness = "loudly";
          else if (dist < 6000) loudness = "clearly";
          
          let dirY = dy < -200 ? "North" : (dy > 200 ? "South" : "");
          let dirX = dx < -200 ? "West" : (dx > 200 ? "East" : "");
          let direction = `${dirY}${dirY && dirX ? "-" : ""}${dirX}`;
          if (!direction) direction = "nearby";

          triggerWhisper(`The companion sings ${loudness}... echoing toward the ${direction}.`, true);
        } else {
          triggerWhisper(`The companion sings softly... but there is nowhere left to go.`, true);
        }
      } else {
        triggerWhisper("Not enough light.", true);
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Load external sound assets provided by User!
const sfxCompanion = new Audio("./347_Elven_Procession.mp3");
const sfxDarkness = new Audio("./506_The_Verdant_Dark.mp3");
const sfxLore = new Audio("./502_Sentient_Eye.mp3");

function playSoundEffect(type = "darkness") {
  let trackToPlay;
  
  if (type === "companion") trackToPlay = sfxCompanion;
  else if (type === "lore") trackToPlay = sfxLore;
  else trackToPlay = sfxDarkness;

  if (trackToPlay._timeout) clearTimeout(trackToPlay._timeout);
  if (trackToPlay._fadeInterval) clearInterval(trackToPlay._fadeInterval);

  trackToPlay.volume = 1.0;
  trackToPlay.currentTime = 0;
  trackToPlay.play().catch(e => console.warn("Audio blocked by browser:", e));

  // Play solidly for 3.5 seconds, then linearly fade out the volume over 1.5 seconds
  trackToPlay._timeout = setTimeout(() => {
    let fadeSteps = 15;
    let currentStep = 0;
    
    trackToPlay._fadeInterval = setInterval(() => {
      currentStep++;
      let newVolume = 1.0 * (1 - (currentStep / fadeSteps));
      if (newVolume < 0) newVolume = 0;
      
      trackToPlay.volume = newVolume;
      
      if (currentStep >= fadeSteps) {
        clearInterval(trackToPlay._fadeInterval);
        trackToPlay.pause();
        trackToPlay.currentTime = 0;
        trackToPlay.volume = 1.0; // Reset for the next trigger
      }
    }, 100); 
  }, 3500);
}

const whispers = [
  "You were not the first to fall...",
  "The darkness remembers your shape.",
  "Seek the fractured light within the walls.",
  "They are drawn to your warmth.",
  "Do not step on the cursed runes."
];

function triggerWhisper(text, isResponse = false) {
  let type = text.includes("companion sings") ? "companion" : "darkness";
  playSoundEffect(type);
  
  narrativeText.textContent = text;
  narrativeTerminal.classList.remove('hidden');
  if (isResponse) {
    narrativeInput.value = '';
    narrativeInput.blur();
  }
  setTimeout(() => {
    if (document.activeElement !== narrativeInput) {
      narrativeTerminal.classList.add('hidden');
    }
  }, isResponse ? 6000 : 4000);
}

narrativeInput.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') {
    const question = narrativeInput.value.trim();
    
    let wasOnTerminal = false;
    if (activeChoiceTile && mazeMap[activeChoiceTile.r] && mazeMap[activeChoiceTile.r][activeChoiceTile.c] === 5) {
      wasOnTerminal = true;
      mazeMap[activeChoiceTile.r][activeChoiceTile.c] = 0;
      state.paused = false;
    }

    if (!question) {
      if (wasOnTerminal) narrativeTerminal.classList.add('hidden');
      return;
    }
    
    const response = generateTerminalResponse(question);
    triggerWhisper(response, true);
  }
});

function resolveWallCollision(entity) {
  let headRow = Math.floor(entity.y / tileSize);
  let headCol = Math.floor(entity.x / tileSize);
  for(let r = headRow - 1; r <= headRow + 1; r++) {
    for(let c = headCol - 1; c <= headCol + 1; c++) {
      if (r >= 0 && r < mapRows && c >= 0 && c < mapCols) {
        if (mazeMap[r][c] === 1) { // Wall
          const wallX = c * tileSize;
          const wallY = r * tileSize;
          const testX = Math.max(wallX, Math.min(entity.x, wallX + tileSize));
          const testY = Math.max(wallY, Math.min(entity.y, wallY + tileSize));
          
          const distX = entity.x - testX;
          const distY = entity.y - testY;
          const distSq = distX * distX + distY * distY;
          
          if (distSq < entity.radius * entity.radius) {
            const dist = Math.sqrt(distSq);
            if (dist === 0) continue;
            const overlap = entity.radius - dist;
            entity.x += (distX / dist) * overlap;
            entity.y += (distY / dist) * overlap;
          }
        }
      }
    }
  }
}

function getRandomEmptyPosition(aroundX, aroundY, minDistance, maxDistance) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = minDistance + Math.random() * (maxDistance - minDistance);
    const ex = aroundX + Math.cos(angle) * dist;
    const ey = aroundY + Math.sin(angle) * dist;
    
    if (ex < 0 || ex >= mapWidth || ey < 0 || ey >= mapHeight) continue;
    
    const r = Math.floor(ey / tileSize);
    const c = Math.floor(ex / tileSize);
    if (mazeMap[r][c] === 0) {
      return { x: ex, y: ey };
    }
  }
  return null;
}

// Update game logic
function update(dt) {
  if (state.paused) return;

  if (state.shieldTimer > 0) state.shieldTimer -= dt;
  if (state.flashTimer > 0) state.flashTimer -= dt;
  if (companion.singTimer > 0) companion.singTimer -= dt;
  
  if (state.relics.core) {
    state.health = Math.min(state.maxHealth, state.health + 5 * dt);
  }

  // Projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    
    const px = p.x;
    const py = p.y;
    
    p.x += p.vx * p.speed * dt;
    p.y += p.vy * p.speed * dt;
    p.life -= dt;
    
    if (p.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }
    
    // Wall bounce logic
    const prevRow = Math.floor(py / tileSize);
    const prevCol = Math.floor(px / tileSize);
    const headRow = Math.floor(p.y / tileSize);
    const headCol = Math.floor(p.x / tileSize);
    
    if (headRow >= 0 && headRow < mapRows && headCol >= 0 && headCol < mapCols) {
      if (mazeMap[headRow][headCol] === 1) {
        let bounced = false;
        if (headCol !== prevCol && mazeMap[prevRow] && mazeMap[prevRow][headCol] === 1) {
          p.vx *= -1;
          p.x = px;
          bounced = true;
        }
        if (headRow !== prevRow && mazeMap[headRow] && mazeMap[headRow][prevCol] === 1) {
          p.vy *= -1;
          p.y = py;
          bounced = true;
        }
        if (!bounced) {
          p.vx *= -1;
          p.vy *= -1;
          p.x = px;
          p.y = py;
        }
      }
    }
    
    let hit = false;
    for (let j = monsters.length - 1; j >= 0; j--) {
      let m = monsters[j];
      const dx = m.x - p.x;
      const dy = m.y - p.y;
      if (dx*dx + dy*dy < (m.radius + p.radius)**2) {
        m.hp -= 5;
        m.x += p.vx * 1500 * dt; // knockback
        m.y += p.vy * 1500 * dt;
        hit = true;
        if (m.hp <= 0) {
          monsters.splice(j, 1);
        }
        break;
      }
    }
    if (hit) {
      projectiles.splice(i, 1);
    }
  }

  // Player movement
  player.vx = 0;
  player.vy = 0;
  
  if (keys.w || keys.ArrowUp) player.vy -= 1;
  if (keys.s || keys.ArrowDown) player.vy += 1;
  if (keys.a || keys.ArrowLeft) player.vx -= 1;
  if (keys.d || keys.ArrowRight) player.vx += 1;
  
  const len = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
  if (len > 0) {
    player.vx /= len;
    player.vy /= len;
  }
  
  player.x += player.vx * player.speed * dt;
  player.y += player.vy * player.speed * dt;
  
  player.x = Math.max(player.radius, Math.min(mapWidth - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(mapHeight - player.radius, player.y));
  
  resolveWallCollision(player);

  const compassEl = document.getElementById('compass-arrow');
  if (state.gatewayPos && compassEl) {
    const gx = state.gatewayPos.x - player.x;
    const gy = state.gatewayPos.y - player.y;
    // +PI/2 because the CSS arrow points UP (0deg = North) instead of RIGHT (+x)
    const angle = Math.atan2(gy, gx) + Math.PI/2;
    compassEl.style.transform = `rotate(${angle}rad)`;
  } else if (compassEl) {
    compassEl.style.transform = `rotate(0rad)`; // hide or idle
  }
  
  // Floor check
  const pRow = Math.floor(player.y / tileSize);
  const pCol = Math.floor(player.x / tileSize);
  if (pRow >= 0 && pRow < mapRows && pCol >= 0 && pCol < mapCols) {
    const tile = mazeMap[pRow][pCol];
    if (tile === 2) {
      // Trap
      state.health -= 30 * dt;
      player.x += (Math.random() - 0.5) * 5;
      player.y += (Math.random() - 0.5) * 5;
    } else if (tile === 3) {
      // Gateway -> Next Level
      loadLevel(state.currentLevelIdx + 1);
      return; // Skip rest of update
    } else if (tile === 4) {
      // Lost Soul Altar
      state.paused = true;
      activeChoiceTile = { r: pRow, c: pCol };
      
      // Seed lore and choices
      choiceDesc.textContent = getRandomLore();
      playSoundEffect("lore");
      
      choiceButtonsContainer.innerHTML = '';
      const chosenOpts = getRandomChoices(2);
      
      chosenOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
          applyChoiceOption(state, opt);
          state.paused = false;
          choiceOverlay.classList.add('hidden');
          mazeMap[activeChoiceTile.r][activeChoiceTile.c] = 0;
          triggerWhisper(opt.moral < 0 ? "A chilling wind blows." : "The core feels warmer.");
        });
        choiceButtonsContainer.appendChild(btn);
      });
      
      choiceOverlay.classList.remove('hidden');
      return;
    } else if (tile === 5) {
      // Narrative Terminal
      state.paused = true;
      activeChoiceTile = { r: pRow, c: pCol };
      narrativeText.textContent = "The terminal hums. Input your query...";
      playSoundEffect("darkness");
      narrativeInput.value = "";
      narrativeTerminal.classList.remove('hidden');
      setTimeout(() => narrativeInput.focus(), 50);
      return;
    } else if (tile === 6) {
      // Relic Chest
      state.paused = true;
      activeChoiceTile = { r: pRow, c: pCol };
      
      const unobtainedRelics = [];
      if (!state.relics.boots) unobtainedRelics.push({ id: 'boots', title: 'Boots of the Void', desc: 'Increases your base movement speed permanently.'});
      if (!state.relics.lens) unobtainedRelics.push({ id: 'lens', title: 'Prismatic Lens', desc: 'Solar Flares travel faster and have their lifespan doubled.'});
      if (!state.relics.core) unobtainedRelics.push({ id: 'core', title: 'Core of Eternity', desc: 'Passively regenerates your structural vitality over time.'});
      
      if (unobtainedRelics.length === 0) {
         mazeMap[pRow][pCol] = 0;
         state.paused = false;
         triggerWhisper("The chest is empty. You wield all the relics.", true);
         return;
      }
      
      const relic = unobtainedRelics[Math.floor(Math.random() * unobtainedRelics.length)];
      
      document.getElementById('choice-title').textContent = "A Forgotten Relic";
      choiceDesc.textContent = `You found the **${relic.title}**. ${relic.desc}`;
      playSoundEffect("lore");
      
      choiceButtonsContainer.innerHTML = '';
      const btn = document.createElement('button');
      btn.textContent = "Equip Relic";
      btn.addEventListener('click', () => {
        state.relics[relic.id] = true;
        if (relic.id === 'boots') player.speed = 350;
        
        state.paused = false;
        choiceOverlay.classList.add('hidden');
        mazeMap[activeChoiceTile.r][activeChoiceTile.c] = 0; // chest consumed
        document.getElementById('choice-title').textContent = "A Lost Soul"; // reset for altars
        triggerWhisper(`Equipped: ${relic.title}.`, true);
      });
      choiceButtonsContainer.appendChild(btn);
      
      choiceOverlay.classList.remove('hidden');
      return;
    }
  }
  
  // Dynamic light radius based on energy
  player.targetLightRadius = 50 + (state.lightEnergy / state.maxLightEnergy) * player.baseLightRadius;
  player.currentLightRadius += (player.targetLightRadius - player.currentLightRadius) * 5 * dt;

  // Companion logic driven by moral
  const offsetDistance = 40 + (Math.max(0, -state.moral) * 30); // Drifts further if moral is negative
  const dx = player.x - companion.x;
  const dy = player.y - companion.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > offsetDistance) {
    companion.x += (dx / dist) * companion.speed * dt;
    companion.y += (dy / dist) * companion.speed * dt;
  }
  companion.y += Math.sin(Date.now() * 0.005) * 0.5;
  resolveWallCollision(companion);

  // Entities only spawn if there is an actual chance
  if (state.currentLevelIdx < 2) {
    spawnTimer += dt;
    // Spawn faster on higher levels
    const spawnRate = state.currentLevelIdx === 1 ? 1.0 : 1.5; 
    
    if (spawnTimer > spawnRate) {
      spawnTimer = 0;
      const pos = getRandomEmptyPosition(player.x, player.y, player.currentLightRadius + 100, 600);
      if (pos) {
        if (Math.random() > 0.4) {
          fragments.push({ x: pos.x, y: pos.y, radius: 5, value: 15 });
        } else {
          // monsters faster in later areas
          const mSpeed = state.currentLevelIdx === 1 ? 130 : 100;
          monsters.push({ x: pos.x, y: pos.y, radius: 12, speed: mSpeed, hp: 10 });
        }
      }
    }

    for (let i = fragments.length - 1; i >= 0; i--) {
      const f = fragments[i];
      f.y += Math.sin(Date.now() * 0.003 + f.x) * 0.2; 
      
      const dfx = player.x - f.x;
      const dfy = player.y - f.y;
      if (dfx * dfx + dfy * dfy < (player.radius + f.radius) ** 2) {
        state.lightEnergy = Math.min(state.maxLightEnergy, state.lightEnergy + f.value);
        fragments.splice(i, 1);
      }
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      const dmx = player.x - m.x;
      const dmy = player.y - m.y;
      const distToPlayer = Math.sqrt(dmx * dmx + dmy * dmy);
      
      const inLight = distToPlayer < player.currentLightRadius;
      const mSpeed = inLight ? m.speed * 1.5 : m.speed * 0.6;
      
      if (distToPlayer > 0.1) {
        m.x += (dmx / distToPlayer) * mSpeed * dt;
        m.y += (dmy / distToPlayer) * mSpeed * dt;
      }
      
      resolveWallCollision(m);
      
      const currentDmx = player.x - m.x;
      const currentDmy = player.y - m.y;
      let currentDist = Math.sqrt(currentDmx * currentDmx + currentDmy * currentDmy);
      if (currentDist === 0) currentDist = 0.1; // prevent divide by zero

      if (state.shieldTimer > 0 && currentDist < player.radius + m.radius + 18) {
         // Rigid shield: forces monsters to stay outside the shield border
         const overlap = (player.radius + m.radius + 18) - currentDist;
         m.x -= (currentDmx / currentDist) * overlap;
         m.y -= (currentDmy / currentDist) * overlap;
      } else if (currentDist < player.radius + m.radius) {
         state.health -= 15 * dt;
         player.x += (currentDmx / currentDist) * 150 * dt;
         player.y += (currentDmy / currentDist) * 150 * dt;
      }
      
      if (distToPlayer > 1500) {
        monsters.splice(i, 1);
      }
    }
  }

  // Update Ambient Particles
  for (let p of ambientParticles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Screen wrapping based on camera bounds
    if (p.x < camX - 50) p.x = camX + width + 50;
    if (p.x > camX + width + 50) p.x = camX - 50;
    if (p.y < camY - 50) p.y = camY + height + 50;
    if (p.y > camY + height + 50) p.y = camY - 50;
  }

  // Energy drain over time
  state.lightEnergy -= 2 * dt;
  if (state.lightEnergy < 0) state.lightEnergy = 0;
  
  if (state.health <= 0) {
    state.health = 0;
    triggerWhisper("The darkness consumes you...");
  }

  state.whisperTimer += dt;
  if (state.whisperTimer > Math.random() * 10 + 15) {
    state.whisperTimer = 0;
    triggerWhisper(whispers[Math.floor(Math.random() * whispers.length)]);
  }

  // Update UI
  healthBar.style.width = `${(state.health / state.maxHealth) * 100}%`;
  lightEnergyBar.style.width = `${(state.lightEnergy / state.maxLightEnergy) * 100}%`;
}

// Offscreen darkness mask
const darkCanvas = document.createElement('canvas');
const dctx = darkCanvas.getContext('2d');

function renderBetterDarkness() {
  if (state.currentLevelIdx === 2) return; // Sanctuary of Light has no darkness

  if (darkCanvas.width !== width) darkCanvas.width = width;
  if (darkCanvas.height !== height) darkCanvas.height = height;
  dctx.clearRect(0, 0, width, height);

  const pScreenX = player.x - camX;
  const pScreenY = player.y - camY;
  const cScreenX = companion.x - camX;
  const cScreenY = companion.y - camY;

  dctx.fillStyle = 'rgba(5, 5, 5, 0.98)';
  if (state.currentLevelIdx === 1) {
    dctx.fillStyle = 'rgba(12, 5, 12, 0.99)'; // Void depths is darker and purplish
  }
  
  dctx.fillRect(0, 0, width, height);

  dctx.globalCompositeOperation = 'destination-out';
  const outerRadius = player.currentLightRadius * 1.5;
  const pGrad = dctx.createRadialGradient(
    pScreenX, pScreenY, player.currentLightRadius * 0.2, 
    pScreenX, pScreenY, outerRadius
  );
  pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  dctx.fillStyle = pGrad;
  dctx.beginPath();
  dctx.arc(pScreenX, pScreenY, outerRadius, 0, Math.PI * 2);
  dctx.fill();

  const cOuter = companion.radius * 6;
  const cGrad = dctx.createRadialGradient(
    cScreenX, cScreenY, companion.radius, 
    cScreenX, cScreenY, cOuter
  );
  cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  cGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  dctx.fillStyle = cGrad;
  dctx.beginPath();
  dctx.arc(cScreenX, cScreenY, cOuter, 0, Math.PI * 2);
  dctx.fill();

  dctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(darkCanvas, 0, 0);
}

function integratedRender() {
  camX += ((player.x - width / 2) - camX) * 0.1;
  camY += ((player.y - height / 2) - camY) * 0.1;
  
  camX = Math.max(0, Math.min(mapWidth - width, camX));
  camY = Math.max(0, Math.min(mapHeight - height, camY));

  // Determine base color by level
  if (state.currentLevelIdx === 2) {
    ctx.fillStyle = '#ffffff'; // Sanctuary of light
  } else {
    ctx.fillStyle = '#0a0a0a';
  }
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-camX, -camY);

  for (let r = 0; r < mapRows; r++) {
    for (let c = 0; c < mapCols; c++) {
      const tile = mazeMap[r][c];
      const x = c * tileSize;
      const y = r * tileSize;
      
      if (x + tileSize < camX || x > camX + width || y + tileSize < camY || y > camY + height) continue;

      if (tile === 1) {
        ctx.fillStyle = (state.currentLevelIdx === 2) ? '#eeeeee' : '#111111';
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = (state.currentLevelIdx === 2) ? '#dddddd' : '#222222';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      } else if (tile === 2) {
        ctx.fillStyle = '#220000';
        ctx.fillRect(x + 10, y + 10, tileSize - 20, tileSize - 20);
        ctx.strokeStyle = '#aa0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + tileSize/2, y + 20);
        ctx.lineTo(x + tileSize - 20, y + tileSize - 20);
        ctx.lineTo(x + 20, y + tileSize - 20);
        ctx.closePath();
        ctx.stroke();
      } else if (tile === 3) {
        // Gateway
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffcc00';
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (tile === 4) {
        // Lost Soul Altar
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00bbff';
        ctx.fillStyle = '#00bbff';
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2 + Math.sin(Date.now() * 0.003) * 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (tile === 5) {
        // Narrative Generation Terminal
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#cc00ff';
        
        ctx.strokeStyle = '#aa00dd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
          const angle = 0.5 * i - Date.now() * 0.002;
          const rad = i * 1.5;
          ctx.lineTo(x + tileSize/2 + Math.cos(angle) * rad, y + tileSize/2 + Math.sin(angle) * rad);
        }
        ctx.stroke();

        ctx.shadowColor = '#ffee00';
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2 + Math.cos(Date.now() * 0.005) * 3, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (tile === 6) {
        // Relic Chest (Glowing green crate)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        ctx.fillStyle = '#002211';
        ctx.fillRect(x + 25, y + 25, tileSize - 50, tileSize - 50);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 25, y + 25, tileSize - 50, tileSize - 50);
        
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2, 5 + Math.sin(Date.now()*0.005)*2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = (state.currentLevelIdx === 2) ? '#eeeeee' : '#151515';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  }

  // Draw Ambient particles
  for (let p of ambientParticles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    if (state.currentLevelIdx === 0) {
      ctx.fillStyle = `rgba(200, 150, 100, ${p.alpha})`; // Orange ash
    } else if (state.currentLevelIdx === 1) {
      ctx.fillStyle = `rgba(150, 100, 255, ${p.alpha})`; // Purple void
    } else {
      ctx.fillStyle = `rgba(255, 255, 100, ${p.alpha})`; // Golden pollen
    }
    ctx.fill();
  }

  // Entities
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fff';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = (state.currentLevelIdx === 2) ? '#444' : '#fff';
  ctx.fill();

  const compColor = state.moral < 0 ? '#ff8888' : '#ccffff';
  const compShadow = state.moral < 0 ? '#ff0000' : '#00bbff';
  
  ctx.shadowColor = compShadow;
  ctx.beginPath();
  let cRad = companion.radius;
  if (companion.singTimer > 0) {
     cRad += Math.sin(companion.singTimer * Math.PI * 6) * 4; 
  }
  ctx.arc(companion.x, companion.y, cRad, 0, Math.PI * 2);
  ctx.fillStyle = compColor;
  ctx.fill();
  
  if (companion.singTimer > 0) {
    ctx.strokeStyle = `rgba(0, 255, 255, ${companion.singTimer})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(companion.x, companion.y, cRad * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.shadowColor = '#ffcc00';
  for (const f of fragments) {
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffea66';
    ctx.fill();
  }

  for (const m of monsters) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#110000';
    ctx.fill();
    ctx.strokeStyle = '#550000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(m.x - 4, m.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.x + 4, m.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  
  // Draw player shield
  if (state.shieldTimer > 0) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.strokeStyle = `rgba(255, 255, 200, ${Math.min(1, state.shieldTimer)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 15 + Math.sin(Date.now() * 0.01)*3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Draw Projectiles
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ffea66';
  ctx.fillStyle = '#ffffff';
  for (const p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Draw Guardian Flash effect
  if (state.flashTimer > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.flashTimer * 2})`;
    ctx.fillRect(camX, camY, width, height);
  }

  ctx.restore();

  renderBetterDarkness();
}

function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (dt < 0.1) {
    update(dt);
    integratedRender();
  }

  requestAnimationFrame(gameLoop);
}

// Start
loadLevel(0);
requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  gameLoop(timestamp);
});
