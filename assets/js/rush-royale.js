/* DRAG0N RUSH ROYALE TOWER DEFENSE MERGE ENGINE (2026) */
(function() {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;

  // Unit Types Definition
  const UNIT_TYPES = {
    ARCHER: { name: 'Gunslinger', icon: '🏹', color: '#38bdf8', damage: 35, speed: 800, range: 220, type: 'single' },
    MAGE: { name: 'Pyromancer', icon: '🔥', color: '#f43f5e', damage: 60, speed: 1200, range: 180, type: 'splash' },
    LIGHTNING: { name: 'Zeus Zap', icon: '⚡', color: '#fbbf24', damage: 45, speed: 900, range: 200, type: 'chain' },
    POISON: { name: 'Venom Alchemist', icon: '🧪', color: '#34d399', damage: 20, speed: 1000, range: 200, type: 'dot' },
    FROST: { name: 'Frost Sorceress', icon: '❄️', color: '#a855f7', damage: 25, speed: 1100, range: 190, type: 'slow' }
  };

  const TYPE_KEYS = Object.keys(UNIT_TYPES);

  // Game state
  let canvas, ctx;
  let grid = []; // 3 rows x 5 cols = 15 tiles
  let creeps = [];
  let projectiles = [];
  let floatingTexts = [];
  let mana = 300;
  let spawnCost = 100;
  let lives = 3;
  let wave = 1;
  let waveTimer = 0;
  let creepsToSpawn = 0;
  let spawnInterval = 0;
  let isGameOver = false;
  let isPaused = false;
  let selectedTile = null;
  let gameLoopId = null;

  // Power Up Levels per unit type
  let powerLevels = { ARCHER: 1, MAGE: 1, LIGHTNING: 1, POISON: 1, FROST: 1 };

  // Path definition for Creeps (starts top right, travels along track down to bottom portal)
  const PATH = [
    { x: 440, y: -20 },
    { x: 440, y: 120 },
    { x: 40,  y: 120 },
    { x: 40,  y: 280 },
    { x: 440, y: 280 },
    { x: 440, y: 450 },
    { x: 240, y: 450 },
    { x: 240, y: 620 }
  ];

  function initGame() {
    canvas = document.getElementById('rr-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Initialize 3x5 grid in lower section of canvas
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        grid.push({
          row: r, col: c,
          x: 25 + c * 88,
          y: 470 + r * 52,
          w: 80, h: 48,
          unit: null
        });
      }
    }

    mana = 350;
    spawnCost = 100;
    lives = 3;
    wave = 1;
    creeps = [];
    projectiles = [];
    floatingTexts = [];
    isGameOver = false;
    selectedTile = null;
    powerLevels = { ARCHER: 1, MAGE: 1, LIGHTNING: 1, POISON: 1, FROST: 1 };

    startWave(1);

    canvas.removeEventListener('click', handleCanvasClick);
    canvas.addEventListener('click', handleCanvasClick);

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);

    updateUI();
  }

  function startWave(waveNum) {
    wave = waveNum;
    const isBossWave = (wave % 5 === 0);
    creepsToSpawn = isBossWave ? 1 : (10 + wave * 3);
    spawnInterval = isBossWave ? 2000 : Math.max(400, 1200 - wave * 40);
    waveTimer = 0;
  }

  function spawnCreep() {
    const isBoss = (wave % 5 === 0) && creepsToSpawn === 1;
    const baseHp = 100 * Math.pow(1.25, wave - 1);
    const hp = isBoss ? baseHp * 25 : baseHp;
    const speed = isBoss ? 0.6 : (0.9 + Math.min(0.8, wave * 0.05));

    creeps.push({
      id: Math.random(),
      x: PATH[0].x,
      y: PATH[0].y,
      pathIdx: 0,
      hp: hp,
      maxHp: hp,
      speed: speed,
      slowTimer: 0,
      poisonTimer: 0,
      poisonDmg: 0,
      isBoss: isBoss,
      radius: isBoss ? 22 : 12,
      color: isBoss ? '#ef4444' : (wave % 2 === 0 ? '#38bdf8' : '#fbbf24')
    });
  }

  window.spawnRRUnit = function() {
    if (isGameOver || mana < spawnCost) return;

    // Find empty tiles
    const emptyTiles = grid.filter(t => !t.unit);
    if (emptyTiles.length === 0) {
      alert("Grid is full! Merge units of the same type and rank to free up space!");
      return;
    }

    mana -= spawnCost;
    spawnCost = Math.floor(spawnCost * 1.12);

    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const randomKey = TYPE_KEYS[Math.floor(Math.random() * TYPE_KEYS.length)];

    randomTile.unit = {
      typeKey: randomKey,
      rank: 1,
      lastShot: 0
    };

    updateUI();
  };

  window.upgradeRRType = function(typeKey) {
    const cost = powerLevels[typeKey] * 150;
    if (mana >= cost && powerLevels[typeKey] < 5) {
      mana -= cost;
      powerLevels[typeKey]++;
      updateUI();
    }
  };

  function handleCanvasClick(e) {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Check grid click
    for (let tile of grid) {
      if (mx >= tile.x && mx <= tile.x + tile.w && my >= tile.y && my <= tile.y + tile.h) {
        if (!selectedTile) {
          if (tile.unit) selectedTile = tile;
        } else {
          // Try to merge if clicking on another tile with same unit and rank
          if (selectedTile !== tile && tile.unit && selectedTile.unit) {
            const u1 = selectedTile.unit;
            const u2 = tile.unit;
            if (u1.typeKey === u2.typeKey && u1.rank === u2.rank && u1.rank < 5) {
              // Merge! Upgrade target tile to rank + 1, assign new random type or same
              const nextRank = u1.rank + 1;
              const nextKey = TYPE_KEYS[Math.floor(Math.random() * TYPE_KEYS.length)];
              tile.unit = {
                typeKey: nextKey,
                rank: nextRank,
                lastShot: 0
              };
              selectedTile.unit = null;
              selectedTile = null;

              // Spark VFX & Float Text
              floatingTexts.push({ x: tile.x + 40, y: tile.y + 20, text: `RANK ${nextRank}! ⭐`, color: '#fbbf24', life: 40 });
              updateUI();
              return;
            }
          }
          selectedTile = (tile.unit ? tile : null);
        }
        return;
      }
    }
    selectedTile = null;
  }

  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    if (!isPaused && !isGameOver) {
      update(dt);
    }
    render();

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    // 1. Spawning Creeps
    if (creepsToSpawn > 0) {
      waveTimer += dt * 1000;
      if (waveTimer >= spawnInterval) {
        spawnCreep();
        creepsToSpawn--;
        waveTimer = 0;
      }
    } else if (creeps.length === 0 && !isGameOver) {
      // Wave Completed!
      const reward = 50 + wave * 25;
      mana += reward;
      floatingTexts.push({ x: 240, y: 300, text: `WAVE ${wave} CLEAR! +${reward} MANA`, color: '#34d399', life: 60 });
      startWave(wave + 1);
      updateUI();
    }

    // 2. Update Creeps Position & Effects
    for (let i = creeps.length - 1; i >= 0; i--) {
      const c = creeps[i];

      // Poison DOT
      if (c.poisonTimer > 0) {
        c.poisonTimer -= dt;
        c.hp -= c.poisonDmg * dt;
      }

      // Slow timer
      let effSpeed = c.speed;
      if (c.slowTimer > 0) {
        c.slowTimer -= dt;
        effSpeed *= 0.55;
      }

      // Move along path
      const target = PATH[c.pathIdx + 1];
      if (target) {
        const dx = target.x - c.x;
        const dy = target.y - c.y;
        const dist = Math.hypot(dx, dy);
        const step = effSpeed * 65 * dt;

        if (dist <= step) {
          c.x = target.x;
          c.y = target.y;
          c.pathIdx++;
          if (c.pathIdx >= PATH.length - 1) {
            // Reached Portal Castle!
            lives--;
            creeps.splice(i, 1);
            updateUI();
            if (lives <= 0) {
              isGameOver = true;
              alert(`☠️ GAME OVER! You survived ${wave - 1} waves in Rush Royale!`);
            }
            continue;
          }
        } else {
          c.x += (dx / dist) * step;
          c.y += (dy / dist) * step;
        }
      }

      if (c.hp <= 0) {
        const manaGain = c.isBoss ? 150 : (10 + Math.floor(wave * 1.5));
        mana += manaGain;
        creeps.splice(i, 1);
        updateUI();
      }
    }

    // 3. Units Attack Creeps
    const nowMs = performance.now();
    for (let tile of grid) {
      if (!tile.unit || creeps.length === 0) continue;

      const u = tile.unit;
      const def = UNIT_TYPES[u.typeKey];
      const pLvl = powerLevels[u.typeKey];

      const fireInterval = def.speed / (1 + (u.rank - 1) * 0.35);
      if (nowMs - u.lastShot >= fireInterval) {
        // Find target in range
        const ux = tile.x + 40;
        const uy = tile.y + 24;

        let target = null;
        let minDist = def.range;

        for (let c of creeps) {
          const d = Math.hypot(c.x - ux, c.y - uy);
          if (d <= minDist) {
            minDist = d;
            target = c;
          }
        }

        if (target) {
          u.lastShot = nowMs;
          const baseDmg = def.damage * Math.pow(2.2, u.rank - 1) * (1 + (pLvl - 1) * 0.3);

          projectiles.push({
            sx: ux, sy: uy,
            tx: target.x, ty: target.y,
            targetId: target.id,
            color: def.color,
            damage: baseDmg,
            type: def.type,
            progress: 0
          });
        }
      }
    }

    // 4. Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.progress += dt * 6.0;

      if (p.progress >= 1.0) {
        // Hit target
        const target = creeps.find(c => c.id === p.targetId);
        if (target) {
          target.hp -= p.damage;
          floatingTexts.push({ x: target.x, y: target.y - 10, text: `-${Math.round(p.damage)}`, color: p.color, life: 25 });

          if (p.type === 'slow') {
            target.slowTimer = 2.5;
          } else if (p.type === 'dot') {
            target.poisonTimer = 3.0;
            target.poisonDmg = p.damage * 0.8;
          } else if (p.type === 'splash') {
            // Damage nearby creeps
            for (let c of creeps) {
              if (c !== target && Math.hypot(c.x - target.x, c.y - target.y) < 60) {
                c.hp -= p.damage * 0.5;
              }
            }
          }
        }
        projectiles.splice(i, 1);
      }
    }

    // 5. Update Floating Texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= dt * 25;
      ft.life -= dt * 60;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background Arena Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#0b0e17');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Track Path
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) {
      ctx.lineTo(PATH[i].x, PATH[i].y);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Castle / Portal Endpoint
    const endP = PATH[PATH.length - 1];
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(endP.x, endP.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`CASTLE (${lives}❤️)`, endP.x, endP.y + 4);

    // Draw Grid Slots
    for (let tile of grid) {
      const isSel = (selectedTile === tile);
      ctx.fillStyle = isSel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isSel ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 10);
      ctx.fill();
      ctx.stroke();

      // Render Unit if present
      if (tile.unit) {
        const u = tile.unit;
        const def = UNIT_TYPES[u.typeKey];

        // Unit background pill
        ctx.fillStyle = def.color + '33';
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tile.x + 4, tile.y + 4, tile.w - 8, tile.h - 8, 8);
        ctx.fill();
        ctx.stroke();

        // Icon & Rank Stars
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(def.icon, tile.x + 30, tile.y + 32);

        // Rank indicator
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('⭐'.repeat(u.rank), tile.x + 58, tile.y + 30);
      }
    }

    // Draw Creeps
    for (let c of creeps) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Health bar
      const hpPct = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(c.x - 16, c.y - c.radius - 8, 32, 5);
      ctx.fillStyle = hpPct > 0.4 ? '#34d399' : '#ef4444';
      ctx.fillRect(c.x - 16, c.y - c.radius - 8, 32 * hpPct, 5);
    }

    // Draw Projectiles
    for (let p of projectiles) {
      const curX = p.sx + (p.tx - p.sx) * p.progress;
      const curY = p.sy + (p.ty - p.sy) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Floating Damage Texts
    for (let ft of floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
  }

  function updateUI() {
    const manaEl = document.getElementById('rr-mana');
    const costEl = document.getElementById('rr-spawn-cost');
    const waveEl = document.getElementById('rr-wave');
    const livesEl = document.getElementById('rr-lives');

    if (manaEl) manaEl.innerText = mana;
    if (costEl) costEl.innerText = spawnCost;
    if (waveEl) waveEl.innerText = wave;
    if (livesEl) livesEl.innerText = '❤️'.repeat(lives);

    // Power level buttons
    TYPE_KEYS.forEach(k => {
      const btn = document.getElementById(`rr-up-${k.toLowerCase()}`);
      if (btn) {
        const lvl = powerLevels[k];
        const cost = lvl * 150;
        btn.innerText = `Power Lvl ${lvl} (${cost}M)`;
        btn.disabled = (mana < cost || lvl >= 5);
      }
    });
  }

  window.initRushRoyaleUI = function() {
    initGame();
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rr-canvas')) {
      initGame();
    }
  });
})();
