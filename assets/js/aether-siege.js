/* AETHER SIEGE: GUARDIANS OF THE REALM (2026 AUTO-BATTLER & TOWER DEFENSE ENGINE) */
(function() {
  const CANVAS_WIDTH = 540;
  const CANVAS_HEIGHT = 680;

  // 8 Unique Unit Archetypes & Synergies
  const UNIT_ARCHETYPES = {
    RANGER:    { name: 'Aether Ranger',  icon: '🏹', color: '#38bdf8', damage: 45, speed: 750, range: 240, type: 'single', role: 'Damage' },
    PYRO:      { name: 'Pyromancer',     icon: '🔥', color: '#f43f5e', damage: 70, speed: 1200, range: 190, type: 'splash', role: 'Area Damage' },
    TEMPEST:   { name: 'Tempest Zap',    icon: '⚡', color: '#fbbf24', damage: 50, speed: 900, range: 210, type: 'chain', role: 'Chain Damage' },
    VENOM:     { name: 'Venom Alchemist',icon: '🧪', color: '#34d399', damage: 25, speed: 1000, range: 210, type: 'dot', role: 'Poison Debuff' },
    FROST:     { name: 'Frost Sorceress',icon: '❄️', color: '#a855f7', damage: 30, speed: 1100, range: 200, type: 'slow', role: 'Control' },
    GUARDIAN:  { name: 'Aether Guardian',icon: '🛡️', color: '#eab308', damage: 20, speed: 1300, range: 150, type: 'buff', role: 'Support' },
    SIPHON:    { name: 'Mana Siphon',    icon: '💎', color: '#06b6d4', damage: 15, speed: 1500, range: 140, type: 'econ', role: 'Economy' },
    ASSASSIN:  { name: 'Void Assassin',  icon: '⚔️', color: '#ec4899', damage: 95, speed: 1000, range: 220, type: 'crit', role: 'Specialist' }
  };

  const TYPE_KEYS = Object.keys(UNIT_ARCHETYPES);

  // Boss Roster
  const BOSS_TYPES = [
    { name: 'The Void Herald', icon: '👾', hpMult: 30, color: '#a855f7', desc: 'Purges player unit buffs periodically!' },
    { name: 'The Devourer',   icon: '👹', hpMult: 40, color: '#ef4444', desc: 'Consumes creeps to restore health!' },
    { name: 'The Cataclysm',  icon: '☄️', hpMult: 35, color: '#f97316', desc: 'Fires meteor strikes at board tiles!' }
  ];

  // Game state
  let canvas, ctx;
  let grid = []; // 3 rows x 5 cols = 15 tiles
  let creeps = [];
  let projectiles = [];
  let floatingTexts = [];
  let particles = [];
  let aether = 400; // Mana
  let summonCost = 100;
  let castleHealth = 5;
  let maxCastleHealth = 5;
  let wave = 1;
  let waveTimer = 0;
  let creepsToSpawn = 0;
  let spawnInterval = 0;
  let isGameOver = false;
  let isPaused = false;
  let selectedTile = null;
  let gameLoopId = null;
  let gameMode = 'campaign'; // 'campaign', 'endless', 'pvp'

  // Power Up Levels per archetype (1 to 5)
  let powerLevels = { RANGER: 1, PYRO: 1, TEMPEST: 1, VENOM: 1, FROST: 1, GUARDIAN: 1, SIPHON: 1, ASSASSIN: 1 };

  // Winding Path through the Astral Realm
  const PATH = [
    { x: 500, y: -20 },
    { x: 500, y: 130 },
    { x: 40,  y: 130 },
    { x: 40,  y: 290 },
    { x: 500, y: 290 },
    { x: 500, y: 470 },
    { x: 270, y: 470 },
    { x: 270, y: 660 }
  ];

  function initGame() {
    canvas = document.getElementById('as-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Initialize 3x5 Grid in lower section (y: 490 to 650)
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        grid.push({
          row: r, col: c,
          x: 20 + c * 102,
          y: 495 + r * 56,
          w: 94, h: 50,
          unit: null
        });
      }
    }

    aether = 400;
    summonCost = 100;
    castleHealth = 5;
    maxCastleHealth = 5;
    wave = 1;
    creeps = [];
    projectiles = [];
    floatingTexts = [];
    particles = [];
    isGameOver = false;
    selectedTile = null;
    powerLevels = { RANGER: 1, PYRO: 1, TEMPEST: 1, VENOM: 1, FROST: 1, GUARDIAN: 1, SIPHON: 1, ASSASSIN: 1 };

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
    creepsToSpawn = isBossWave ? 1 : (10 + wave * 4);
    spawnInterval = isBossWave ? 2500 : Math.max(350, 1100 - wave * 45);
    waveTimer = 0;
  }

  function spawnCreep() {
    const isBoss = (wave % 5 === 0) && creepsToSpawn === 1;
    const bossInfo = isBoss ? BOSS_TYPES[(Math.floor(wave / 5) - 1) % BOSS_TYPES.length] : null;

    const baseHp = 120 * Math.pow(1.24, wave - 1);
    const hp = isBoss ? baseHp * bossInfo.hpMult : baseHp;
    const speed = isBoss ? 0.55 : (0.85 + Math.min(0.75, wave * 0.04));

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
      bossInfo: bossInfo,
      radius: isBoss ? 26 : 13,
      color: isBoss ? bossInfo.color : (wave % 3 === 0 ? '#38bdf8' : (wave % 2 === 0 ? '#fbbf24' : '#f43f5e'))
    });
  }

  window.summonAetherUnit = function() {
    if (isGameOver || aether < summonCost) return;

    const emptyTiles = grid.filter(t => !t.unit);
    if (emptyTiles.length === 0) {
      alert("Board is full! Merge matching units of the same Rank to evolve your formation!");
      return;
    }

    aether -= summonCost;
    summonCost = Math.floor(summonCost * 1.13);

    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const randomKey = TYPE_KEYS[Math.floor(Math.random() * TYPE_KEYS.length)];

    randomTile.unit = {
      typeKey: randomKey,
      rank: 1,
      lastShot: 0
    };

    // Particle effect on tile
    createSparkles(randomTile.x + 47, randomTile.y + 25, UNIT_ARCHETYPES[randomKey].color, 12);
    updateUI();
  };

  window.upgradeAetherPower = function(typeKey) {
    const cost = powerLevels[typeKey] * 160;
    if (aether >= cost && powerLevels[typeKey] < 5) {
      aether -= cost;
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

    for (let tile of grid) {
      if (mx >= tile.x && mx <= tile.x + tile.w && my >= tile.y && my <= tile.y + tile.h) {
        if (!selectedTile) {
          if (tile.unit) selectedTile = tile;
        } else {
          if (selectedTile !== tile && tile.unit && selectedTile.unit) {
            const u1 = selectedTile.unit;
            const u2 = tile.unit;

            // MERGE RULE: Same Type and Same Rank
            if (u1.typeKey === u2.typeKey && u1.rank === u2.rank && u1.rank < 5) {
              const nextRank = u1.rank + 1;
              const nextKey = TYPE_KEYS[Math.floor(Math.random() * TYPE_KEYS.length)];

              tile.unit = {
                typeKey: nextKey,
                rank: nextRank,
                lastShot: 0
              };
              selectedTile.unit = null;
              selectedTile = null;

              // Merge Burst FX & Floating Text
              createSparkles(tile.x + 47, tile.y + 25, '#fbbf24', 20);
              floatingTexts.push({ x: tile.x + 47, y: tile.y + 15, text: `RANK ${nextRank}! ⭐`, color: '#fbbf24', life: 45 });
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

  function createSparkles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 2 + Math.random() * 3,
        life: 30
      });
    }
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
    // 1. Mana Siphon Passive Generation
    for (let tile of grid) {
      if (tile.unit && tile.unit.typeKey === 'SIPHON') {
        const pLvl = powerLevels['SIPHON'];
        aether += dt * (3 + tile.unit.rank * 2 + pLvl);
      }
    }

    // 2. Creep Spawning Logic
    if (creepsToSpawn > 0) {
      waveTimer += dt * 1000;
      if (waveTimer >= spawnInterval) {
        spawnCreep();
        creepsToSpawn--;
        waveTimer = 0;
      }
    } else if (creeps.length === 0 && !isGameOver) {
      // Wave Victory
      const reward = 60 + wave * 30;
      aether += reward;
      floatingTexts.push({ x: 270, y: 320, text: `WAVE ${wave} CLEARED! +${reward} AETHER`, color: '#34d399', life: 60 });
      
      // Award Dragon Coins on Boss Wave clear
      if (wave % 5 === 0) {
        let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        let bonusDC = 100 + wave * 10;
        localStorage.setItem('drag0n_dc', (curDC + bonusDC).toString());
        if (window.addXP) window.addXP(200);
        if (window.updateProfileWidget) window.updateProfileWidget();
        alert(`🏆 BOSS DEFEATED! Earned +${bonusDC} Dragon Coins & +200 XP!`);
      }

      startWave(wave + 1);
      updateUI();
    }

    // 3. Update Creeps Position & Statuses
    for (let i = creeps.length - 1; i >= 0; i--) {
      const c = creeps[i];

      if (c.poisonTimer > 0) {
        c.poisonTimer -= dt;
        c.hp -= c.poisonDmg * dt;
      }

      let effSpeed = c.speed;
      if (c.slowTimer > 0) {
        c.slowTimer -= dt;
        effSpeed *= 0.5;
      }

      const target = PATH[c.pathIdx + 1];
      if (target) {
        const dx = target.x - c.x;
        const dy = target.y - c.y;
        const dist = Math.hypot(dx, dy);
        const step = effSpeed * 70 * dt;

        if (dist <= step) {
          c.x = target.x;
          c.y = target.y;
          c.pathIdx++;
          if (c.pathIdx >= PATH.length - 1) {
            // Reached Castle Portal
            castleHealth--;
            creeps.splice(i, 1);
            updateUI();
            if (castleHealth <= 0) {
              isGameOver = true;
              alert(`☠️ SANCTUARY FALLEN! You survived ${wave - 1} waves in Aether Siege!`);
            }
            continue;
          }
        } else {
          c.x += (dx / dist) * step;
          c.y += (dy / dist) * step;
        }
      }

      if (c.hp <= 0) {
        const aetherGain = c.isBoss ? 250 : (12 + Math.floor(wave * 2));
        aether += aetherGain;
        createSparkles(c.x, c.y, c.color, 10);
        creeps.splice(i, 1);
        updateUI();
      }
    }

    // 4. Units Attack
    const nowMs = performance.now();
    for (let tile of grid) {
      if (!tile.unit || creeps.length === 0) continue;

      const u = tile.unit;
      const def = UNIT_ARCHETYPES[u.typeKey];
      const pLvl = powerLevels[u.typeKey];

      const fireInterval = def.speed / (1 + (u.rank - 1) * 0.35);
      if (nowMs - u.lastShot >= fireInterval) {
        const ux = tile.x + 47;
        const uy = tile.y + 25;

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
          let baseDmg = def.damage * Math.pow(2.2, u.rank - 1) * (1 + (pLvl - 1) * 0.35);

          // Support Guardian Aura Buff
          let buffMult = 1.0;
          for (let other of grid) {
            if (other.unit && other.unit.typeKey === 'GUARDIAN') {
              buffMult += 0.25 * other.unit.rank;
            }
          }
          baseDmg *= buffMult;

          // Assassin Critical Strike
          if (def.type === 'crit' && Math.random() < 0.35) {
            baseDmg *= 2.5;
            floatingTexts.push({ x: target.x, y: target.y - 15, text: `CRIT! 💥`, color: '#ec4899', life: 30 });
          }

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

    // 5. Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.progress += dt * 6.5;

      if (p.progress >= 1.0) {
        const target = creeps.find(c => c.id === p.targetId);
        if (target) {
          target.hp -= p.damage;
          floatingTexts.push({ x: target.x, y: target.y - 10, text: `-${Math.round(p.damage)}`, color: p.color, life: 25 });

          if (p.type === 'slow') {
            target.slowTimer = 2.8;
          } else if (p.type === 'dot') {
            target.poisonTimer = 3.2;
            target.poisonDmg = p.damage * 0.85;
          } else if (p.type === 'splash') {
            for (let c of creeps) {
              if (c !== target && Math.hypot(c.x - target.x, c.y - target.y) < 70) {
                c.hp -= p.damage * 0.55;
              }
            }
          }
        }
        projectiles.splice(i, 1);
      }
    }

    // 6. Update Particles & Texts
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= dt * 25;
      ft.life -= dt * 60;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Deep Astral Realm Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#131b2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Winding Astral Track
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) {
      ctx.lineTo(PATH[i].x, PATH[i].y);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // End Castle Sanctuary Goal
    const endP = PATH[PATH.length - 1];
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(endP.x, endP.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SANCTUARY (${castleHealth}❤️)`, endP.x, endP.y + 4);

    // Render Board Cells (3x5)
    for (let tile of grid) {
      const isSel = (selectedTile === tile);
      ctx.fillStyle = isSel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = isSel ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 12);
      ctx.fill();
      ctx.stroke();

      if (tile.unit) {
        const u = tile.unit;
        const def = UNIT_ARCHETYPES[u.typeKey];

        // Card Pill
        ctx.fillStyle = def.color + '33';
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tile.x + 4, tile.y + 4, tile.w - 8, tile.h - 8, 8);
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(def.icon, tile.x + 35, tile.y + 33);

        // Rank Stars
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('⭐'.repeat(u.rank), tile.x + 68, tile.y + 30);
      }
    }

    // Render Creeps & Bosses
    for (let c of creeps) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (c.isBoss) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.bossInfo.icon, c.x, c.y + 5);
      }

      // Health bar
      const hpPct = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(c.x - 18, c.y - c.radius - 8, 36, 5);
      ctx.fillStyle = hpPct > 0.4 ? '#34d399' : '#ef4444';
      ctx.fillRect(c.x - 18, c.y - c.radius - 8, 36 * hpPct, 5);
    }

    // Render Projectiles
    for (let p of projectiles) {
      const curX = p.sx + (p.tx - p.sx) * p.progress;
      const curY = p.sy + (p.ty - p.sy) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Floating Text
    for (let ft of floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
  }

  function updateUI() {
    const aetherEl = document.getElementById('as-aether');
    const costEl = document.getElementById('as-summon-cost');
    const waveEl = document.getElementById('as-wave');
    const livesEl = document.getElementById('as-lives');

    if (aetherEl) aetherEl.innerText = Math.floor(aether);
    if (costEl) costEl.innerText = summonCost;
    if (waveEl) waveEl.innerText = wave;
    if (livesEl) livesEl.innerText = '❤️'.repeat(castleHealth);

    // Power Level Buttons
    TYPE_KEYS.forEach(k => {
      const btn = document.getElementById(`as-up-${k.toLowerCase()}`);
      if (btn) {
        const lvl = powerLevels[k];
        const cost = lvl * 160;
        btn.innerText = `Lvl ${lvl} (${cost}A)`;
        btn.disabled = (aether < cost || lvl >= 5);
      }
    });
  }

  window.initAetherSiegeUI = function() {
    initGame();
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('as-canvas')) {
      initGame();
    }
  });
})();
